'use client';

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

// This would normally fetch from an API, but for now we'll use a client-side approach
export default function MindMapViewerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [mindmap, setMindmap] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [zoom, setZoom] = useState(100);

    // Fetch mindmap data
    useState(() => {
        fetch('/api/mindmaps')
            .then(r => r.json())
            .then(data => {
                const found = data.find((m: any) => m.id === parseInt(id));
                if (found) {
                    setMindmap(found);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">🧠</div>
                    <div className="text-white/60">Loading mind map...</div>
                </div>
            </div>
        );
    }

    if (!mindmap) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-[#0A0A0F]/80 backdrop-blur border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/mindmaps"
                            className="h-10 w-10 grid place-items-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            ←
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold">{mindmap.title}</h1>
                            {mindmap.episodeId && (
                                <p className="text-xs text-white/50">Episode {mindmap.episodeId}</p>
                            )}
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setZoom(Math.max(50, zoom - 10))}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                        >
                            −
                        </button>
                        <span className="text-sm text-white/60 w-12 text-center">{zoom}%</span>
                        <button
                            onClick={() => setZoom(Math.min(200, zoom + 10))}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                        >
                            +
                        </button>
                        <button
                            onClick={() => setZoom(100)}
                            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm ml-2"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </header>

            {/* Mind Map Display */}
            <main className="p-6 overflow-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                        <div className="w-full h-[calc(100vh-200px)] flex items-center justify-center">
                            <img
                                src={`/api/mindmaps/${id}/image`}
                                alt={mindmap.title}
                                style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center' }}
                                className="max-w-full max-h-full object-contain transition-transform duration-200"
                            />
                        </div>
                    </div>

                    {/* Download Button */}
                    <div className="mt-6 text-center">
                        <a
                            href={`/api/mindmaps/${id}/image`}
                            download
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-colors"
                        >
                            <span>📥</span>
                            Download Mind Map
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
}
