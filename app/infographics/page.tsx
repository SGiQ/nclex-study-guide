'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Infographic {
    id: number;
    episode_id: number | null;
    title: string;
    file_name: string;
    file_type: string;
    created_at: string;
}

export default function InfographicsLibraryPage() {
    const [infographics, setInfographics] = useState<Infographic[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/infographics')
            .then(res => res.json())
            .then(data => {
                setInfographics(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching infographics:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-dvh bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white font-sans p-6 pb-24">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <Link href="/dashboard" className="text-sm font-medium text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white mb-2 block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">
                        Infographics
                    </h1>
                    <p className="text-gray-600 dark:text-white/60 text-sm mt-1">
                        Visual summaries and quick reference guides.
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-16">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="text-gray-600 dark:text-white/50">Loading infographics...</p>
                    </div>
                ) : infographics.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-gray-100 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/5 border-dashed">
                        <div className="text-6xl mb-4">📊</div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white/80 mb-2">No Infographics Yet</h3>
                        <p className="text-gray-600 dark:text-white/50 text-sm">
                            Infographics will appear here once uploaded.
                        </p>
                    </div>
                ) : (
                    infographics.map((item) => (
                        <div
                            key={item.id}
                            className="group relative aspect-[4/3] bg-white dark:bg-[#16161C] rounded-2xl overflow-hidden border border-gray-200 dark:border-white/5 hover:border-pink-500/50 transition-all shadow-sm dark:shadow-none"
                        >
                            <Link
                                href={`/infographics/${item.id}`}
                                className="absolute inset-0 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-900/20 active:scale-[0.99] transition-all block"
                            >
                                <img
                                    src={`/api/infographics/${item.id}/image`}
                                    alt={item.title}
                                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/30 to-transparent dark:from-black/95 dark:via-black/30 dark:to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <h3 className="text-base font-bold leading-tight mb-2 text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-300 transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 dark:text-white/50 font-medium uppercase tracking-wider">
                                        {item.episode_id ? `Episode ${item.episode_id}` : 'Quick Reference'}
                                    </p>
                                </div>
                            </Link>

                            {/* Delete Button */}
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (confirm(`Delete "${item.title}"? This cannot be undone.`)) {
                                        try {
                                            const res = await fetch(`/api/infographics/${item.id}`, {
                                                method: 'DELETE',
                                            });
                                            if (res.ok) {
                                                setInfographics(infographics.filter(i => i.id !== item.id));
                                            } else {
                                                alert('Failed to delete infographic');
                                            }
                                        } catch (error) {
                                            alert('Error deleting infographic');
                                        }
                                    }
                                }}
                                className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete infographic"
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
