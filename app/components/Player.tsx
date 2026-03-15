'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AudioVisualizer from './AudioVisualizer';
import { usePlayer } from '@/app/context/PlayerContext';
import { useLibrary } from '@/app/context/LibraryContext';
import { useAuth } from '@/app/context/AuthContext';
import { useProgress } from '@/app/context/ProgressContext';
import { useProgram } from '@/app/context/ProgramContext';
import { useRef, useEffect, useState } from 'react';
import TranscriptViewer from './TranscriptViewer';
import { getTranscript } from '@/app/data/transcripts';
import episodesPN from '@/app/data/episodes.json';
import episodesRN from '@/app/data/episodes-rn.json';

export default function Player() {
    const pathname = usePathname();
    const router = useRouter();
    const { currentEpisode, isPlaying, isDismissed, setIsPlaying, togglePlay, closePlayer, setCurrentTime, playNextEpisode, signalEpisodeEnded, analyser, setAnalyser } = usePlayer();
    const { saveItem, removeItem, isSaved } = useLibrary();
    const { user } = useAuth();
    const { saveAudioProgress, getAudioProgress } = useProgress();
    const { activeProgram } = useProgram();
    const allEpisodes = activeProgram.slug === 'nclex-rn' ? episodesRN : episodesPN;

    const audioRef = useRef<HTMLAudioElement>(null);

    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [showEndModal, setShowEndModal] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeView, setActiveView] = useState<'player' | 'transcript'>('player');
    const pendingPlayRef = useRef(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const isEpisodeSaved = currentEpisode ? isSaved(currentEpisode.id, 'episode') : false;

    useEffect(() => {
        if (!audioRef.current) return;

        // Initialize Web Audio API Analyser once
        if (!analyser && typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                const audioCtx = new AudioContextClass();
                const analyserNode = audioCtx.createAnalyser();
                analyserNode.fftSize = 256;
                analyserNode.smoothingTimeConstant = 0.85;
                
                // Connect the media element to the analyser
                const source = audioCtx.createMediaElementSource(audioRef.current);
                source.connect(analyserNode);
                analyserNode.connect(audioCtx.destination);
                
                setAnalyser(analyserNode);
            } catch (e) {
                console.warn("Failed to initialize AudioContext:", e);
            }
        }

        if (isPlaying) {
            if (audioRef.current.readyState === 0) {
                pendingPlayRef.current = true;
                audioRef.current.load();
            } else {
                pendingPlayRef.current = false;
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.catch((e) => {
                        console.warn("Playback prevented:", e);
                        setIsPlaying(false);
                    });
                }
            }
        } else {
            pendingPlayRef.current = false;
            audioRef.current.pause();
        }
    }, [isPlaying, currentEpisode?.id, setIsPlaying, analyser, setAnalyser]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    useEffect(() => {
        setProgress(0);
        setError(null);
        if (currentEpisode?.duration) {
            setDuration(currentEpisode.duration);
        }
    }, [currentEpisode?.id]);

    // Close expanded player on navigation
    useEffect(() => {
        setIsExpanded(false);
    }, [pathname]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            setCurrentTime(current);
            const total = audioRef.current.duration || duration || 1;

            if (audioRef.current.duration && Math.abs(audioRef.current.duration - duration) > 1) {
                setDuration(audioRef.current.duration);
            }

            setProgress((current / total) * 100);

            if (currentEpisode && Math.floor(current) % 5 === 0) {
                // Track best (furthest) position — never go backward
                const bestKey = `audio_best_${currentEpisode.id}`;
                const savedBest = (() => {
                    try { return JSON.parse(localStorage.getItem(bestKey) || '{}'); } catch { return {}; }
                })();
                const bestTime = savedBest.currentTime || 0;

                // Only update saved position if we've gone further than before
                if (current > bestTime) {
                    const progressData = {
                        currentTime: current,
                        duration: total,
                        lastUpdated: Date.now()
                    };
                    localStorage.setItem(bestKey, JSON.stringify(progressData));
                    // Also update the general audio_progress key used for restoring on reload
                    localStorage.setItem(`audio_progress_${currentEpisode.id}`, JSON.stringify(progressData));

                    const percent = (current / total) * 100;
                    const isCompleted = percent >= 95;

                    // Sync to cloud less frequently
                    if (user && Math.floor(current) % 10 === 0) {
                        saveAudioProgress(currentEpisode.id, isCompleted, progressData);
                    }
                }
            }
        }
    };

    // Called when audio reaches the end — definitively mark as completed
    const handleEnded = () => {
        setIsPlaying(false);
        if (currentEpisode) {
            const progressData = {
                currentTime: duration,
                duration,
                lastUpdated: Date.now()
            };
            localStorage.setItem(`audio_progress_${currentEpisode.id}`, JSON.stringify(progressData));
            saveAudioProgress(currentEpisode.id, true, progressData);
        }
        // Signal episode ended for SRS/context consumers, and show the end modal
        signalEpisodeEnded();
        setShowEndModal(true);
        setIsExpanded(false);
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            const actualDuration = audioRef.current.duration;
            if (actualDuration) setDuration(actualDuration);

            // Restore saved playback position
            if (currentEpisode) {
                // 1. Try localStorage first (fastest, most recent)
                const saved = localStorage.getItem(`audio_progress_${currentEpisode.id}`);
                let restoreTime: number | null = null;

                if (saved) {
                    try {
                        const data = JSON.parse(saved);
                        if (data.currentTime && data.currentTime > 5 && actualDuration && data.currentTime < actualDuration - 5) {
                            restoreTime = data.currentTime;
                        }
                    } catch { /* ignore */ }
                }

                // 2. Fall back to DB-synced metadata (cross-device support)
                if (restoreTime === null) {
                    const dbProgress = getAudioProgress(currentEpisode.id);
                    if (dbProgress?.metadata?.currentTime) {
                        const t = dbProgress.metadata.currentTime;
                        if (t > 5 && actualDuration && t < actualDuration - 5) {
                            restoreTime = t;
                        }
                    }
                }

                if (restoreTime !== null && audioRef.current) {
                    audioRef.current.currentTime = restoreTime;
                    setProgress((restoreTime / (actualDuration || 1)) * 100);
                }
            }
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            const time = (parseFloat(e.target.value) / 100) * duration;
            audioRef.current.currentTime = time;
            setProgress(parseFloat(e.target.value));
        }
    };

    const handleTogglePlay = () => {
        // RESUME AUDIO CONTEXT - CRITICAL FOR MOBILE
        if (analyser && analyser.context.state === 'suspended') {
            (analyser.context as AudioContext).resume().then(() => {
                console.log("AudioContext resumed successfully");
            });
        }
        togglePlay();
    };

    const skipRequest = (seconds: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime += seconds;
        }
    };

    const toggleSpeed = () => {
        const speeds = [1, 1.25, 1.5, 2];
        const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
        setPlaybackRate(speeds[nextIdx]);
    };

    const toggleSave = () => {
        if (!currentEpisode) return;
        if (isEpisodeSaved) {
            removeItem(currentEpisode.id, 'episode');
        } else {
            saveItem({
                id: currentEpisode.id,
                type: 'episode',
                title: currentEpisode.title,
                description: currentEpisode.description
            });
        }
    };

    const formatTime = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return '0:00';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const hasNextEpisode = currentEpisode ? allEpisodes.some(e => e.order === currentEpisode.order + 1) : false;

    if (!currentEpisode) return null;
    if (pathname === '/landing') return null;
    if (isDismissed && !showEndModal) return null;

    return (
        <>
            {/* Post-Episode Completion Modal */}
            {showEndModal && currentEpisode && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 pb-8">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-md"
                        onClick={() => setShowEndModal(false)}
                    />
                    {/* Modal Card */}
                    <div className="relative w-full max-w-md bg-[#0F0F14] border border-white/10 rounded-[9px] p-6 shadow-2xl flex flex-col gap-5 animate-in slide-in-from-bottom-4 duration-300">
                        {/* Header */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[9px] bg-emerald-500/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-400 text-2xl">check_circle</span>
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">Episode Complete</p>
                                <h3 className="text-base font-black uppercase tracking-tight text-white leading-tight line-clamp-1">{currentEpisode.title}</h3>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3">
                            {/* Take Quiz */}
                            <button
                                onClick={() => {
                                    setShowEndModal(false);
                                    router.push(`/library/episodes/${currentEpisode.id}`);
                                }}
                                className="w-full py-3.5 rounded-[9px] bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                            >
                                <span className="material-symbols-outlined text-sm">quiz</span>
                                Take Episode Quiz
                            </button>

                            {/* Play Next */}
                            {hasNextEpisode && (
                                <button
                                    onClick={() => {
                                        setShowEndModal(false);
                                        playNextEpisode(allEpisodes as any);
                                    }}
                                    className="w-full py-3.5 rounded-[9px] bg-white/10 hover:bg-white/15 text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">skip_next</span>
                                    Play Next Episode
                                </button>
                            )}

                            {/* Replay */}
                            <button
                                onClick={() => {
                                    if (audioRef.current) {
                                        audioRef.current.currentTime = 0;
                                        audioRef.current.play().catch(console.error);
                                        setIsPlaying(true);
                                    }
                                    setShowEndModal(false);
                                }}
                                className="w-full py-3.5 rounded-[9px] bg-white/10 hover:bg-white/15 text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">replay</span>
                                Replay Episode
                            </button>

                            {/* Dismiss */}
                            <button
                                onClick={() => setShowEndModal(false)}
                                className="text-[9px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors text-center"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mini Player */}
            {!isExpanded && (
                <div
                    className="fixed bottom-[60px] left-0 right-0 mx-auto w-[calc(100%-1rem)] max-w-2xl z-40 bg-[rgba(28,28,30,0.3)] backdrop-blur-xl border border-white/10 rounded-lg py-3 px-3 shadow-lg hover:bg-[rgba(44,44,46,0.5)] transition-colors"
                >
                    <div className="flex items-center gap-3">
                        {/* Thumbnail / Number */}
                        <div
                            onClick={() => setIsExpanded(true)}
                            className="h-8 w-8 rounded bg-indigo-600 flex flex-col items-center justify-center text-xs font-bold text-white shrink-0 leading-none cursor-pointer"
                        >
                            <span className="text-[6px] opacity-70 uppercase tracking-wider">EP</span>
                            <span className="text-xs">{currentEpisode.order}</span>
                        </div>

                        {/* Text Info */}
                        <div
                            onClick={() => setIsExpanded(true)}
                            className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer"
                        >
                            <h4 className="text-xs font-bold text-white leading-tight truncate">{currentEpisode.title}</h4>
                            <p className="text-[9px] text-indigo-400 font-medium uppercase tracking-wide">
                                {isPlaying ? 'Now Playing' : 'Paused'}
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 pr-1">
                            {/* Play/Pause Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="h-8 w-8 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg"
                            >
                                {isPlaying ? (
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                ) : (
                                    <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                )}
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); closePlayer(); }}
                                className="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-red-500/20 hover:text-red-400 active:scale-95 transition-all"
                                title="Close player"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar (Bottom Line) */}
                    <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Full Screen Player Overlay - Lowered Z-Index to allow GlobalNav (z-100) to stay on top */}
            <div className={`fixed inset-0 z-[80] bg-[#0A0A0F] text-white flex flex-col transition-transform duration-300 ${isExpanded ? 'translate-y-0' : 'translate-y-full'}`}>

                {/* Background Gradient */}
                {/* Dynamic Premium Background */}
                <div className="absolute inset-0 bg-[#060609] overflow-hidden">
                    {/* Ambient Glows */}
                    <div className={`absolute top-[-10%] left-[-20%] w-[70%] h-[70%] rounded-full blur-[120px] transition-colors duration-1000 ${
                        currentEpisode.category?.includes('Pharmacology') ? 'bg-pink-600/10' :
                        currentEpisode.category?.includes('Psychosocial') ? 'bg-purple-600/10' :
                        currentEpisode.category?.includes('Risk') ? 'bg-cyan-600/10' :
                        currentEpisode.category?.includes('Physiological') ? 'bg-orange-600/10' :
                        currentEpisode.category?.includes('Maternity') ? 'bg-rose-600/10' :
                        'bg-primary/10'
                    }`} />
                    <div className={`absolute bottom-[-10%] right-[-20%] w-[60%] h-[60%] rounded-full blur-[100px] transition-colors duration-1000 ${
                        currentEpisode.category?.includes('Pharmacology') ? 'bg-pink-900/10' :
                        currentEpisode.category?.includes('Risk') ? 'bg-cyan-900/10' :
                        'bg-primary/5'
                    }`} />
                </div>

                {/* Improved Vertical Layout: Increased top padding for breathing room */}
                <div className="relative z-10 flex flex-col h-full w-full max-w-md mx-auto pt-10 px-4 pb-32 overflow-hidden">

                    {/* Top Bar */}
                    <div className="flex-none flex items-center justify-between mb-4 mt-2">
                        <button onClick={() => setIsExpanded(false)} className="p-2 -ml-2 text-white/80 hover:text-white">
                            <span className="material-symbols-outlined text-3xl">close</span>
                        </button>
                        <div className="text-center opacity-80">
                            <span className="text-[10px] uppercase tracking-widest block">Now Playing</span>
                            <span className="text-xs font-bold">NCLEX Prep</span>
                        </div>
                        <div className="relative z-[220]">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 -mr-2 text-white/80 hover:text-white transition-colors relative z-[220]"
                            >
                                <span className="material-symbols-outlined text-2xl">more_vert</span>
                            </button>

                            {/* Options Menu Dropdown - FIXED POSITIONING FOR STABILITY */}
                            {isMenuOpen && (
                                <>
                                    <div 
                                        className="fixed inset-0 z-[230] bg-black/20 backdrop-blur-[2px]" 
                                        onClick={() => setIsMenuOpen(false)} 
                                    />
                                    <div 
                                        ref={menuRef}
                                        className="fixed right-4 top-16 w-56 bg-[#1A1A23] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2 z-[240] animate-in fade-in zoom-in-95 duration-200"
                                    >
                                        <div className="px-4 py-2 mb-1 border-b border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Episode Options</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setActiveView('transcript');
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-3.5 flex items-center gap-3 text-sm font-bold text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <span className="material-symbols-outlined text-xl">description</span>
                                            </div>
                                            <span>Show Transcript</span>
                                        </button>
                                        <div className="h-[1px] bg-white/5 mx-2 my-1" />
                                        <button 
                                            onClick={() => {
                                                setIsExpanded(false);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-3.5 flex items-center gap-3 text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-red-400/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-xl">close</span>
                                            </div>
                                            <span>Close Player</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Modern Glass Art Container / Transcript View */}
                    <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-4 mb-6 relative">
                        {activeView === 'player' ? (
                            <>
                                {/* Glow Behind Card */}
                                <div className={`absolute w-32 h-32 blur-[80px] opacity-20 transition-colors duration-1000 ${
                                    currentEpisode.category?.includes('Pharmacology') ? 'bg-pink-500' :
                                    currentEpisode.category?.includes('Risk') ? 'bg-cyan-500' :
                                    'bg-primary'
                                }`} />

                                <div className="w-full h-auto aspect-square max-h-[42vh] min-h-[260px] rounded-3xl bg-white/[0.03] backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex items-center justify-center relative overflow-hidden border border-white/10 group">
                                    {/* Inner Accent Line */}
                                    <div className={`absolute inset-0 border-t border-l border-white/10 rounded-3xl pointer-events-none`} />
                                    
                                    <div className="text-center p-6 w-full z-10">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 block transition-colors duration-1000 ${
                                            currentEpisode.category?.includes('Pharmacology') ? 'text-pink-400' :
                                            currentEpisode.category?.includes('Risk') ? 'text-cyan-400' :
                                            'text-primary'
                                        }`}>
                                            Episode {currentEpisode.order}
                                        </span>
                                        <h2 className="text-lg sm:text-xl font-black leading-tight tracking-tight text-white mb-2 drop-shadow-2xl px-6 break-words">
                                            {currentEpisode.title}
                                        </h2>
                                        <div className="h-0.5 w-8 mx-auto rounded-full bg-white/10 mt-3" />
                                    </div>
                                    
                                    {/* High Performance Audio Waveform Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 h-20 md:h-28 flex items-end justify-center px-8 pb-6 pointer-events-none">
                                        <AudioVisualizer 
                                            analyser={isPlaying ? analyser : null} 
                                            isPlaying={isPlaying} 
                                            barCount={24}
                                            className="flex items-end gap-1.5 h-full w-full opacity-100"
                                            barClassName={`flex-1 rounded-t-lg shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-colors duration-1000 ${
                                                currentEpisode.category?.includes('Pharmacology') ? 'bg-pink-500' :
                                                currentEpisode.category?.includes('Risk') ? 'bg-cyan-500' :
                                                currentEpisode.category?.includes('Psychosocial') ? 'bg-purple-500' :
                                                'bg-primary'
                                            }`}
                                            sensitivity={0.5}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full max-h-[60vh] flex flex-col bg-white/[0.03] backdrop-blur-3xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex-none p-4 border-b border-white/10 flex items-center justify-between">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-white/50">Transcript</h3>
                                    <button 
                                        onClick={() => setActiveView('player')}
                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                                        Back to Player
                                    </button>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <TranscriptViewer 
                                        segments={getTranscript(currentEpisode.id)} 
                                        currentTime={audioRef.current?.currentTime || 0}
                                        onSeek={(time) => {
                                            if (audioRef.current) {
                                                audioRef.current.currentTime = time;
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Controls Section */}
                    <div className="mt-auto pb-12">
                        {/* Track Info & Actions */}
                        <div className="flex-none mb-6 px-2 z-20">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 pr-4">
                                    <h2 className="text-base sm:text-lg font-black tracking-tight text-white mb-1 leading-tight">{currentEpisode.title}</h2>
                                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-normal">
                                        {currentEpisode.category} • NCLEX High-Yield
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={toggleSave}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                            isEpisodeSaved 
                                            ? 'bg-primary/20 border-primary/30 text-primary' 
                                            : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        <span className="material-symbols-outlined text-xl">{isEpisodeSaved ? 'bookmark_added' : 'bookmark'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex-none mb-6 group px-1">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress || 0}
                                onChange={handleSeek}
                                className={`w-full h-1.5 rounded-full appearance-none cursor-pointer transition-all bg-white/10 group-hover:h-2`}
                                style={{
                                    background: `linear-gradient(to right, ${
                                        currentEpisode.category?.includes('Pharmacology') ? '#ec4899' :
                                        currentEpisode.category?.includes('Risk') ? '#22d3ee' :
                                        currentEpisode.category?.includes('Psychosocial') ? '#a855f7' :
                                        '#257bf4'
                                    } ${progress}%, transparent ${progress}%)`
                                }}
                            />
                            <div className="flex justify-between text-xs font-medium text-white/50 mt-2">
                                <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Main Playback Controls */}
                        <div className="flex-none mb-8">
                            <div className="flex items-center justify-between px-2">
                                <button onClick={toggleSpeed} className="text-xs font-bold text-white/80 w-12 text-left hover:text-white">{playbackRate}x</button>
                                <div className="flex items-center gap-8">
                                    <button onClick={() => skipRequest(-15)} className="text-white hover:scale-110 transition-transform p-1">
                                        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                                            <text x="12" y="14" fontSize="5" textAnchor="middle" fill="currentColor" fontWeight="bold">15</text>
                                        </svg>
                                    </button>
                                    <button onClick={handleTogglePlay} className="h-16 w-16 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-lg">
                                        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                                            {isPlaying ? <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /> : <path d="M8 5v14l11-7z" />}
                                        </svg>
                                    </button>
                                    <button onClick={() => skipRequest(15)} className="text-white hover:scale-110 transition-transform p-1">
                                        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                                            <text x="12" y="14" fontSize="5" textAnchor="middle" fill="currentColor" fontWeight="bold">15</text>
                                        </svg>
                                    </button>
                                </div>
                                <div className="w-12" />
                            </div>
                        </div>

                        {/* Bottom Actions Block */}
                        <div className="flex-none flex items-center justify-between px-2">
                            <button className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">share</span>
                            </button>

                            {/* Quiz Link */}
                            {currentEpisode.id >= 2 && (
                                <Link
                                    href={`/quizzes/${currentEpisode.id}`}
                                    className={`px-8 py-3.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center gap-3 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] ${
                                        currentEpisode.category?.includes('Pharmacology') ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' :
                                        currentEpisode.category?.includes('Risk') ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' :
                                        'bg-primary/20 text-primary border border-primary/30'
                                    } hover:scale-[1.02] active:scale-95`}
                                >
                                    <span className="material-symbols-outlined text-lg">quiz</span>
                                    <span>Take Quiz</span>
                                </Link>
                            )}

                            <button className="w-11 h-11 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">playlist_add</span>
                            </button>
                        </div>
                    </div>
                </div>

                <audio
                    ref={audioRef}
                    src={currentEpisode.audioUrl}
                    crossOrigin="anonymous"
                    onCanPlay={() => {
                        if (pendingPlayRef.current && audioRef.current) {
                            pendingPlayRef.current = false;
                            
                            // Re-resume context for safe measure
                            if (analyser && analyser.context.state === 'suspended') {
                                (analyser.context as AudioContext).resume();
                            }

                            audioRef.current.play().catch((e) => {
                                console.warn("Deferred playback prevented:", e);
                                setIsPlaying(false);
                            });
                        }
                    }}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={handleEnded}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                />
            </div>
        </>
    );
}
