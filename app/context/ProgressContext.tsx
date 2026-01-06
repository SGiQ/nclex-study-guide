'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface QuizResult {
    episodeId: number;
    score: number;
    total: number;
    completedAt: string; // ISO date
}

interface ProgressContextType {
    quizResults: Record<number, QuizResult>; // Keyed by episodeId
    saveQuizResult: (episodeId: number, score: number, total: number) => void;
    getQuizResult: (episodeId: number) => QuizResult | undefined;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
    const [quizResults, setQuizResults] = useState<Record<number, QuizResult>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('quiz_progress');
        if (saved) {
            try {
                setQuizResults(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse quiz progress', e);
            }
        }
        setIsLoaded(true);
    }, []);

    const saveQuizResult = (episodeId: number, score: number, total: number) => {
        const result: QuizResult = {
            episodeId,
            score,
            total,
            completedAt: new Date().toISOString()
        };

        setQuizResults(prev => {
            const next = { ...prev, [episodeId]: result };
            localStorage.setItem('quiz_progress', JSON.stringify(next));
            return next;
        });
    };

    const getQuizResult = (episodeId: number) => {
        return quizResults[episodeId];
    };

    return (
        <ProgressContext.Provider value={{ quizResults, saveQuizResult, getQuizResult }}>
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
