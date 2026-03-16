'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
    const { user } = useAuth();
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

    // Load from cloud on login
    useEffect(() => {
        const loadStreakSync = async () => {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) return;

            try {
                const response = await fetch('/api/progress', {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const streakEntry = data.progress.find((p: any) => p.content_type === 'user_streak');
                    if (streakEntry && streakEntry.metadata) {
                        const cloudStreak = streakEntry.metadata.currentStreak;
                        if (cloudStreak > currentStreak) {
                            setCurrentStreak(cloudStreak);
                            // Also update localStorage to stay in sync
                            const stored = localStorage.getItem('studyStreak');
                            const streakData = stored ? JSON.parse(stored) : { currentStreak: 0, lastVisitDate: null };
                            streakData.currentStreak = cloudStreak;
                            localStorage.setItem('studyStreak', JSON.stringify(streakData));
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load streak from cloud:', error);
            }
        };

        if (user) {
            loadStreakSync();
        } else {
            // Reset state on logout
            setCurrentStreak(0);
            setHasCheckedInToday(false);
        }
    }, [user]); // Removed currentStreak from deps to avoid infinite loop or strange syncs

    // Save to cloud on change
    useEffect(() => {
        const saveStreakSync = async () => {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) return;

            try {
                await fetch('/api/progress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        contentType: 'user_streak',
                        contentId: 'global',
                        metadata: { currentStreak, lastVisitDate: new Date().toISOString().split('T')[0] }
                    })
                });
            } catch (error) {
                console.error('Failed to save streak to cloud:', error);
            }
        };

        if (user && currentStreak > 0) {
            saveStreakSync();
        }
    }, [currentStreak, user]);

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
