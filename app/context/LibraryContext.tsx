'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define what can be saved. Currently supporting Episodes and Quizzes.
// We store IDs and basic metadata to avoid fetching everything.
export type LibraryItemType = 'episode' | 'quiz' | 'flashcard';

export interface LibraryItem {
    id: string | number;
    type: LibraryItemType;
    title: string;
    description?: string;
    savedAt: number; // Timestamp
}

interface LibraryContextType {
    savedItems: LibraryItem[];
    saveItem: (item: Omit<LibraryItem, 'savedAt'>) => void;
    removeItem: (id: string | number, type: LibraryItemType) => void;
    isSaved: (id: string | number, type: LibraryItemType) => boolean;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: ReactNode }) {
    const [savedItems, setSavedItems] = useState<LibraryItem[]>([]);

    // 1. Load from LocalStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('userLibrary');
        if (stored) {
            try {
                setSavedItems(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse library from localStorage", e);
            }
        }
    }, []);

    // 2. Persist to LocalStorage whenever items change
    useEffect(() => {
        if (savedItems.length > 0) { // Avoid saving empty array on initial render before load
            localStorage.setItem('userLibrary', JSON.stringify(savedItems));
        }
    }, [savedItems]);

    const saveItem = (item: Omit<LibraryItem, 'savedAt'>) => {
        setSavedItems(prev => {
            // Avoid duplicates
            if (prev.some(i => i.id === item.id && i.type === item.type)) return prev;
            return [...prev, { ...item, savedAt: Date.now() }];
        });
    };

    const removeItem = (id: string | number, type: LibraryItemType) => {
        setSavedItems(prev => prev.filter(i => !(i.id === id && i.type === type)));
    };

    const isSaved = (id: string | number, type: LibraryItemType) => {
        return savedItems.some(i => i.id === id && i.type === type);
    };

    return (
        <LibraryContext.Provider value={{ savedItems, saveItem, removeItem, isSaved }}>
            {children}
        </LibraryContext.Provider>
    );
}

export function useLibrary() {
    const context = useContext(LibraryContext);
    if (context === undefined) {
        throw new Error('useLibrary must be used within a LibraryProvider');
    }
    return context;
}
