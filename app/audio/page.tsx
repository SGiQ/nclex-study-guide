'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePlayer } from '@/app/context/PlayerContext';

interface Episode {
    id: number;
    title: string;
    description: string;
    duration: number;
    audioUrl: string;
    order: number;
}

import { useProgram } from '@/app/context/ProgramContext';

export default function AudioParams() {
    const { playEpisode, loadEpisode, currentEpisode, isPlaying } = usePlayer();
    const { activeProgram } = useProgram();
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [filteredEpisodes, setFilteredEpisodes] = useState<Episode[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch(`/api/episodes?program=${activeProgram.slug}`)
            .then(res => res.json())
            .then(data => {
                setEpisodes(data);
                setFilteredEpisodes(data);
                // Auto-select first episode if none selected
                // NOTE: We might not want to auto-select if switching programs to avoid auto-playing
                if (!currentEpisode && data.length > 0) {
                    // loadEpisode(data[0]); 
                }
            });
    }, [activeProgram.slug]);

    // Better Approach: Handle this in the Context Provider to load initial state?
    // Or just let's add a "Load" effect here that selects the first one but `isPlaying: false`.
    // I need to check PlayerContext again.

    useEffect(() => {
        const filtered = episodes.filter(ep =>
            ep.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ep.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEpisodes(filtered);
    }, [searchTerm, episodes]);

    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="pb-mini-player bg-background min-h-dvh text-foreground">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-nav-border">
                <div className="mx-auto max-w-md px-4 py-4">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/" className="h-8 w-8 flex items-center justify-center rounded-full bg-surface/10 hover:bg-surface/20 transition-colors">
                        ←
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Audio Lessons</h1>
                        <p className="text-xs font-medium opacity-60">{episodes.length} Episodes • {activeProgram.name}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg opacity-40">⌕</span>
                    <input
                        type="text"
                        placeholder="Find in episodes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-11 pl-10 pr-4 rounded-lg bg-surface/5 border border-nav-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-foreground/30 text-sm font-medium"
                    />
                </div>
                </div>
            </div>

            {/* Episode List */}
            <div className="mx-auto max-w-md divide-y divide-nav-border stagger-1">
                {filteredEpisodes.map((episode) => {
                    const isCurrent = currentEpisode?.id === episode.id;

                    return (
                        <Link
                            key={episode.id}
                            href={`/audio/${episode.id}`}
                            className={`block animate-enter p-4 flex items-center gap-4 cursor-pointer hover:bg-surface/5 active:scale-[0.99] transition-all ${isCurrent ? 'bg-indigo-500/10 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
                        >
                            {/* Number Box */}
                            <div className={`h-12 w-12 rounded-lg shrink-0 flex items-center justify-center shadow-sm transition-colors ${isCurrent ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'}`}>
                                {isCurrent && isPlaying ? (
                                    <div className="flex gap-[2px] h-4 items-end">
                                        <div className="w-1 bg-white animate-[bounce_1s_infinite] h-2"></div>
                                        <div className="w-1 bg-white animate-[bounce_1.2s_infinite] h-4"></div>
                                        <div className="w-1 bg-white animate-[bounce_0.8s_infinite] h-3"></div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center leading-none">
                                        <span className="text-[10px] font-bold opacity-60 uppercase">EP</span>
                                        <span className="text-lg font-bold">{episode.order}</span>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold text-base mb-0.5 truncate ${isCurrent ? 'text-indigo-400' : 'text-foreground'}`}>
                                    {episode.title}
                                </h3>
                                <p className="text-xs text-foreground/60 line-clamp-2 leading-relaxed">
                                    {episode.description}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="text-[10px] font-bold border border-foreground/10 px-1.5 py-0.5 rounded text-foreground/40 uppercase tracking-wider">
                                        {formatTime(episode.duration)}
                                    </span>
                                    {(() => {
                                        // Check for listen progress
                                        const progressKey = `audio_progress_${episode.id}`;
                                        const savedProgress = typeof window !== 'undefined' ? localStorage.getItem(progressKey) : null;

                                        if (savedProgress) {
                                            try {
                                                const { currentTime, duration } = JSON.parse(savedProgress);
                                                const percentComplete = Math.round((currentTime / duration) * 100);

                                                if (percentComplete >= 95) {
                                                    return (
                                                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/30 uppercase tracking-wider">
                                                            ✓ Completed
                                                        </span>
                                                    );
                                                } else if (percentComplete > 0) {
                                                    return (
                                                        <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-500/30 uppercase tracking-wider">
                                                            {percentComplete}% Listened
                                                        </span>
                                                    );
                                                }
                                            } catch (e) { }
                                        }
                                        return null;
                                    })()}
                                </div>
                            </div>

                            {/* Play Action */}
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    playEpisode(episode);
                                }}
                                className={`h-8 w-8 flex items-center justify-center rounded-full border transition-colors hover:bg-surface/20 ${isCurrent ? 'border-indigo-500/30 text-indigo-400' : 'border-foreground/10 text-foreground/20'}`}
                            >
                                {isCurrent && isPlaying ? '⏸' : '▶'}
                            </button>
                        </Link>
                    );
                })}


                {/* Empty State */}
                {filteredEpisodes.length === 0 && (
                    <div className="p-8 text-center opacity-40">
                        <p>No episodes found matching "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    );
}
