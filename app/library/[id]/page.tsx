'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Data Imports
import episodesData from '@/app/data/episodes.json';
import flashcardsData from '@/app/data/flashcards.json';
import quizzesData from '@/app/data/quizzes.json';
// Import others if they have content, currently strict on types so using 'any' safely or checking structure
import slidesData from '@/app/data/slides.json';
// import infographicsData from '@/app/data/infographics.json';
// import mindmapsData from '@/app/data/mindmaps.json';

export default function EpisodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const episodeId = parseInt(id);
    const episode = episodesData.find((e) => e.id === episodeId);

    if (!episode) {
        notFound();
    }

    // Check for available content
    // Note: Assuming JSON structure is consistent (array of objects with episodeId)
    const hasFlashcards = flashcardsData.some((f) => f.episodeId === episodeId);
    const hasQuiz = quizzesData.some((q) => q.id === episodeId);

    // For these, we cast to any or check structure if we haven't typed them yet. 
    // Assuming standard structure based on files seen.
    const hasSlides = (slidesData as any[]).some((s) => s.episodeId === episodeId);
    // const hasInfographics = (infographicsData as any[]).some((i) => i.episodeId === episodeId);
    // const hasMindMap = (mindmapsData as any[]).some((m) => m.episodeId === episodeId);
    const hasInfographics = false; // TODO: Connect real data when populated
    const hasMindMap = false;      // TODO: Connect real data when populated


    const resources = [
        {
            type: 'audio',
            title: 'Audio Lesson',
            available: true, // Always available per episode metadata
            href: `/audio?play=${episodeId}`, // Or just open player
            icon: '▶',
            color: 'from-blue-600 to-blue-500',
            bg: 'bg-blue-500/10 text-blue-500'
        },
        {
            type: 'flashcards',
            title: 'Flashcards',
            available: hasFlashcards,
            href: `/flashcards/${episodeId}`,
            icon: '🗂️',
            color: 'from-purple-600 to-purple-500',
            bg: 'bg-purple-500/10 text-purple-500'
        },
        {
            type: 'quiz',
            title: 'Practice Quiz',
            available: hasQuiz,
            href: `/quizzes/${episodeId}`,
            icon: '📝',
            color: 'from-slate-600 to-slate-500',
            bg: 'bg-slate-500/10 text-slate-500'
        },
        {
            type: 'slides',
            title: 'Slide Deck',
            available: hasSlides,
            href: `/slides/${episodeId}`,
            icon: '📄',
            color: 'from-indigo-600 to-indigo-500',
            bg: 'bg-indigo-500/10 text-indigo-500'
        },
        {
            type: 'infographic',
            title: 'Infographic',
            available: hasInfographics,
            href: `/infographics/${episodeId}`,
            icon: '🖼️',
            color: 'from-pink-600 to-pink-500',
            bg: 'bg-pink-500/10 text-pink-500'
        },
        {
            type: 'mindmap',
            title: 'Mind Map',
            available: hasMindMap,
            href: `/mindmaps/${episodeId}`,
            icon: '🧠',
            color: 'from-emerald-600 to-emerald-500',
            bg: 'bg-emerald-500/10 text-emerald-500'
        }
    ];

    return (
        <div className="min-h-dvh bg-background text-foreground transition-colors duration-300 pb-24">

            {/* Header */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-nav-border">
                <div className="mx-auto max-w-md px-4 py-3 flex items-center gap-3">
                    <Link
                        href="/library"
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-surface/10 hover:bg-surface/20 text-foreground transition-colors"
                    >
                        ←
                    </Link>
                    <div>
                        <div className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
                            Episode {episode.id}
                        </div>
                        <h1 className="text-lg font-bold leading-none truncate max-w-[250px]">
                            {episode.title}
                        </h1>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-md px-5 py-6">

                {/* Episode Info */}
                <div className="mb-8">
                    <p className="text-foreground/80 leading-relaxed">
                        {episode.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <span className="text-xs font-medium px-3 py-1 bg-surface/10 rounded-full text-foreground/60">
                            Pages {episode.pages}
                        </span>
                        <span className="text-xs font-medium px-3 py-1 bg-surface/10 rounded-full text-foreground/60">
                            Foundation
                        </span>
                    </div>
                </div>

                {/* Resources Grid */}
                <h2 className="text-sm font-bold text-foreground/40 uppercase tracking-widest mb-4">
                    Study Materials
                </h2>

                <div className="grid grid-cols-2 gap-4">
                    {resources.map((res) => (
                        res.available ? (
                            <Link
                                key={res.type}
                                href={res.href}
                                className="group relative overflow-hidden rounded-2xl bg-card border border-card-border p-4 shadow-sm hover:border-foreground/20 transition-all active:scale-95"
                            >
                                <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-xl shadow-sm ${res.bg}`}>
                                    {res.icon}
                                </div>
                                <h3 className="font-bold text-foreground group-hover:text-blue-500 transition-colors">
                                    {res.title}
                                </h3>
                                <p className="text-xs text-foreground/50 mt-1 font-medium">
                                    Tap to open
                                </p>
                            </Link>
                        ) : (
                            <div
                                key={res.type}
                                className="group relative overflow-hidden rounded-2xl bg-surface/5 border border-transparent p-4 opacity-50 cursor-not-allowed grayscale"
                            >
                                <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-xl bg-surface/10 text-foreground/30">
                                    {res.icon}
                                </div>
                                <h3 className="font-bold text-foreground/40">
                                    {res.title}
                                </h3>
                                <p className="text-xs text-foreground/30 mt-1">
                                    Not Available
                                </p>
                            </div>
                        )
                    ))}
                </div>

            </main>
        </div>
    );
}
