'use client';

import Link from 'next/link';
import episodesData from '@/app/data/episodes.json';
import quizzesData from '@/app/data/quizzes.json';
import flashcardsData from '@/app/data/flashcards.json';
import { usePlayer } from '@/app/context/PlayerContext';
import { useLibrary } from '@/app/context/LibraryContext';

export default function LibraryPage() {
    const { loadEpisode } = usePlayer();
    const { isSaved, saveItem, removeItem } = useLibrary();

    const handlePlayEpisode = (episode: any) => {
        loadEpisode({
            id: episode.id,
            title: episode.title,
            description: episode.description,
            audioUrl: `/uploads/episode-${episode.id}.mp3`,
            duration: episode.duration || 0,
            order: episode.id
        });
    };

    const toggleSaveEpisode = (e: React.MouseEvent, episode: any) => {
        e.stopPropagation();
        if (isSaved(episode.id, 'episode')) {
            removeItem(episode.id, 'episode');
        } else {
            saveItem({
                id: episode.id,
                type: 'episode',
                title: episode.title,
                description: episode.description
            });
        }
    };

    return (
        <div className="min-h-dvh bg-background text-foreground pb-mini-player">
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
                                Episode Library
                            </h1>
                            <p className="text-xs text-muted-foreground mt-1">All NCLEX study episodes</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-md px-5 pt-6 space-y-4">
                {episodesData.map((episode) => {
                    const hasQuiz = quizzesData.some(q => q.episodeId === episode.id);
                    const hasFlashcards = flashcardsData.some(f => f.episodeId === episode.id);
                    const isEpisodeSaved = isSaved(episode.id, 'episode');

                    return (
                        <div
                            key={episode.id}
                            className="group bg-card border border-card-border rounded-lg p-4 hover:border-border transition-all hover:shadow-lg"
                        >
                            {/* Episode Header */}
                            <div className="flex items-start gap-3 mb-3">
                                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex flex-col items-center justify-center text-white shrink-0 shadow-lg">
                                    <span className="text-[8px] opacity-70 uppercase tracking-wider">EP</span>
                                    <span className="text-lg font-bold">{episode.id}</span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base leading-tight mb-1">{episode.title}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{episode.description}</p>
                                </div>

                                <button
                                    onClick={(e) => toggleSaveEpisode(e, episode)}
                                    className={`h-8 w-8 grid place-items-center rounded-full transition-colors ${isEpisodeSaved
                                        ? 'bg-indigo-500/20 text-indigo-500'
                                        : 'bg-surface/10 text-muted-foreground hover:bg-surface/20'
                                        }`}
                                >
                                    <span className="text-sm">{isEpisodeSaved ? '🔖' : '🏷️'}</span>
                                </button>
                            </div>

                            {/* Episode Metadata */}
                            <div className="flex items-center gap-2 mb-3 text-[10px] text-muted-foreground">
                                <span className="px-2 py-1 bg-surface/10 rounded-md">📖 Pages {episode.pages}</span>
                                {episode.duration && (
                                    <span className="px-2 py-1 bg-surface/10 rounded-md">
                                        ⏱️ {Math.floor(episode.duration / 60)} min
                                    </span>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePlayEpisode(episode)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors"
                                >
                                    <span>▶</span>
                                    <span>Play Audio</span>
                                </button>

                                {hasFlashcards && (
                                    <Link
                                        href={`/flashcards/${episode.id}`}
                                        className="px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-500 rounded-lg font-semibold text-sm transition-colors"
                                    >
                                        🗂️
                                    </Link>
                                )}

                                {hasQuiz && (
                                    <Link
                                        href={`/quizzes/${episode.id}`}
                                        className="px-4 py-2.5 bg-slate-500/10 hover:bg-slate-500/20 text-slate-400 rounded-lg font-semibold text-sm transition-colors"
                                    >
                                        📝
                                    </Link>
                                )}

                                <Link
                                    href={`/library/${episode.id}`}
                                    className="px-4 py-2.5 bg-surface/10 hover:bg-surface/20 text-foreground rounded-lg font-semibold text-sm transition-colors"
                                >
                                    →
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </main>
        </div>
    );
}
