'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import episodesData from '@/app/data/episodes.json';
import quizzesData from '@/app/data/quizzes.json';
import flashcardsData from '@/app/data/flashcards.json';
import mindmapsData from '@/app/data/mindmaps.json';
import slidesData from '@/app/data/slides.json';
import { usePlayer } from '@/app/context/PlayerContext';
import { useProgress } from '@/app/context/ProgressContext';
import { useProgram } from '@/app/context/ProgramContext';

export default function EpisodeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { playEpisode, currentEpisode, isPlaying, analyser } = usePlayer();
    const { audioProgress, quizResults } = useProgress();
    const { activeProgram } = useProgram();
    const [freqData, setFreqData] = useState<Uint8Array>(new Uint8Array(0));
    
    const episodeId = parseInt(params.id as string);
    const episode = episodesData.find(e => e.id === episodeId);
    
    const isActuallyPlaying = isPlaying && currentEpisode?.id === episodeId;

    // Live Waveform Logic
    useEffect(() => {
        if (!analyser || !isActuallyPlaying) {
            setFreqData(new Uint8Array(0));
            return;
        }

        let animationFrameId: number;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateWaveform = () => {
            analyser.getByteFrequencyData(dataArray);
            const step = Math.floor(dataArray.length / 10);
            const sampledData = new Uint8Array(10);
            for (let i = 0; i < 10; i++) {
                sampledData[i] = dataArray[i * step];
            }
            setFreqData(new Uint8Array(sampledData));
            animationFrameId = requestAnimationFrame(updateWaveform);
        };

        updateWaveform();
        return () => cancelAnimationFrame(animationFrameId);
    }, [analyser, isActuallyPlaying]);
    
    if (!episode) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Episode Not Found</h1>
                <p className="text-slate-400 mb-8 max-w-xs uppercase text-[10px] font-bold tracking-widest">The episode you're looking for doesn't exist or has been moved.</p>
                <Link href="/library" className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
                    Back to Library
                </Link>
            </div>
        );
    }

    // Related content
    const quiz = quizzesData.find(q => q.episodeId === episodeId);
    const flashcards = flashcardsData.find(f => f.episodeId === episodeId);
    const mindmap = mindmapsData.find(m => m.episodeId === episodeId);
    const slides = slidesData.find(s => s.episodeId === episodeId);
    
    // Progress
    const isCompleted = audioProgress[episodeId]?.completed;
    const quizResult = quizResults[episodeId];

    const handleTogglePlay = () => {
        const episodeToPlay = {
            id: episode.id,
            title: episode.title,
            description: episode.description,
            audioUrl: `/uploads/episode-${episode.id}.mp3`,
            duration: episode.duration || 0,
            order: episode.id
        };
        playEpisode(episodeToPlay);
    };

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-foreground pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
                    <button onClick={() => router.back()} className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <h1 className="text-xs font-black uppercase tracking-[0.2em] text-slate-100">Episode Detail</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-5 duration-500 space-y-10">
                {/* Large Player Card - Ported from AudioPage */}
                <div className={`neon-border-wrapper rounded-[2.5rem] ${isActuallyPlaying ? 'is-playing shadow-[0_0_80px_-15px_rgba(37,123,244,0.5)]' : ''}`}>
                    <div className="glass-card rounded-[calc(2.5rem-2px)] p-10 relative overflow-hidden group border border-transparent min-h-[320px] flex flex-col justify-center z-10 w-full bg-[#0A0A0F]">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full"></div>
                        
                        <div className="flex flex-col md:flex-row gap-10 items-center relative z-20">
                            <div className="relative flex-shrink-0">
                                <div className="w-48 h-48 rounded-[2rem] bg-slate-900 flex items-center justify-center overflow-hidden border border-white/10 shadow-2xl relative">
                                    <span className="text-5xl font-black text-primary/40 tracking-tighter">EP{episode.id}</span>
                                    {isActuallyPlaying && (
                                        <div className="absolute inset-0 bg-primary/5 animate-pulse"></div>
                                    )}
                                </div>
                                <button 
                                    onClick={handleTogglePlay}
                                    className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-transform group/btn"
                                >
                                    <span className="material-symbols-outlined text-white text-4xl fill-1 group-hover/btn:scale-110 transition-transform">
                                        {isActuallyPlaying ? 'pause' : 'play_arrow'}
                                    </span>
                                </button>
                            </div>
                            
                            <div className="flex-1 min-w-0 flex flex-col items-center md:items-start text-center md:text-left">
                                <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
                                    <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                                        {episode.category}
                                    </span>
                                    {isCompleted && (
                                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[12px] fill-1">check_circle</span> DONE
                                        </span>
                                    )}
                                </div>
                                
                                <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-3 leading-tight">
                                    {episode.title}
                                </h2>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-8 max-w-md">
                                    {episode.description}
                                </p>
                                
                                {/* Live Audio Waveform */}
                                <div className="flex items-end gap-1.5 h-16 w-full max-w-[200px] opacity-80">
                                    {(freqData.length > 0 ? Array.from(freqData) : [10, 20, 15, 25, 10, 20, 30, 15, 25, 10]).map((val, i) => (
                                        <div 
                                            key={i} 
                                            className="waveform-bar transition-all duration-75 w-full rounded-t-lg bg-primary" 
                                            style={{ 
                                                height: `${isActuallyPlaying ? (val / 255) * 100 + 10 : 15}%`,
                                                opacity: isActuallyPlaying ? 1 : 0.2
                                            }} 
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 px-2">Learning Materials</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Quiz Section */}
                        <div className={`relative ${quiz ? '' : 'opacity-50 grayscale pointer-events-none'}`}>
                            <div className="glass-card border border-white/5 rounded-3xl p-6 hover:bg-white/5 transition-all group cursor-pointer" onClick={() => quiz && router.push(`/quizzes/${quiz.id}`)}>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                                        <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">quiz</span>
                                    </div>
                                    {quizResult && (
                                        <div className="text-right">
                                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">BEST</p>
                                            <p className="text-emerald-400 font-black text-lg">{Math.round((quizResult.score / quizResult.total) * 100)}%</p>
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-black text-base uppercase tracking-tight text-white mb-2">Episode Quiz</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-normal">Test your knowledge on this topic.</p>
                            </div>
                        </div>

                        {/* Flashcards Section */}
                        <div className={`relative ${flashcards ? '' : 'opacity-50 grayscale pointer-events-none'}`}>
                            <div className="glass-card border border-white/5 rounded-3xl p-6 hover:bg-white/5 transition-all group cursor-pointer" onClick={() => router.push('/flashcards')}>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-4 bg-pink-500/10 rounded-2xl border border-pink-500/20 text-pink-400">
                                        <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">style</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">CARDS</p>
                                        <p className="text-pink-400 font-black text-lg">{flashcards?.cards.length || 0}</p>
                                    </div>
                                </div>
                                <h3 className="font-black text-base uppercase tracking-tight text-white mb-2">Flashcards</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-normal">Active recall for high-yield facts.</p>
                            </div>
                        </div>

                        {/* Mind Map Section */}
                        <div className={`relative ${mindmap ? '' : 'opacity-50 grayscale pointer-events-none'}`}>
                            <div className="glass-card border border-white/5 rounded-3xl p-6 hover:bg-white/5 transition-all group cursor-pointer">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
                                        <span className="material-symbols-outlined text-3xl group-hover:translate-y-[-2px] transition-transform">account_tree</span>
                                    </div>
                                </div>
                                <h3 className="font-black text-base uppercase tracking-tight text-white mb-2">Mind Map</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-normal">Visual connection of concepts.</p>
                            </div>
                        </div>

                        {/* Slides Section */}
                        <div className={`relative ${slides ? '' : 'opacity-50 grayscale pointer-events-none'}`}>
                            <div className="glass-card border border-white/5 rounded-3xl p-6 hover:bg-white/5 transition-all group cursor-pointer">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                                        <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">slideshow</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">DECK</p>
                                        <p className="text-emerald-400 font-black text-lg">1</p>
                                    </div>
                                </div>
                                <h3 className="font-black text-base uppercase tracking-tight text-white mb-2">Slide Deck</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-normal">Comprehensive lecture presentation.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="glass-card border border-white/5 rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <span className="material-symbols-outlined text-[120px]">info</span>
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Lesson Deep-Dive</h3>
                    <div className="space-y-8 relative z-10">
                        <div className="flex gap-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0 shadow-[0_0_10px_rgba(37,123,244,0.8)]" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Comprehensive Coverage</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide leading-relaxed">
                                    Aligned with pages <span className="text-white">{episode.pages}</span> of the NCLEX master study guide.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-2">Chapter Highlights</p>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide leading-relaxed break-words whitespace-pre-line">
                                    {episode.content}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
