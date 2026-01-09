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
                    <span>←</span> Library
                </Link>
                <div className="font-bold text-sm truncate max-w-[200px]">
                    {deck.title}
                </div>
                <div className="w-16"></div> {/* Spacer */}
            </header>

            {/* PDF Viewer */}
            <main className="flex-1 w-full relative overflow-auto bg-gray-100 dark:bg-black flex items-center justify-center p-4">
                <iframe
                    src={`/api/slides/${deck.id}/pdf#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-0"
                    title={deck.title}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                    <p className="text-white/50 animate-pulse">Loading Document...</p>
                </div>
            </main>
        </div>
    );
}
