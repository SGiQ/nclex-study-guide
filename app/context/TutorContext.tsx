'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TutorContextType {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    context: string | null;
    setContext: (context: string | null) => void;
    openChatWithContext: (contextPrompt: string) => void;
}

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export function TutorProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [context, setContext] = useState<string | null>(null);

    const openChatWithContext = (contextPrompt: string) => {
        setContext(contextPrompt);
        setIsOpen(true);
    };

    return (
        <TutorContext.Provider value={{ isOpen, setIsOpen, context, setContext, openChatWithContext }}>
            {children}
        </TutorContext.Provider>
    );
}

export function useTutor() {
    const context = useContext(TutorContext);
    if (context === undefined) {
        throw new Error('useTutor must be used within a TutorProvider');
    }
    return context;
}
