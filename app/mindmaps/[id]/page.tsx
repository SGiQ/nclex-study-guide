'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import InteractiveMindMap from '@/app/components/MindMap/InteractiveMindMap';

export default function MindMapViewerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [mindmap, setMindmap] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [autoGenTriggered, setAutoGenTriggered] = useState(false);

    // Load from LocalStorage helper
    const loadLocal = (mapId: string) => {
        try {
            const saved = localStorage.getItem(`mindmap_offline_${mapId}`);
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error("Failed to load local mindmap:", e);
        }
        return null;
    };

    // Save to LocalStorage helper
    const saveLocal = (mapId: string, data: any) => {
        try {
            localStorage.setItem(`mindmap_offline_${mapId}`, JSON.stringify(data));
        } catch (e) {
            console.error("Failed to save local mindmap:", e);
        }
    };

    useEffect(() => {
        if (!id) return;

        // Fetch specific mindmap directly
        // Add timeout to fail fast if DB is stuck
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

        fetch(`/api/mindmaps/${id}`, { signal: controller.signal })
            .then(async res => {
                clearTimeout(timeoutId);
                if (!res.ok) {
                    if (res.status === 404) return null;
                    throw new Error(`Failed to fetch: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data && !data.error) {
                    setMindmap(data);
                }
                setLoading(false);
            })
            .catch((e) => {
                console.error("Error loading mindmap, trying local fallback:", e);

                // Try LocalStorage first
                const localData = loadLocal(id);
                if (localData) {
                    console.log("Loaded from LocalStorage!");
                    setMindmap(localData);
                } else {
                    // Fallback for offline/bad connection so user sees UI
                    setMindmap({
                        id: parseInt(id),
                        title: 'Mind Map (Offline Mode)',
                        episode_id: parseInt(id), // Assume ID matches Episode ID for offline fallback
                        nodes: [],
                        edges: []
                    });
                }
                setLoading(false);
            });

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [id]);

    const handleGenerate = async () => {
        if (!mindmap || !mindmap.episode_id) return;
        setGenerating(true);

        try {
            // 1. Generate Structure
            const res = await fetch('/api/mindmaps/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ episodeId: mindmap.episode_id })
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error);

            // 2. Save Structure (but handle failure gracefully for offline mode)
            try {
                // Add timeout for save operation too
                const saveController = new AbortController();
                const saveTimeoutId = setTimeout(() => saveController.abort(), 3000); // 3 second max wait for save

                const saveRes = await fetch(`/api/mindmaps/${mindmap.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nodes: data.nodes, edges: data.edges }),
                    signal: saveController.signal
                });

                clearTimeout(saveTimeoutId);

                if (!saveRes.ok) throw new Error('Failed to save structure');

                const savedData = await saveRes.json();
                setMindmap(savedData.mindmap);

                // Update Local Storage on success
                saveLocal(mindmap.id, savedData.mindmap);

            } catch (saveError) {
                console.warn("DB Save failed, but using generated data locally:", saveError);
                // Use local data so user sees the result!
                const updatedMap = {
                    ...mindmap,
                    nodes: data.nodes,
                    edges: data.edges
                };
                setMindmap(updatedMap);
                saveLocal(mindmap.id, updatedMap);
            }

        } catch (error) {
            console.error('Generation failed:', error);
            // Don't alert if it was auto-triggered, just log it
            if (!autoGenTriggered) {
                alert('Failed to generate interactive map. See console for details.');
            }
        } finally {
            setGenerating(false);
        }
    };

    // Auto-generate effect
    useEffect(() => {
        if (mindmap && !loading && !generating && !autoGenTriggered) {
            const hasData = mindmap.nodes && mindmap.nodes.length > 0;
            if (!hasData) {
                console.log("Auto-triggering generation...");
                setAutoGenTriggered(true); // Prevent tight loop
                handleGenerate();
            }
        }
    }, [mindmap, loading, generating, autoGenTriggered]);

    if (loading) {
        return (
            <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white items-center justify-center">
                <div className="text-4xl mb-4">🧠</div>
                <div className="text-white/60">Loading mind map...</div>
            </div>
        );
    }

    if (!mindmap) return notFound();

    // Check if we have valid interactive data
    const hasInteractiveData = mindmap.nodes && mindmap.nodes.length > 0;

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 flex-shrink-0 z-10">
                <Link href="/library" className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/70 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <span>←</span> Library
                </Link>
                <div className="flex-1 text-center font-bold text-sm truncate px-4">
                    {mindmap.title}
                </div>
                <div className="flex items-center gap-2">
                    {!hasInteractiveData && (
                        <button
                            onClick={handleGenerate}
                            disabled={true} // Always disabled as it auto-runs now
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/50 rounded-lg text-sm font-semibold transition-colors text-white animate-pulse"
                        >
                            ✨ Generating...
                        </button>
                    )}
                    <a
                        href={`/api/mindmaps/${mindmap.id}/image`}
                        download={`${mindmap.title}.png`}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition-colors text-white"
                        title="Download Original Image"
                    >
                        <span>📥</span>
                    </a>
                </div>
            </header>

            {/* Viewer */}
            <main className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900 relative">
                {hasInteractiveData ? (
                    <InteractiveMindMap
                        initialNodes={mindmap.nodes}
                        initialEdges={mindmap.edges}
                    />
                ) : (
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
                                    <button onClick={() => zoomIn()} className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-xl border border-white/10">+</button>
                                    <button onClick={() => zoomOut()} className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-xl border border-white/10">−</button>
                                    <button onClick={() => resetTransform()} className="w-10 h-10 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg flex items-center justify-center text-sm border border-gray-300 dark:border-white/10">⟲</button>
                                </div>
                                <TransformComponent wrapperClass="w-full h-full" contentClass="w-full h-full flex items-center justify-center">
                                    <img src={`/api/mindmaps/${mindmap.id}/image`} alt={mindmap.title} className="max-w-full max-h-full object-contain cursor-move" draggable={false} />
                                </TransformComponent>
                            </>
                        )}
                    </TransformWrapper>
                )}
            </main>

            {/* Instructions */}
            <div className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-white/10 text-xs text-gray-600 dark:text-white/50 text-center">
                {hasInteractiveData
                    ? "💡 Click any node to chat with the AI Tutor about that topic!"
                    : "💡 Scroll to zoom • Drag to pan • Click 'Make Interactive' to unlock AI features"
                }
            </div>
        </div>
    );
}
