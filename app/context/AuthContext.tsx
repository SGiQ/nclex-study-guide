'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: number;
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
    signup: (name: string, email: string, password: string, plan?: string, examDate?: string, promoCode?: string) => Promise<void>;
    logout: () => void;
    isPremium: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Check for existing token and fetch user
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
            setToken(storedToken);
            fetchUser(storedToken);
        } else {
            // Fallback: Check for old localStorage user (backward compatibility)
            const oldUser = localStorage.getItem('user');
            if (oldUser) {
                try {
                    setUser(JSON.parse(oldUser));
                } catch (e) {
                    console.error('Failed to parse old user data');
                }
            }
            setIsLoading(false);
        }
    }, []);

    const fetchUser = async (authToken: string) => {
        try {
            const response = await fetch('/api/auth/me', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                // Token invalid, clear it
                localStorage.removeItem('auth_token');
                setToken(null);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed. Please try again.');
        }

        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
    };

    const signup = async (name: string, email: string, password: string, plan: string = 'premium', examDate?: string, promoCode?: string) => {
        // Enforce minimum password length
        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters.');
        }

        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, plan, examDate, promoCode })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Signup failed. Please try again.');
        }

        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('auth_token', data.token);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        if (typeof window !== 'undefined') {
            // Clear core auth
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            
            // Clear progress data managed by ProgressContext
            localStorage.removeItem('quiz_results');
            localStorage.removeItem('audio_progress');
            
            // Clear streak data managed by StreakContext
            localStorage.removeItem('studyStreak');

            // Clear audio state managed by PlayerContext & Player
            localStorage.removeItem('nclex_last_episode');
            
            // Clear all episode-specific positions and bests
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('audio_progress_') || key.startsWith('audio_best_')) {
                    localStorage.removeItem(key);
                }
            });
        }
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

// Export token getter for use in other contexts
export function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
}
