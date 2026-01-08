'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Mindmap {
    id: number;
    episode_id: number | null;
    title: string;
    file_name: string;
    file_type: string;
    created_at: string;
}

export default function MindMapsLibraryPage() {
    const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/mindmaps')
            .then(res => res.json())
            .then(data => {
                setMindmaps(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching mindmaps:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-dvh bg-[#0A0A0F] text-white font-sans p-6 pb-24">
            {/* Header */}
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <Link href="/dashboard" className="text-sm font-medium text-white/50 hover:text-white mb-2 block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
                        Mind Maps
                    </h1>
                    <p className="text-white/60 text-sm mt-1">
                        Visual concept maps for complex topics.
                    </p>
                </div>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-16">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="text-white/50">Loading mind maps...</p>
                    </div>
                ) : mindmaps.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <div className="text-6xl mb-4">🧠</div>
                        <h3 className="text-xl font-bold text-white/80 mb-2">No Mind Maps Yet</h3>
                        <p className="text-white/50 text-sm">
                            Mind maps will appear here once uploaded.
                        </p>
                    </div>
                ) : (
                    mindmaps.map((item) => (
                        <div
                            key={item.id}
                            className="group relative aspect-[4/3] bg-[#16161C] rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all"
                        >
                            <Link
                                href={`/mindmaps/${item.id}`}
                                className="absolute inset-0 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/20 active:scale-[0.99] transition-all block"
                            >
                                {/* Image Thumbnail */}
                                <img
                                    src={`/api/mindmaps/${item.id}/image`}
                                    alt={item.title}
                                    className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                                />

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                                {/* Title */}
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="font-bold text-white text-lg line-clamp-2 drop-shadow-lg">
                                        {item.title}
                                    </h3>
                                    {item.episode_id && (
                                        <p className="text-xs text-purple-300 mt-1">Episode {item.episode_id}</p>
                                    )}
                                </div>
                            </Link>

                            {/* Delete Button */}
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (confirm(`Delete "${item.title}"? This cannot be undone.`)) {
                                        try {
                                            const res = await fetch(`/api/mindmaps/${item.id}`, {
                                                method: 'DELETE',
                                            });
                                            if (res.ok) {
                                                setMindmaps(mindmaps.filter(m => m.id !== item.id));
                                            } else {
                                                alert('Failed to delete mind map');
                                            }
                                        } catch (error) {
                                            alert('Error deleting mind map');
                                        }
                                    }
                                }}
                                className="absolute top-2 right-2 z-10 w-8 h-8 bg-red-600 hover:bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete mind map"
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
