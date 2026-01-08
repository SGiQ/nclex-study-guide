'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Slide {
    id: number;
    episode_id: number | null;
    title: string;
    file_name: string;
    file_type: string;
    created_at: string;
}

export default function SlidesLibraryPage() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/slides')
            .then(res => res.json())
            .then(data => {
                setSlides(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching slides:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-dvh bg-[#0A0A0F] text-white font-sans p-6 pb-24">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <Link href="/" className="text-sm font-medium text-white/50 hover:text-white mb-2 block">
                        ← Back Home
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        Slide Decks
                    </h1>
                    <p className="text-white/60 text-sm mt-1">
                        Review detailed notes and diagrams.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="text-white/50">Loading slide decks...</p>
                    </div>
                ) : slides.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <div className="text-4xl mb-4">📂</div>
                        <h3 className="text-lg font-bold text-white/80">No Slide Decks Yet</h3>
                        <p className="text-white/50 text-sm mt-2">
                            Check back later or upload one in Admin.
                        </p>
                    </div>
                ) : (
                    slides.map((deck) => (
                        <div
                            key={deck.id}
                            className="group relative bg-[#16161C] rounded-2xl p-5 border border-white/5 hover:border-blue-500/50 transition-all"
                        >
                            <Link
                                href={`/slides/${deck.id}`}
                                className="block hover:-translate-y-1 active:scale-[0.99] transition-all"
                            >
                                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                    ↗
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xl shadow-lg mb-4">
                                    📊
                                </div>

                                <h3 className="text-lg font-bold leading-tight mb-1 group-hover:text-blue-400 transition-colors">
                                    {deck.title}
                                </h3>
                                <p className="text-xs text-white/40 font-medium uppercase tracking-wider">
                                    {deck.episode_id ? `Episode ${deck.episode_id}` : 'Slide Deck'}
                                </p>

                                <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
                                    <span>PDF</span>
                                    <span>•</span>
                                    <span>{new Date(deck.created_at).toLocaleDateString()}</span>
                                </div>
                            </Link>

                            {/* Delete Button */}
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (confirm(`Delete "${deck.title}"? This cannot be undone.`)) {
                                        try {
                                            const res = await fetch(`/api/slides/${deck.id}`, {
                                                method: 'DELETE',
                                            });
                                            if (res.ok) {
                                                setSlides(slides.filter(s => s.id !== deck.id));
                                            } else {
                                                alert('Failed to delete slide deck');
                                            }
                                        } catch (error) {
                                            alert('Error deleting slide deck');
                                        }
                                    }
                                }}
                                className="absolute top-2 right-12 z-10 w-8 h-8 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete slide deck"
                            >
                                🗑️
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
