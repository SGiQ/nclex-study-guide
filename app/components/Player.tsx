'use client';

import Link from 'next/link';
import { usePlayer } from '@/app/context/PlayerContext';
import { useLibrary } from '@/app/context/LibraryContext';
import { useRef, useEffect, useState } from 'react';
import TranscriptViewer from './TranscriptViewer';
import { getTranscript } from '@/app/data/transcripts';

export default function Player() {
    const { currentEpisode, isPlaying, setIsPlaying, togglePlay, closePlayer, setCurrentTime } = usePlayer();
    const { saveItem, removeItem, isSaved } = useLibrary();

    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const isEpisodeSaved = currentEpisode ? isSaved(currentEpisode.id, 'episode') : false;

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch((e) => {
                    console.warn("Playback prevented:", e);
                    setIsPlaying(false);
                });
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentEpisode, setIsPlaying]);

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
    }, [currentEpisode]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const current = audioRef.current.currentTime;
            setCurrentTime(current);
            const total = audioRef.current.duration || duration || 1;

            if (audioRef.current.duration && Math.abs(audioRef.current.duration - duration) > 1) {
                setDuration(audioRef.current.duration);
            }

            setProgress((current / total) * 100);

            // Save progress to localStorage every 5 seconds
            if (currentEpisode && Math.floor(current) % 5 === 0) {
                const progressData = {
                    currentTime: current,
                    duration: total,
                    lastUpdated: Date.now()
                };
                localStorage.setItem(`audio_progress_${currentEpisode.id}`, JSON.stringify(progressData));
            }
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current?.duration) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (audioRef.current) {
            const time = (parseFloat(e.target.value) / 100) * duration;
            audioRef.current.currentTime = time;
            setProgress(parseFloat(e.target.value));
        }
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

    if (!currentEpisode) return null;

    return (
        <>
            {/* Mini Player */}
            {!isExpanded && (
                <div
                    className="fixed bottom-[74px] left-0 right-0 mx-auto w-[calc(100%-1rem)] max-w-2xl z-40 bg-[rgba(28,28,30,0.3)] backdrop-blur-xl border border-white/10 rounded-lg py-3 px-3 shadow-lg hover:bg-[rgba(44,44,46,0.5)] transition-colors"
                >
                    <div className="flex items-center gap-3">
                        {/* Thumbnail / Number */}
                        <div
                            onClick={() => setIsExpanded(true)}
                            className="h-10 w-10 rounded bg-indigo-600 flex flex-col items-center justify-center text-xs font-bold text-white shrink-0 leading-none cursor-pointer"
                        >
                            <span className="text-[7px] opacity-70 uppercase tracking-wider">EP</span>
                            <span className="text-sm">{currentEpisode.order}</span>
                        </div>

                        {/* Text Info */}
                        <div
                            onClick={() => setIsExpanded(true)}
                            className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer"
                        >
                            <h4 className="text-sm font-bold text-white leading-tight truncate">{currentEpisode.title}</h4>
                            <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wide">
                                {isPlaying ? 'Now Playing' : 'Paused'}
                            </p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 pr-1">
                            {/* Play/Pause Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-lg"
                            >
                                {isPlaying ? (
                                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                ) : (
                                    <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
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

            {/* Full Screen Player Overlay */}
            <div className={`fixed inset-0 z-50 bg-[#0A0A0F] text-white flex flex-col transition-transform duration-300 ${isExpanded ? 'translate-y-0' : 'translate-y-full'}`}>

                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-red-800 via-[#8B1A1A] to-black opacity-90 pointer-events-none" />

                {/* Improved Vertical Layout: Using flex-col with overflow handling */}
                <div className="relative z-10 flex flex-col h-full w-full max-w-md mx-auto p-4 overflow-y-auto no-scrollbar">

                    {/* Top Bar */}
                    <div className="flex-none flex items-center justify-between mb-4 mt-2">
                        <button onClick={() => setIsExpanded(false)} className="p-2 -ml-2 text-white/80 hover:text-white">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="text-center opacity-80">
                            <span className="text-[10px] uppercase tracking-widest block">Now Playing</span>
                            <span className="text-xs font-bold">NCLEX Prep</span>
                        </div>
                        <button className="p-2 -mr-2 text-white/80 hover:text-white">
                            <span className="text-xl">⋮</span>
                        </button>
                    </div>

                    {/* Flexible Album Art Container - Fix Overlap */}
                    <div className="flex-1 min-h-0 flex items-center justify-center py-2 mb-4">
                        <div className="aspect-square h-full max-h-[35vh] w-auto rounded-lg bg-gradient-to-br from-red-500 to-orange-600 shadow-2xl flex items-center justify-center relative overflow-hidden ring-1 ring-white/10">
                            <div className="text-center p-6 w-full">
                                <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight mb-2 text-white drop-shadow-md break-words">
                                    {currentEpisode.title}
                                </h2>
                                <div className="absolute bottom-4 left-5 opacity-70">
                                    <span className="font-bold text-black/40 text-sm sm:text-lg uppercase tracking-widest">NCLEX</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Track Info */}
                    <div className="flex-none mb-6 px-1 z-20">
                        <div className="flex items-start justify-between">
                            <div className="min-w-0 pr-4">
                                <h2 className="text-xl sm:text-2xl font-bold truncate leading-tight">{currentEpisode.title}</h2>
                                <p className="text-white/70 text-sm truncate mt-1">{currentEpisode.description}</p>
                            </div>
                            <button className="text-2xl opacity-70 hover:opacity-100 flex-shrink-0">⊕</button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex-none mb-4 group px-1">
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress || 0}
                            onChange={handleSeek}
                            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100 transition-all"
                            style={{
                                background: `linear-gradient(to right, white ${progress}%, rgba(255,255,255,0.2) ${progress}%)`
                            }}
                        />
                        <div className="flex justify-between text-xs font-medium text-white/50 mt-2">
                            <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>

                    {/* Main Controls - Always visible at bottom */}
                    <div className="flex-none mt-auto mb-6">
                        <div className="flex items-center justify-between px-2">
                            {/* Speed */}
                            <button
                                onClick={toggleSpeed}
                                className="text-xs font-bold text-white/80 w-12 text-left hover:text-white"
                            >
                                {playbackRate}x
                            </button>

                            {/* Center Controls */}
                            <div className="flex items-center gap-8">
                                {/* Skip Back 15s */}
                                <button onClick={() => skipRequest(-15)} className="text-white hover:scale-110 transition-transform p-2 group">
                                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                                        <text x="12" y="14" fontSize="5" textAnchor="middle" fill="currentColor" fontWeight="bold" stroke="none">15</text>
                                    </svg>
                                </button>

                                <button
                                    onClick={togglePlay}
                                    className="h-16 w-16 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-lg"
                                >
                                    {isPlaying ? (
                                        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                                    ) : (
                                        <svg className="w-8 h-8 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                    )}
                                </button>

                                {/* Skip Forward 15s */}
                                <button onClick={() => skipRequest(15)} className="text-white hover:scale-110 transition-transform p-2 group">
                                    <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 5V1l5 5-5 5V7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8z" />
                                        <text x="12" y="14" fontSize="5" textAnchor="middle" fill="currentColor" fontWeight="bold" stroke="none">15</text>
                                    </svg>
                                </button>
                            </div>

                            {/* Menu/More -> now Save Button */}
                            <button
                                onClick={toggleSave}
                                className={`w-12 text-right transition-colors ${isEpisodeSaved ? 'text-indigo-400' : 'text-white/80 hover:text-white'}`}
                            >
                                {isEpisodeSaved ? (
                                    <svg className="w-6 h-6 inline-block" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>



                    {/* Bottom Icons (Connect/Share) */}
                    <div className="flex-none flex items-center justify-between px-4 pb-2">
                        <button className="text-white/60 hover:text-white">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </button>

                        {/* Quiz Link for current episode */}
                        {currentEpisode.id >= 2 && (
                            <Link
                                href={`/quizzes/${currentEpisode.id}`}
                                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
                            >
                                <span>Take Quiz</span>
                                <span>→</span>
                            </Link>
                        )}

                        <button className="text-white/60 hover:text-white">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>

                </div>

                <audio
                    ref={audioRef}
                    src={currentEpisode.audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                />
            </div>
        </>
    );
}
