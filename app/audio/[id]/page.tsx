'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { usePlayer } from '@/app/context/PlayerContext';
import TranscriptViewer from '@/app/components/TranscriptViewer';
import { getTranscript } from '@/app/data/transcripts';
import episodes from '@/app/data/episodes.json';

export default function AudioLessonPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const episodeId = parseInt(id);
    const episode = episodes.find(e => e.id === episodeId);

    const { currentTime, currentEpisode, playEpisode, isPlaying, setIsPlaying } = usePlayer();

    // Determine effective time:
    // If this episode is playing, use global currentTime.
    // If not, use 0 or local state if we want to support reading without playing (but auto-scroll won't work).
    // The user wants to "transcription to the audio lesson", so syncing is key.
    const isCurrentEpisode = currentEpisode?.id === episodeId;
    const effectiveTime = isCurrentEpisode ? currentTime : 0;

    if (!episode) {
        return notFound();
    }

    const segments = getTranscript(episodeId);

    const handlePlayPause = () => {
        if (isCurrentEpisode) {
            setIsPlaying(!isPlaying);
        } else {
            // Need to reshape episode from JSON to match PlayerContext Episode type if needed
            // efficiently they are likely same structure
            playEpisode(episode as any);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-[180px] text-foreground">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-nav-border px-4 py-4">
                <div className="flex items-center gap-4">
                    <Link href="/audio" className="h-8 w-8 flex items-center justify-center rounded-full bg-surface/10 hover:bg-surface/20 transition-colors">
                        ←
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold uppercase tracking-wider opacity-60">Episode {episode.order}</div>
                        <h1 className="text-lg font-bold truncate pr-4">{episode.title}</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-8 animate-enter">

                {/* Hero / Player Control Area */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    {/* Art / Play Button */}
                    <div className="w-full md:w-64 shrink-0">
                        <div className="aspect-square rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 opacity-50" />
                            <button
                                onClick={handlePlayPause}
                                className="relative z-10 h-20 w-20 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30"
                            >
                                {isCurrentEpisode && isPlaying ? (
                                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                ) : (
                                    <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 space-y-4">
                        <div className="flex flex-wrap gap-2 text-sm">
                            <span className="px-3 py-1 rounded-full bg-surface/10 border border-nav-border font-medium">
                                ⏱️ {Math.floor(episode.duration / 60)} mins
                            </span>
                            <span className="px-3 py-1 rounded-full bg-surface/10 border border-nav-border font-medium">
                                📅 NCLEX Prep
                            </span>
                        </div>
                        <p className="text-foreground/80 leading-relaxed text-lg">
                            {episode.description}
                        </p>

                        {/* Quiz Call to Action */}
                        <div className="pt-4">
                            <Link
                                href={`/quizzes/${episodeId}`}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/20"
                            >
                                <span>📝 Take Quiz for this Episode</span>
                                <span>→</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Transcript Section */}
                <div className="pt-8 border-t border-nav-border">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <span>📄</span> Transcript
                    </h2>

                    <div className="bg-surface/5 rounded-2xl border border-nav-border overflow-hidden min-h-[400px]">
                        <TranscriptViewer
                            segments={segments}
                            currentTime={effectiveTime}
                            onSeek={(time) => {
                                if (isCurrentEpisode) {
                                    // Use PlayerContext play logic if available or access audioRef?
                                    // PlayerContext doesn't expose seek. 
                                    // We might need to handle seek via global player or ignore for now.
                                    // Actually, Player.tsx handles seek internally. External seek is hard via Context currently.
                                    // We provided `setCurrentTime` but that updates state, doesn't seek audio.
                                    // To fix this fully, we'd need `seekTo` in context.
                                    // For now, auto-scroll works "read-only" sync. Seek might be disabled or minimal.
                                }
                            }}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
