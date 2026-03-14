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

export interface AudioResult {
    episodeId: number;
    completed: boolean;
    completedAt?: string;
    metadata?: any;
}

interface ProgressContextType {
    quizResults: Record<number, QuizResult>;
    audioProgress: Record<number, AudioResult>;
    saveQuizResult: (episodeId: number, score: number, total: number) => Promise<void>;
    saveAudioProgress: (episodeId: number, completed: boolean, metadata?: any) => Promise<void>;
    getQuizResult: (episodeId: number) => QuizResult | undefined;
    getAudioProgress: (episodeId: number) => AudioResult | undefined;
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
    const [audioProgress, setAudioProgress] = useState<Record<number, AudioResult>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('audio_progress');
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
    const audioRef = React.useRef(audioProgress);

    // Keep ref updated
    // Save to localStorage on change (for guest support)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('quiz_results', JSON.stringify(quizResults));
        }
        resultsRef.current = quizResults;
    }, [quizResults]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('audio_progress', JSON.stringify(audioProgress));
        }
        audioRef.current = audioProgress;
    }, [audioProgress]);

    // Load progress from database on mount or auth change
    useEffect(() => {
        const initProgress = async () => {
            const token = getAuthToken();
            if (!token) {
                // User logged out or is guest. Clear in-memory state to prevent leakage.
                setQuizResults({});
                setAudioProgress({});
                // IMPORTANT: Do NOT clear localStorage here anymore. 
                // That is handled by AuthContext.logout for explicit logouts.
                // Clearing here causes data loss during refresh transitions.
                setIsLoading(false);
                return;
            }

            // Sync existing guest data if any
            const localQuizzes = resultsRef.current;
            const localAudio = audioRef.current;

            if (Object.keys(localQuizzes).length > 0 || Object.keys(localAudio).length > 0) {
                await syncGuestProgress(localQuizzes, localAudio, token);
            }

            await loadProgress(token);
        };

        initProgress();
    }, [user]);

    const syncGuestProgress = async (quizzes: Record<number, QuizResult>, audio: Record<number, AudioResult>, token: string) => {
        // Build sync promises
        const quizPromises = Object.values(quizzes).map(result => {
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
            }).catch(e => console.error('Sync quiz error:', e));
        });

        const audioPromises = Object.values(audio).map(prog => {
            return fetch('/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    contentType: 'audio',
                    contentId: prog.episodeId.toString(),
                    completed: prog.completed,
                    metadata: prog.metadata
                })
            }).catch(e => console.error('Sync audio error:', e));
        });

        await Promise.all([...quizPromises, ...audioPromises]);
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
                const currentAudioProgress: Record<number, AudioResult> = {};

                data.progress.forEach((p: any) => {
                    const parsedId = parseInt(p.content_id);
                    if (p.content_type === 'quiz') {
                        quizProgress[parsedId] = {
                            episodeId: parsedId,
                            score: p.score || 0,
                            total: p.total || 0,
                            completedAt: p.completed_at,
                            bestScore: (p.best_score !== null && p.best_score !== undefined) ? p.best_score : (p.score || 0),
                            attemptCount: p.attempt_count || 1
                        };
                    } else if (p.content_type === 'audio') {
                        currentAudioProgress[parsedId] = {
                            episodeId: parsedId,
                            completed: p.completed,
                            completedAt: p.completed_at,
                            metadata: p.metadata
                        };
                    }
                });

                setQuizResults(quizProgress);
                setAudioProgress(currentAudioProgress);
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

    const saveAudioProgress = async (episodeId: number, completed: boolean, metadata?: any) => {
        // Never downgrade: once completed, always completed regardless of re-listening
        const existing = audioRef.current[episodeId];
        const finalCompleted = existing?.completed === true ? true : completed;

        const result: AudioResult = {
            episodeId,
            completed: finalCompleted,
            // Preserve the original completion timestamp
            completedAt: finalCompleted ? (existing?.completedAt || new Date().toISOString()) : undefined,
            metadata
        };

        // Update local state immediately so readiness score re-renders
        setAudioProgress(prev => ({ ...prev, [episodeId]: result }));

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
                        contentType: 'audio',
                        contentId: episodeId.toString(),
                        completed: finalCompleted,
                        metadata
                    })
                });
            } catch (error) {
                console.error('Failed to save audio progress:', error);
            }
        }
    };

    const getQuizResult = (episodeId: number) => {
        return quizResults[episodeId];
    };

    const getAudioProgress = (episodeId: number) => {
        return audioProgress[episodeId];
    };

    return (
        <ProgressContext.Provider value={{ quizResults, audioProgress, saveQuizResult, saveAudioProgress, getQuizResult, getAudioProgress, isLoading }}>
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
