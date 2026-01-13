'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ProgramSlug = 'nclex-pn' | 'nclex-rn';

interface Program {
    id: number;
    name: string;
    slug: ProgramSlug;
}

const PROGRAMS: Program[] = [
    { id: 1, name: 'NCLEX-PN', slug: 'nclex-pn' },
    { id: 2, name: 'NCLEX-RN', slug: 'nclex-rn' }
];

interface ProgramContextType {
    activeProgram: Program;
    availablePrograms: Program[];
    switchProgram: (slug: ProgramSlug) => void;
}

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export function ProgramProvider({ children }: { children: ReactNode }) {
    // Default to NCLEX-PN
    const [activeProgram, setActiveProgram] = useState<Program>(PROGRAMS[0]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load preference from localStorage
        const savedSlug = localStorage.getItem('active_program_slug');
        if (savedSlug) {
            const found = PROGRAMS.find(p => p.slug === savedSlug);
            if (found) setActiveProgram(found);
        }
    }, []);

    const switchProgram = (slug: ProgramSlug) => {
        const found = PROGRAMS.find(p => p.slug === slug);
        if (found) {
            setActiveProgram(found);
            localStorage.setItem('active_program_slug', slug);
            // Optional: Reload page if we need to force deep data refreshes
            // window.location.reload(); 
        }
    };

    return (
        <ProgramContext.Provider value={{ activeProgram, availablePrograms: PROGRAMS, switchProgram }}>
            {children}
        </ProgramContext.Provider>
    );
}

export function useProgram() {
    const context = useContext(ProgramContext);
    if (!context) {
        throw new Error('useProgram must be used within a ProgramProvider');
    }
    return context;
}
