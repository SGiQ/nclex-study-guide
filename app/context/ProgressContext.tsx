'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAuthToken } from './AuthContext';

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
    const [quizResults, setQuizResults] = useState<Record<number, QuizResult>>({});
    const [isLoading, setIsLoading] = useState(true);

    // Load progress from database on mount
    useEffect(() => {
        loadProgress();
    }, []);

    const loadProgress = async () => {
        const token = getAuthToken();
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/progress', {
                headers: {
                    'Authorization': `Bearer ${token}`
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
                            bestScore: p.best_score,
                            attemptCount: p.attempt_count
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
                await fetch('/api/progress', {
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
