'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default function SlideViewerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [deck, setDeck] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/slides')
            .then(r => r.json())
            .then(data => {
                // Find slide deck by Episode ID (preferred) or ID
                const epId = parseInt(id);
                // API returns snake_case episode_id
                const found = data.find((s: any) => s.episode_id === epId || s.id === epId);

                if (found) {
                    setDeck(found);
                }
                setLoading(false);
            })
            .catch((e) => {
                console.error("Error loading slides:", e);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col h-dvh bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white overflow-hidden items-center justify-center">
                <div className="text-4xl mb-4">📊</div>
                <div className="text-white/60">Loading slide deck...</div>
            </div>
        );
    }

    if (!deck) return notFound();

    return (
        <div className="flex flex-col h-dvh bg-[#0A0A0F] text-white">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-[#16161C] flex-shrink-0 z-20">
                <Link href="/library" className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span> Library
                </Link>
                <div className="font-bold text-sm truncate max-w-[150px] md:max-w-[300px] text-center">
                    {deck.title}
                </div>
                <div className="flex items-center gap-2">
                    <a 
                        href={`/api/slides/${deck.id}/pdf`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                    >
                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        <span className="hidden md:inline">Full Screen</span>
                    </a>
                </div>
            </header>

            {/* PDF Viewer */}
            <main className="flex-1 w-full relative overflow-hidden bg-gray-100 dark:bg-black flex items-center justify-center p-0 md:p-4">
                <div className="w-full h-full relative overflow-auto touch-auto scrollbar-hide">
                    <iframe
                        src={`/api/slides/${deck.id}/pdf#toolbar=0&navpanes=0&scrollbar=0`}
                        className="w-full h-full border-0 min-h-screen md:min-h-0"
                        title={deck.title}
                        style={{ webkitOverflowScrolling: 'touch' } as any}
                    />
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                    <p className="text-white/50 animate-pulse uppercase text-[10px] font-black tracking-widest">Loading Document...</p>
                </div>
            </main>
        </div>
    );
}
