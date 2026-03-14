'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface DailyTask {
    type: 'episode' | 'quiz' | 'flashcards' | 'review';
    id?: number;
    category?: string;
    count?: number;
    duration?: number;
    title?: string;
}

interface UserPreferences {
    examDate: string | null;
    studyHoursPerWeek: number;
    diagnosticScore: number | null;
    hasCompletedOnboarding: boolean;
    studyPlan: { date: string; tasks: DailyTask[] }[];
    weakCategories?: string[];
}

interface OnboardingContextType {
    preferences: UserPreferences;
    updatePreferences: (updates: Partial<UserPreferences>) => void;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const defaultPreferences: UserPreferences = {
    examDate: null,
    studyHoursPerWeek: 10,
    diagnosticScore: null,
    hasCompletedOnboarding: false,
    studyPlan: []
};

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

    useEffect(() => {
        const saved = localStorage.getItem('userPreferences');
        if (saved) {
            setPreferences(JSON.parse(saved));
        }
    }, []);

    // Load from cloud on login
    useEffect(() => {
        const loadPreferencesSync = async () => {
            const authToken = localStorage.getItem('auth_token');
            if (!authToken) return;

            try {
                const response = await fetch('/api/progress', {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const prefEntry = data.progress.find((p: any) => p.content_type === 'user_preferences');
                    if (prefEntry && prefEntry.metadata) {
                        setPreferences(prev => ({
                            ...prev,
                            ...prefEntry.metadata
                        }));
                    }
                }
            } catch (error) {
                console.error('Failed to load preferences from cloud:', error);
            }
        };

        if (user) loadPreferencesSync();
    }, [user]);

    // Save to cloud on change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('userPreferences', JSON.stringify(preferences));
        }

        const saveToCloud = async () => {
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
                        contentType: 'user_preferences',
                        contentId: 'global',
                        metadata: preferences
                    })
                });
            } catch (error) {
                console.error('Failed to save preferences to cloud:', error);
            }
        };

        if (user) {
            const timer = setTimeout(saveToCloud, 5000); // Debounce
            return () => clearTimeout(timer);
        }
    }, [preferences, user]);

    const updatePreferences = (updates: Partial<UserPreferences>) => {
        setPreferences(prev => {
            const updated = { ...prev, ...updates };
            localStorage.setItem('userPreferences', JSON.stringify(updated));
            return updated;
        });
    };

    const completeOnboarding = () => {
        updatePreferences({ hasCompletedOnboarding: true });
    };

    const resetOnboarding = () => {
        setPreferences(defaultPreferences);
        localStorage.removeItem('userPreferences');
    };

    return (
        <OnboardingContext.Provider value={{ preferences, updatePreferences, completeOnboarding, resetOnboarding }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error('useOnboarding must be used within OnboardingProvider');
    }
    return context;
}
