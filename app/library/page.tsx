'use client';

import Link from 'next/link';
import { useLibrary } from '@/app/context/LibraryContext';
import { usePlayer } from '@/app/context/PlayerContext';

export default function LibraryPage() {
    const { savedItems } = useLibrary();
    const { loadEpisode } = usePlayer();

    // Group items by type
    const episodes = savedItems.filter(i => i.type === 'episode');
    const quizzes = savedItems.filter(i => i.type === 'quiz');

    return (
        <div className="min-h-dvh bg-background text-foreground pb-40">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-nav-border animate-in">
                <div className="mx-auto max-w-md px-4 pt-4 pb-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            aria-label="Back"
                            className="grid h-10 w-10 place-items-center rounded-full bg-surface/10 hover:bg-surface/20 active:bg-surface/30 text-foreground"
                        >
                            ←
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl font-semibold leading-none">
                                My Library
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-md px-5 pt-6 space-y-8 stagger-1">

                {/* Episodes Section */}
                <section className="animate-enter">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span>🎧</span> Saved Episodes
                        <span className="text-xs font-normal text-muted-foreground ml-auto bg-surface/10 px-2 py-0.5 rounded-full">{episodes.length}</span>
                    </h2>

                    {episodes.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-surface/20 rounded-2xl">
                            <p className="text-sm text-muted-foreground">No saved episodes yet.</p>
                            <Link href="/audio" className="mt-3 inline-block text-xs font-bold text-indigo-500 hover:underline">Browse Audio Lessons</Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {episodes.map((item) => (
                                <div key={`ep-${item.id}`} className="flex items-center gap-3 bg-surface/5 p-3 rounded-2xl border border-white/5 hover:bg-surface/10 transition-colors">
                                    <div className="h-10 w-10 rounded bg-indigo-600 flex flex-col items-center justify-center text-xs font-bold text-white shrink-0 leading-none">
                                        <span className="text-[7px] opacity-70 uppercase tracking-wider">EP</span>
                                        <span className="text-sm">{item.id}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-sm truncate">{item.title}</h3>
                                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link href={`/quizzes/${item.id}`} className="px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-500/20">
                                            Quiz
                                        </Link>
                                        <button
                                        // We assume 'loadEpisode' works with ID lookups in a real app, 
                                        // but here we might need the full object. For now let's just link to audio page or generic play.
                                        // Since we only saved minimal metadata, let's link to the audio page for simplicity in this version.
                                        >
                                            <Link href="/audio" className="h-8 w-8 grid place-items-center rounded-full bg-white text-black">
                                                ▶
                                            </Link>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Quizzes Section */}
                <section className="animate-enter" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span>📝</span> Saved Quizzes
                        <span className="text-xs font-normal text-muted-foreground ml-auto bg-surface/10 px-2 py-0.5 rounded-full">{quizzes.length}</span>
                    </h2>

                    {quizzes.length === 0 ? (
                        <div className="p-6 text-center border-2 border-dashed border-surface/20 rounded-2xl">
                            <p className="text-sm text-muted-foreground">No saved quizzes yet.</p>
                            <Link href="/quizzes" className="mt-3 inline-block text-xs font-bold text-indigo-500 hover:underline">Browse Quizzes</Link>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {quizzes.map((item) => (
                                <Link href={`/quizzes/${item.id}`} key={`qz-${item.id}`} className="block group">
                                    <div className="bg-surface/5 p-4 rounded-2xl border border-white/5 hover:bg-surface/10 transition-colors">
                                        <h3 className="font-semibold text-sm">{item.title}</h3>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">Practice Mode</span>
                                            <span className="text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">Start →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}
