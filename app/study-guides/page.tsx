'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StudyGuide {
    id: number;
    episode_id: number;
    title: string;
    created_at: string;
}

export default function StudyGuidesPage() {
    const [studyGuides, setStudyGuides] = useState<StudyGuide[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/study-guides')
            .then(res => res.json())
            .then(data => {
                setStudyGuides(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching study guides:', err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-dvh bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white font-sans p-6 pb-24">
            {/* Header */}
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <Link href="/dashboard" className="text-sm font-medium text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white mb-2 block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                        Study Guides
                    </h1>
                    <p className="text-gray-600 dark:text-white/60 text-sm mt-1">
                        Comprehensive study materials with questions and glossary.
                    </p>
                </div>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-16">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="text-gray-600 dark:text-white/50">Loading study guides...</p>
                    </div>
                ) : studyGuides.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-gray-100 dark:bg-white/5 rounded-3xl border border-gray-200 dark:border-white/5 border-dashed">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white/80 mb-2">No Study Guides Yet</h3>
                        <p className="text-gray-600 dark:text-white/50 text-sm">
                            Study guides will appear here once created.
                        </p>
                    </div>
                ) : (
                    studyGuides.map((guide) => (
                        <Link
                            key={guide.id}
                            href={`/study-guides/${guide.id}`}
                            className="group relative bg-white dark:bg-[#16161C] rounded-2xl p-6 border border-gray-200 dark:border-white/5 hover:border-green-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-green-900/20 active:scale-[0.99] shadow-sm dark:shadow-none"
                        >
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-2xl shadow-lg mb-4">
                                📝
                            </div>

                            {/* Title */}
                            <h3 className="text-lg font-bold leading-tight mb-2 text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                                {guide.title}
                            </h3>

                            {/* Episode Badge */}
                            <p className="text-xs text-gray-600 dark:text-white/50 font-medium uppercase tracking-wider">
                                Episode {guide.episode_id}
                            </p>

                            {/* Hover Arrow */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full p-2">
                                    <span className="text-xl">→</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
