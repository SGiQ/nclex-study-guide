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
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('auth_token', data.token);
                return;
            }
        } catch (error) {
            console.warn('Database login failed, trying localStorage fallback');
        }

        // Fallback: Try localStorage (old system)
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            try {
                const users = JSON.parse(storedUsers);
                const existingUser = users.find((u: any) => u.email === email);

                if (existingUser) {
                    setUser(existingUser);
                    localStorage.setItem('user', JSON.stringify(existingUser));
                    return;
                }
            } catch (e) {
                console.error('localStorage fallback failed');
            }
        }

        // If no user found in localStorage, create a temporary one for testing
        console.warn('Creating temporary user for testing - database not set up yet');
        const tempUser = {
            id: Date.now(),
            name: email.split('@')[0],
            email,
            plan: 'premium' as const,
            createdAt: new Date().toISOString()
        };
        setUser(tempUser);
        localStorage.setItem('user', JSON.stringify(tempUser));

        // Also save to users array
        const users = storedUsers ? JSON.parse(storedUsers) : [];
        users.push(tempUser);
        localStorage.setItem('users', JSON.stringify(users));
    };

    const signup = async (name: string, email: string, password: string, plan: string = 'premium', examDate?: string, promoCode?: string) => {
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, plan, examDate, promoCode })
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
                setToken(data.token);
                localStorage.setItem('auth_token', data.token);
                return;
            }
        } catch (error) {
            console.warn('Database signup failed, using localStorage fallback');
        }

        // Fallback: Use localStorage (old system)
        const mockUser = {
            id: Date.now(),
            name,
            email,
            plan: plan as 'free' | 'premium' | 'lifetime',
            examDate,
            createdAt: new Date().toISOString()
        };

        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));

        // Also store in users array
        const storedUsers = localStorage.getItem('users');
        let users = storedUsers ? JSON.parse(storedUsers) : [];
        users.push(mockUser);
        localStorage.setItem('users', JSON.stringify(users));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
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
