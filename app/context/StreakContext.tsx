'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StreakData {
    currentStreak: number;
    lastVisitDate: string | null;
}

interface StreakContextType {
    currentStreak: number;
    hasCheckedInToday: boolean;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export function StreakProvider({ children }: { children: ReactNode }) {
    const [currentStreak, setCurrentStreak] = useState(0);
    const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

    useEffect(() => {
        // Load from LocalStorage
        const stored = localStorage.getItem('studyStreak');
        const today = new Date().toISOString().split('T')[0];

        let data: StreakData = stored ? JSON.parse(stored) : { currentStreak: 0, lastVisitDate: null };

        if (data.lastVisitDate === today) {
            // Already checked in today
            setCurrentStreak(data.currentStreak);
            setHasCheckedInToday(true);
        } else {
            // Check if streak is continuous (visited yesterday)
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toISOString().split('T')[0];

            if (data.lastVisitDate === yesterdayString) {
                // Streak continues!
                data.currentStreak += 1;
            } else if (data.lastVisitDate !== today) {
                // Missed a day (or first time), reset to 1
                data.currentStreak = 1;
            }

            // Save new state
            data.lastVisitDate = today;
            localStorage.setItem('studyStreak', JSON.stringify(data));

            setCurrentStreak(data.currentStreak);
            setHasCheckedInToday(true);
        }
    }, []);

    return (
        <StreakContext.Provider value={{ currentStreak, hasCheckedInToday }}>
            {children}
        </StreakContext.Provider>
    );
}

export function useStreak() {
    const context = useContext(StreakContext);
    if (context === undefined) {
        throw new Error('useStreak must be used within a StreakProvider');
    }
    return context;
}
