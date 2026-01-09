'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function MindMapViewerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [mindmap, setMindmap] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/mindmaps')
            .then(r => r.json())
            .then(data => {
                // Find mindmap by Episode ID (preferred) or ID
                const epId = parseInt(id);
                // API returns snake_case episode_id
                const found = data.find((m: any) => m.episode_id === epId || m.id === epId);

                if (found) {
                    setMindmap(found);
                }
                setLoading(false);
            })
            .catch((e) => {
                console.error("Error loading mindmap:", e);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white items-center justify-center">
                <div className="text-4xl mb-4">🧠</div>
                <div className="text-white/60">Loading mind map...</div>
            </div>
        );
    }

    if (!mindmap) return notFound();

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 flex-shrink-0 z-10">
                <Link href="/library" className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <span>←</span> Library
                </Link>
                <div className="font-bold text-sm truncate max-w-[300px]">
                    {mindmap.title}
                </div>
                <a
                    href={`/api/mindmaps/${mindmap.id}/image`}
                    download={`${mindmap.title}.png`}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold transition-colors text-white"
                >
                    <span>📥</span> Download
                </a>
            </header>

            {/* Interactive Mind Map Viewer */}
            <main className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
                <TransformWrapper
                    initialScale={1}
                    minScale={0.1}
                    maxScale={4}
                    centerOnInit={true}
                    centerZoomedOut={true}
                    limitToBounds={false}
                    panning={{ disabled: false }}
                    wheel={{ step: 0.1 }}
                    doubleClick={{ disabled: false, mode: 'zoomIn', step: 0.5 }}
                >
                    {({ zoomIn, zoomOut, resetTransform }) => (
                        <>
                            {/* Zoom Controls */}
                            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                                <button
                                    onClick={() => zoomIn()}
                                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-xl border border-white/10 transition-colors"
                                    title="Zoom In"
                                >
                                    +
                                </button>
                                <button
                                    onClick={() => zoomOut()}
                                    className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-xl border border-white/10 transition-colors"
                                    title="Zoom Out"
                                >
                                    −
                                </button>
                                <button
                                    onClick={() => resetTransform()}
                                    className="w-10 h-10 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center text-sm border border-gray-300 dark:border-white/10 transition-colors"
                                    title="Reset View"
                                >
                                    ⟲
                                </button>
                            </div>

                            {/* Image Container */}
                            <TransformComponent
                                wrapperClass="w-full h-full"
                                contentClass="w-full h-full flex items-center justify-center"
                            >
                                <img
                                    src={`/api/mindmaps/${mindmap.id}/image`}
                                    alt={mindmap.title}
                                    className="max-w-full max-h-full object-contain cursor-move"
                                    draggable={false}
                                />
                            </TransformComponent>
                        </>
                    )}
                </TransformWrapper>
            </main>

            {/* Instructions */}
            <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-white/50 text-center">
                💡 Scroll to zoom • Drag to pan • Double-click to zoom in • Click reset to fit
            </div>
        </div>
    );
}
