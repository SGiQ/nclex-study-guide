'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// SM-2 Algorithm Implementation
interface ReviewData {
    cardId: string;
    cardType: 'flashcard' | 'quiz';
    episodeId?: number;
    lastReviewed: string; // ISO date
    nextReview: string; // ISO date
    easeFactor: number; // 1.3 to 2.5+
    interval: number; // days until next review
    repetitions: number; // consecutive correct reviews
    status: 'new' | 'learning' | 'mastered';
}

interface SRSContextType {
    reviewData: Record<string, ReviewData>;
    getDueCards: () => ReviewData[];
    getDueCount: () => number;
    recordReview: (cardId: string, difficulty: 'again' | 'hard' | 'good' | 'easy') => void;
    getCardStatus: (cardId: string) => ReviewData | null;
    getMasteredCount: () => number;
    getLearningCount: () => number;
    getNewCount: () => number;
    initializeCard: (cardId: string, cardType: 'flashcard' | 'quiz', episodeId?: number) => void;
}

const SRSContext = createContext<SRSContextType | undefined>(undefined);

export function SRSProvider({ children }: { children: ReactNode }) {
    const [reviewData, setReviewData] = useState<Record<string, ReviewData>>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('srs-review-data');
            if (stored) {
                try {
                    return JSON.parse(stored);
                } catch (e) {
                    return {};
                }
            }
        }
        return {};
    });

    const { user } = useAuth();

    // Load from database on login
    useEffect(() => {
        const loadSRSSync = async () => {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) return;

            try {
                const response = await fetch('/api/progress', {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const srsEntry = data.progress.find((p: any) => p.content_type === 'srs_system');
                    if (srsEntry && srsEntry.metadata) {
                        setReviewData(prev => ({
                            ...prev,
                            ...srsEntry.metadata
                        }));
                    }
                }
            } catch (error) {
                console.error('Failed to load SRS from cloud:', error);
            }
        };

        if (user) loadSRSSync();
    }, [user]);

    // Save to localStorage AND cloud on change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('srs-review-data', JSON.stringify(reviewData));
        }

        const saveToCloud = async () => {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken || Object.keys(reviewData).length === 0) return;

            try {
                await fetch('/api/progress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        contentType: 'srs_system',
                        contentId: 'global',
                        metadata: reviewData
                    })
                });
            } catch (error) {
                console.error('Failed to save SRS to cloud:', error);
            }
        };

        if (user) {
            const timer = setTimeout(saveToCloud, 2000); // Debounce
            return () => clearTimeout(timer);
        }
    }, [reviewData, user]);

    // Initialize a new card
    const initializeCard = (cardId: string, cardType: 'flashcard' | 'quiz', episodeId?: number) => {
        if (reviewData[cardId]) return; // Already initialized

        const newCard: ReviewData = {
            cardId,
            cardType,
            episodeId,
            lastReviewed: new Date().toISOString(),
            nextReview: new Date().toISOString(), // Due immediately
            easeFactor: 2.5,
            interval: 0,
            repetitions: 0,
            status: 'new',
        };

        setReviewData(prev => ({ ...prev, [cardId]: newCard }));
    };

    // SM-2 Algorithm: Calculate next review
    const calculateNextReview = (
        card: ReviewData,
        difficulty: 'again' | 'hard' | 'good' | 'easy'
    ): ReviewData => {
        let { easeFactor, interval, repetitions } = card;
        const now = new Date();

        // Adjust ease factor based on difficulty
        if (difficulty === 'again') {
            easeFactor = Math.max(1.3, easeFactor - 0.2);
            repetitions = 0;
            interval = 0;
        } else if (difficulty === 'hard') {
            easeFactor = Math.max(1.3, easeFactor - 0.15);
            interval = Math.max(1, interval * 1.2);
        } else if (difficulty === 'good') {
            if (repetitions === 0) {
                interval = 1;
            } else if (repetitions === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easeFactor);
            }
            repetitions += 1;
        } else if (difficulty === 'easy') {
            easeFactor = Math.min(2.5, easeFactor + 0.15);
            if (repetitions === 0) {
                interval = 4;
            } else {
                interval = Math.round(interval * easeFactor * 1.3);
            }
            repetitions += 1;
        }

        // Calculate next review date
        const nextReview = new Date(now);
        nextReview.setDate(nextReview.getDate() + interval);

        // Determine status
        let status: 'new' | 'learning' | 'mastered' = 'learning';
        if (repetitions === 0) {
            status = 'new';
        } else if (interval >= 21) {
            status = 'mastered';
        }

        return {
            ...card,
            lastReviewed: now.toISOString(),
            nextReview: nextReview.toISOString(),
            easeFactor,
            interval,
            repetitions,
            status,
        };
    };

    // Record a review
    const recordReview = (cardId: string, difficulty: 'again' | 'hard' | 'good' | 'easy') => {
        const card = reviewData[cardId];
        if (!card) return;

        const updatedCard = calculateNextReview(card, difficulty);
        setReviewData(prev => ({ ...prev, [cardId]: updatedCard }));
    };

    // Get cards due for review
    const getDueCards = (): ReviewData[] => {
        const now = new Date();
        return Object.values(reviewData).filter(card => {
            const nextReview = new Date(card.nextReview);
            return nextReview <= now;
        });
    };

    // Get count of due cards
    const getDueCount = (): number => {
        return getDueCards().length;
    };

    // Get card status
    const getCardStatus = (cardId: string): ReviewData | null => {
        return reviewData[cardId] || null;
    };

    // Get counts by status
    const getMasteredCount = (): number => {
        return Object.values(reviewData).filter(c => c.status === 'mastered').length;
    };

    const getLearningCount = (): number => {
        return Object.values(reviewData).filter(c => c.status === 'learning').length;
    };

    const getNewCount = (): number => {
        return Object.values(reviewData).filter(c => c.status === 'new').length;
    };

    return (
        <SRSContext.Provider
            value={{
                reviewData,
                getDueCards,
                getDueCount,
                recordReview,
                getCardStatus,
                getMasteredCount,
                getLearningCount,
                getNewCount,
                initializeCard,
            }}
        >
            {children}
        </SRSContext.Provider>
    );
}

export function useSRS() {
    const context = useContext(SRSContext);
    if (context === undefined) {
        throw new Error('useSRS must be used within an SRSProvider');
    }
    return context;
}
