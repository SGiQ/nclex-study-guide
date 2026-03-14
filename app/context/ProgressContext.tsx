'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthToken, useAuth } from './AuthContext';

interface QuizResult {
    episodeId: number;
    score: number;
    total: number;
    completedAt: string;
    bestScore?: number;
    attemptCount?: number;
}

interface ProgressContextType {
    quizResults: Record<number, QuizResult>;
    saveQuizResult: (episodeId: number, score: number, total: number) => Promise<void>;
    getQuizResult: (episodeId: number) => QuizResult | undefined;
    isLoading: boolean;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
    const [quizResults, setQuizResults] = useState<Record<number, QuizResult>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('quiz_results');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (e) {
                    return {};
                }
            }
        }
        return {};
    });
    const [isLoading, setIsLoading] = useState(true);

    const { user } = useAuth();
    const resultsRef = React.useRef(quizResults);

    // Keep ref updated
    // Save to localStorage on change (for guest support)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('quiz_results', JSON.stringify(quizResults));
        }
        resultsRef.current = quizResults;
    }, [quizResults]);

    // Load progress from database on mount or auth change
    useEffect(() => {
        const initProgress = async () => {
            const token = getAuthToken();
            if (!token) {
                // If logging out, maybe clear progress? Or keep it? 
                // For now, if no token, we assume guest mode or logout.
                // If we want to support guest mode persistence across reloads, we'd need localStorage here.
                // But for now, just stop loading.
                setIsLoading(false);
                return;
            }

            // Sync existing guest data if any
            const localData = resultsRef.current;
            if (Object.keys(localData).length > 0) {
                // We have data in memory. Determine if it needs syncing.
                // Simple heuristic: If we just logged in (token exists) and have data, 
                // we push it to server to be safe. Upsert handles duplicates.
                await syncGuestProgress(localData, token);
            }

            await loadProgress(token);
        };

        initProgress();
    }, [user]);

    const syncGuestProgress = async (data: Record<number, QuizResult>, token: string) => {
        const promises = Object.values(data).map(result => {
            return fetch('/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contentType: 'quiz',
                    contentId: result.episodeId.toString(),
                    completed: true,
                    score: result.score,
                    total: result.total
                })
            }).catch(e => console.error('Sync error:', e));
        });
        await Promise.all(promises);
    };

    const loadProgress = async (token?: string) => {
        const authToken = token || getAuthToken();
        if (!authToken) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/progress', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const quizProgress: Record<number, QuizResult> = {};

                data.progress
                    .filter((p: any) => p.content_type === 'quiz')
                    .forEach((p: any) => {
                        quizProgress[parseInt(p.content_id)] = {
                            episodeId: parseInt(p.content_id),
                            score: p.score || 0,
                            total: p.total || 0,
                            completedAt: p.completed_at,
                            bestScore: (p.best_score !== null && p.best_score !== undefined) ? p.best_score : (p.score || 0),
                            attemptCount: p.attempt_count || 1
                        };
                    });

                setQuizResults(quizProgress);
            }
        } catch (error) {
            console.error('Failed to load progress:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveQuizResult = async (episodeId: number, score: number, total: number) => {
        const result: QuizResult = {
            episodeId,
            score,
            total,
            completedAt: new Date().toISOString()
        };

        // Update local state immediately
        setQuizResults(prev => ({ ...prev, [episodeId]: result }));

        // Save to database
        const token = getAuthToken();
        if (token) {
            try {
                const response = await fetch('/api/progress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        contentType: 'quiz',
                        contentId: episodeId.toString(),
                        completed: true,
                        score,
                        total
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.progress) {
                        const p = data.progress;
                        const validResult: QuizResult = {
                            episodeId: parseInt(p.content_id),
                            score: p.score || 0,
                            total: p.total || 0,
                            completedAt: p.completed_at,
                            bestScore: p.best_score,
                            attemptCount: p.attempt_count
                        };
                        // Update local state with server response (inclusive of valid bestScore)
                        setQuizResults(prev => ({ ...prev, [episodeId]: validResult }));
                    }
                }
            } catch (error) {
                console.error('Failed to save progress:', error);
            }
        }
    };

    const getQuizResult = (episodeId: number) => {
        return quizResults[episodeId];
    };

    return (
        <ProgressContext.Provider value={{ quizResults, saveQuizResult, getQuizResult, isLoading }}>
            {children}
        </ProgressContext.Provider>
    );
}

export function useProgress() {
    const context = useContext(ProgressContext);
    if (context === undefined) {
        throw new Error('useProgress must be used within a ProgressProvider');
    }
    return context;
}
