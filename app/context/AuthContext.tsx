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
        // For now, check if user exists in localStorage
        const storedUsers = localStorage.getItem('users');
        let users: User[] = [];

        if (storedUsers) {
            users = JSON.parse(storedUsers);
        }

        // Find user by email
        const existingUser = users.find(u => u.email === email);

        if (existingUser) {
            // User found - log them in with their actual data
            setUser(existingUser);
            localStorage.setItem('user', JSON.stringify(existingUser));
        } else {
            // User not found - create demo user (for backward compatibility)
            const mockUser: User = {
                id: '1',
                name: email.split('@')[0], // Use email prefix as name
                email,
                plan: 'premium',
                createdAt: new Date().toISOString(),
            };
            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));
        }
    };

    const signup = async (name: string, email: string, password: string, examDate?: string) => {
        // TODO: Replace with actual API call
        // For now, simulate signup with premium access (free trial)
        const mockUser: User = {
            id: Date.now().toString(),
            name,
            email,
            plan: 'premium', // Give premium access during free trial
            examDate,
            createdAt: new Date().toISOString(),
        };

        // Store user in current session
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));

        // Also store in users array for login lookup
        const storedUsers = localStorage.getItem('users');
        let users: User[] = [];

        if (storedUsers) {
            users = JSON.parse(storedUsers);
        }

        // Check if user already exists
        const existingIndex = users.findIndex(u => u.email === email);
        if (existingIndex >= 0) {
            // Update existing user
            users[existingIndex] = mockUser;
        } else {
            // Add new user
            users.push(mockUser);
        }

        localStorage.setItem('users', JSON.stringify(users));
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
