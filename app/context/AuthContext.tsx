'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    plan: 'free' | 'premium' | 'lifetime';
    examDate?: string;
    createdAt: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string, examDate?: string) => Promise<void>;
    logout: () => void;
    isPremium: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        // TODO: Replace with actual API call
        // For now, simulate login
        const mockUser: User = {
            id: '1',
            name: 'Demo User',
            email,
            plan: 'premium',
            createdAt: new Date().toISOString(),
        };

        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
    };

    const signup = async (name: string, email: string, password: string, examDate?: string) => {
        // TODO: Replace with actual API call
        // For now, simulate signup
        const mockUser: User = {
            id: '1',
            name,
            email,
            plan: 'free', // Start with free trial
            examDate,
            createdAt: new Date().toISOString(),
        };

        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const isPremium = user?.plan === 'premium' || user?.plan === 'lifetime';

    return (
        <AuthContext.Provider value={{ user, isLoading, login, signup, logout, isPremium }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
