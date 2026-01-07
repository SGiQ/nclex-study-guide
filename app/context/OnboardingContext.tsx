'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

    useEffect(() => {
        const saved = localStorage.getItem('userPreferences');
        if (saved) {
            setPreferences(JSON.parse(saved));
        }
    }, []);

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
