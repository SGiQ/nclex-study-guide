'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Note {
    id: number;
    label: string;
    content: string;
    context: string;
    timestamp: string;
}

interface NotesContextType {
    isOpen: boolean;
    toggleNotes: () => void;
    notes: Note[];
    addNote: (label: string, content: string, context?: string) => Promise<void>;
    isLoading: boolean;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notes, setNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const { user } = useAuth();

    // Load notes when user changes
    useEffect(() => {
        if (user) {
            fetchNotes();
        } else {
            setNotes([]);
        }
    }, [user]);

    const fetchNotes = async () => {
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) return;

        try {
            const res = await fetch('/api/notes', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotes(data);
            }
        } catch (e) {
            console.error('Failed to fetch notes', e);
        }
    };

    const toggleNotes = () => setIsOpen(prev => !prev);

    const addNote = async (label: string, content: string, context: string = 'General') => {
        const authToken = localStorage.getItem('auth_token');
        if (!authToken) {
            // Guest mode: store in local state only for now
            const guestNote: Note = {
                id: Date.now(),
                label,
                content,
                context,
                timestamp: new Date().toISOString()
            };
            setNotes(prev => [guestNote, ...prev]);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ label, content, context }),
            });

            if (res.ok) {
                const { note } = await res.json();
                setNotes(prev => [note, ...prev]);
            }
        } catch (e) {
            console.error('Failed to add note', e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <NotesContext.Provider value={{ isOpen, toggleNotes, notes, addNote, isLoading }}>
            {children}
        </NotesContext.Provider>
    );
}

export function useNotes() {
    const context = useContext(NotesContext);
    if (context === undefined) {
        throw new Error('useNotes must be used within a NotesProvider');
    }
    return context;
}
