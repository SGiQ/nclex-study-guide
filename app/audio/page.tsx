'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { useProgress } from '@/app/context/ProgressContext';
import AudioVisualizer from '@/app/components/AudioVisualizer';

export default function AudioParams() {
    const router = useRouter();
    const { playEpisode, loadEpisode, currentEpisode, isPlaying, analyser } = usePlayer();
    const { activeProgram } = useProgram();
    const { audioProgress } = useProgress();
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [filteredEpisodes, setFilteredEpisodes] = useState<Episode[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Determine the episode to show in the "Currently Studying" card
    const playbackEpisode = currentEpisode || (() => {
        if (!episodes.length) return null;
        let recentId = episodes[0].id;
        let maxTime = 0;
        Object.entries(audioProgress || {}).forEach(([idStr, prog]) => {
            const time = prog.metadata?.lastUpdated || 0;
            if (time > maxTime) {
                maxTime = time;
                recentId = parseInt(idStr);
            }
        });
        return episodes.find(e => e.id === recentId) || null;
    })();

    useEffect(() => {
        fetch(`/api/episodes?program=${activeProgram.slug}`)
            .then(res => res.json())
            .then(data => {
                setEpisodes(data);
                setFilteredEpisodes(data);
            });
    }, [activeProgram.slug]);

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
        <div className="pb-mini-player bg-background text-foreground font-display min-h-screen flex flex-col transition-colors duration-300 items-center">
            <div className="w-full max-w-2xl flex flex-col h-full bg-[#0A0A0F]">
                {/* Header */}
                <header className="sticky top-0 z-50 w-full glass-card border-b border-white/5 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard" className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                            <span className="material-symbols-outlined">menu</span>
                        </Link>
                        <h1 className="text-lg font-bold tracking-tight">Audio Lessons</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-full hover:bg-white/5 text-slate-400">
                            <span className="material-symbols-outlined">search</span>
                        </button>
                        <button className="p-2 rounded-full hover:bg-white/5 text-slate-400">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500">search</span>
                        <input
                            type="text"
                            placeholder="Search episodes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/5 focus:border-primary outline-none transition-all text-sm"
                        />
                    </div>

                    {/* Featured/Active Lesson Section */}
                    <section>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Currently Studying</h2>
                        {/* Always show the full-height card — empty state uses same dimensions */}
                    <div className={`neon-border-wrapper rounded-[1.5rem] ${playbackEpisode && isPlaying ? 'is-playing shadow-[0_0_80px_-15px_rgba(37,123,244,0.5)]' : ''}`}>
                        <div className="glass-card rounded-[calc(1.5rem-2px)] p-8 relative overflow-hidden group border border-transparent min-h-[300px] flex flex-col justify-center z-10 w-full h-full bg-[#0A0A0F]">

                            <div className="absolute -right-10 -top-10 w-64 h-64 bg-primary/20 blur-3xl rounded-full"></div>
                            
                            {playbackEpisode ? (
                                <div className="flex gap-8 items-center relative z-20">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-40 h-40 rounded-2xl bg-slate-900 flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
                                            <span className="text-4xl font-black text-primary/60 tracking-tighter">EP{playbackEpisode.order}</span>
                                        </div>
                                        <button 
                                            onClick={() => playEpisode(playbackEpisode)}
                                            className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-xl shadow-primary/40 hover:scale-105 transition-transform"
                                        >
                                            <span className="material-symbols-outlined text-white text-3xl">
                                                {currentEpisode?.id === playbackEpisode.id && isPlaying ? 'pause' : 'play_arrow'}
                                            </span>
                                        </button>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 flex flex-col h-40">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-primary uppercase tracking-widest truncate mb-2">
                                                    {activeProgram.name} • EP {playbackEpisode.order}
                                                </p>
                                                <h3 className="text-xl sm:text-2xl font-black leading-tight uppercase tracking-tight line-clamp-2">
                                                    {playbackEpisode.title}
                                                </h3>
                                            </div>
                                        </div>
                                        
                                        {/* Live Audio Waveform - High Performance */}
                                        <AudioVisualizer 
                                            analyser={currentEpisode?.id === playbackEpisode.id && isPlaying ? analyser : null} 
                                            isPlaying={currentEpisode?.id === playbackEpisode.id && isPlaying} 
                                            barCount={15}
                                            className="flex items-end gap-1 h-12 md:h-20 mt-auto opacity-90"
                                            barClassName="flex-1 bg-primary rounded-t-sm"
                                            sensitivity={0.5}
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* Empty state — same height, placeholder layout */
                                <div className="flex gap-8 items-center relative z-20">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-40 h-40 rounded-2xl bg-slate-900/60 flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
                                            <span className="material-symbols-outlined text-5xl text-slate-700">headphones</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col h-40 justify-center">
                                        <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-3">Audio Lessons</p>
                                        <h3 className="text-2xl font-black leading-tight uppercase tracking-tight text-slate-500 line-clamp-2">
                                            No Episode Selected
                                        </h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-3">
                                            Tap an episode below to start
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    </section>

                {/* Up Next List */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Episode Library</h2>
                        <span className="text-[10px] font-bold text-primary">{filteredEpisodes.length} Episodes</span>
                    </div>

                    <div className="space-y-3">
                        {filteredEpisodes.map((episode) => {
                            const isCurrent = currentEpisode?.id === episode.id;
                            return (
                                <div 
                                    key={episode.id}
                                    onClick={() => router.push(`/library/episodes/${episode.id}`)}
                                    className={`glass-card rounded-2xl p-4 flex items-center gap-4 border transition-all cursor-pointer group hover:bg-white/5 ${isCurrent ? 'border-primary/40 bg-primary/5' : 'border-white/5'}`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
                                        {isCurrent ? (
                                            <span className="material-symbols-outlined text-xl text-primary">graphic_eq</span>
                                        ) : (
                                            <span className="text-xs font-black text-slate-500">{episode.order}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-black uppercase tracking-tight truncate ${isCurrent ? 'text-primary' : ''}`}>
                                            {episode.title}
                                        </h4>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                            {formatTime(episode.duration)} • EP {episode.order}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            playEpisode(episode);
                                        }}
                                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isCurrent && isPlaying ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            {isCurrent && isPlaying ? 'pause' : 'play_arrow'}
                                        </span>
                                    </button>
                                </div>
                            );
                        })}

                        {filteredEpisodes.length === 0 && (
                            <div className="text-center py-12 opacity-40">
                                <p className="text-xs font-bold uppercase tracking-widest">No episodes found</p>
                            </div>
                        )}
                    </div>
                </section>
                </main>
            </div>
        </div>
    );
}
