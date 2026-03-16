'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useStreak } from '@/app/context/StreakContext';
import { useProgress } from '@/app/context/ProgressContext';
import { useSRS } from '@/app/context/SRSContext';
import { useAchievements } from '@/app/context/AchievementContext';
import { useProgram } from '@/app/context/ProgramContext';
import { usePlayer } from '@/app/context/PlayerContext';
import episodesPN from '@/app/data/episodes.json';
import episodesRN from '@/app/data/episodes-rn.json';
import quizzesPN from '@/app/data/quizzes.json';
import quizzesRN from '@/app/data/quizzes-rn.json';

export default function DashboardPage() {
    const { user, logout, isLoading: authLoading } = useAuth();
    const { currentStreak, hasCheckedInToday } = useStreak();
    const { quizResults, audioProgress, isLoading: progressLoading } = useProgress();
    
    const isLoading = authLoading || progressLoading;

    const { getDueCount, getMasteredCount } = useSRS();
    const { badges } = useAchievements();
    const { activeProgram, switchProgram, availablePrograms } = useProgram();
    const { playEpisode } = usePlayer();
    const router = useRouter();

    const episodes = activeProgram.slug === 'nclex-rn' ? episodesRN : episodesPN;
    const quizzes = activeProgram.slug === 'nclex-rn' ? quizzesRN : quizzesPN;

    const unlockedBadges = badges.filter(b => b.unlocked);
    const recentBadges = [...unlockedBadges]
        .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
        .slice(0, 4);

    React.useEffect(() => {
        if (!isLoading && !user) {
            router.push('/landing');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Readiness Score Calculation (Per-Episode Weighted Formula)
    const readinessScore = (() => {
        const totalEpisodes = episodes.length;
        if (totalEpisodes === 0) return 0;

        const currentProgramEpisodeIds = new Set(episodes.map(e => e.id));

        // 3 points per episode for listening to completion or partial progress
        const AUDIO_POINTS_PER_EP = 3;
        let audioPoints = 0;
        Object.values(audioProgress || {}).forEach(a => {
            if (!currentProgramEpisodeIds.has(a.episodeId)) return;
            if (a.completed) {
                audioPoints += AUDIO_POINTS_PER_EP;
            } else if (a.metadata?.currentTime && a.metadata?.duration) {
                // Award partial points based on listening progress
                const pct = Math.min(a.metadata.currentTime / a.metadata.duration, 1);
                audioPoints += AUDIO_POINTS_PER_EP * pct;
            }
        });

        // 3 points per episode for quiz, scaled by best score percentage
        const QUIZ_POINTS_PER_EP = 3;
        let quizPoints = 0;
        episodes.forEach(ep => {
            const result = quizResults[ep.id];
            if (result && result.total > 0) {
                const bestRaw = (result.bestScore !== undefined && result.bestScore !== null) ? result.bestScore : result.score;
                const pct = Math.min(bestRaw / result.total, 1);
                quizPoints += QUIZ_POINTS_PER_EP * pct;
            }
        });

        // Flashcard bonus: +0.5 per mastered card, capped at 5 bonus points
        const FLASH_BONUS_PER_CARD = 0.5;
        const FLASH_BONUS_CAP = 5;
        const masteredCount = getMasteredCount ? getMasteredCount() : 0;
        const flashBonus = Math.min(masteredCount * FLASH_BONUS_PER_CARD, FLASH_BONUS_CAP);

        const total = Math.min(100, Math.round(audioPoints + quizPoints + flashBonus));
        return total;
    })();

    const questionsAttempted = Object.values(quizResults)
        .filter(r => new Set(quizzes.map(q => q.id)).has(r.episodeId))
        .reduce((acc, curr) => acc + curr.total, 0);

    // AI Needs Review Logic
    const weakEpisodes = episodes.filter(ep => {
        const result = quizResults[ep.id];
        return result && (result.score / result.total) < 0.7;
    }).map(ep => ({
        ...ep,
        score: Math.round((quizResults[ep.id].score / quizResults[ep.id].total) * 100),
        status: (quizResults[ep.id].score / quizResults[ep.id].total) < 0.5 ? 'CRITICAL' : 'MEDIUM'
    }));

    // Find most recently played episode
    let recentAudioId = episodes.length > 0 ? episodes[0].id : null;
    let maxTime = 0;
    
    Object.entries(audioProgress || {}).forEach(([idStr, prog]) => {
        const time = prog.metadata?.lastUpdated || 0;
        if (time > maxTime) {
            maxTime = time;
            recentAudioId = parseInt(idStr);
        }
    });
    
    const recentAudio = episodes.find(e => e.id === recentAudioId) || episodes[0];
    const relatedQuiz = recentAudio ? quizzes.find(q => q.episodeId === recentAudio.id) : quizzes[0];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-500 items-center">
            {/* Header */}
            <div className="w-full max-w-2xl px-6 pt-12 pb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Dashboard</h1>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Ready for the NCLEX</p>
                </div>
                <div className="flex gap-3">
                    <button className="h-12 w-12 rounded-xl glass border border-white/5 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button className="h-12 w-12 rounded-xl glass border border-white/5 flex items-center justify-center text-white/40">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                </div>
            </div>

            <main className="w-full max-w-2xl flex-1 px-6 pb-32 space-y-10">
                {/* Readiness Score — Circular Ring */}
                <section className="flex flex-col items-center justify-center py-4">
                    <div className="text-center mb-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">NCLEX Readiness</span>
                    </div>
                    {/* SVG Ring */}
                    <div className="relative flex items-center justify-center w-52 h-52">
                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200">
                            {/* Track */}
                            <circle
                                cx="100" cy="100" r="82"
                                fill="none"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="12"
                                strokeLinecap="round"
                            />
                            {/* Progress */}
                            <circle
                                cx="100" cy="100" r="82"
                                fill="none"
                                stroke={readinessScore >= 75 ? '#10b981' : readinessScore >= 50 ? '#eab308' : '#ef4444'}
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 82}`}
                                strokeDashoffset={`${2 * Math.PI * 82 * (1 - readinessScore / 100)}`}
                                style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s' }}
                            />
                        </svg>
                        {/* Center number */}
                        <div className="text-center z-10">
                            <div className="flex items-baseline gap-1">
                                <span className="text-7xl font-black tabular-nums tracking-tighter">{readinessScore}</span>
                                <span className="text-2xl font-black opacity-30">%</span>
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mt-1">Readiness</p>
                        </div>
                    </div>
                </section>

                {/* Primary Actions Stack */}
                <div className="flex flex-col gap-4 w-full">
                    {/* 1. Audio Lessons */}
                    <button 
                        onClick={() => router.push('/audio')}
                        className="w-full py-5 px-6 rounded-[9px] glass border border-white/5 text-foreground flex items-center gap-4 hover:bg-white/5 active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors" />
                        <div className="h-12 w-12 rounded-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 relative z-10">
                            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">headphones</span>
                        </div>
                        <div className="text-left flex-1 relative z-10">
                            <h3 className="text-lg font-black uppercase tracking-tight">Audio Lessons</h3>
                            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-0.5">Listen & Learn on the go</p>
                        </div>
                        <span className="material-symbols-outlined text-xl opacity-30 group-hover:translate-x-1 transition-all relative z-10">arrow_forward_ios</span>
                    </button>

                    {/* 2. Resume last lesson */}
                    <button 
                        onClick={() => {
                            if (recentAudio) {
                                playEpisode(recentAudio);
                            }
                            router.push('/audio');
                        }}
                        className="w-full py-5 px-6 rounded-[9px] glass border border-white/5 text-foreground flex items-center gap-4 hover:bg-white/5 active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                        <div className="h-12 w-12 rounded-[9px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0 relative z-10">
                            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">play_arrow</span>
                        </div>
                        <div className="text-left flex-1 overflow-hidden relative z-10">
                            <h3 className="text-lg font-black uppercase tracking-tight truncate">Resume {recentAudio?.title || "Lesson"}</h3>
                            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-0.5">Jump back in</p>
                        </div>
                        <span className="material-symbols-outlined text-xl opacity-30 group-hover:translate-x-1 transition-all relative z-10">arrow_forward_ios</span>
                    </button>

                    {/* 3. Quick Quiz */}
                    <button 
                        onClick={() => router.push('/quizzes/quick')}
                        className="w-full py-5 px-6 rounded-[9px] glass border border-white/5 text-foreground flex items-center gap-4 hover:bg-white/5 active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-amber-500/5 group-hover:bg-amber-500/10 transition-colors" />
                        <div className="h-12 w-12 rounded-[9px] bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center flex-shrink-0 relative z-10">
                            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">bolt</span>
                        </div>
                        <div className="text-left flex-1 relative z-10">
                            <h3 className="text-lg font-black uppercase tracking-tight">Quick Quiz</h3>
                            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-0.5">10 Random Questions</p>
                        </div>
                        <span className="material-symbols-outlined text-xl opacity-30 group-hover:translate-x-1 transition-all relative z-10">arrow_forward_ios</span>
                    </button>

                    {/* 4. Full quiz based on last episode */}
                    {relatedQuiz && (
                        <button 
                            onClick={() => router.push(`/quizzes/${relatedQuiz.id}`)}
                            className="w-full py-5 px-6 rounded-[9px] glass border border-white/5 text-foreground flex items-center gap-4 hover:bg-white/5 active:scale-95 transition-all group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
                            <div className="h-12 w-12 rounded-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 relative z-10">
                                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">assignment</span>
                            </div>
                            <div className="text-left flex-1 overflow-hidden relative z-10">
                                <h3 className="text-lg font-black uppercase tracking-tight truncate">{relatedQuiz.title}</h3>
                                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-0.5">Test your recent lesson</p>
                            </div>
                            <span className="material-symbols-outlined text-xl opacity-30 group-hover:translate-x-1 transition-all relative z-10">arrow_forward_ios</span>
                        </button>
                    )}

                    {/* 5. Daily Flashcards — glows when cards are due */}
                    <button 
                        onClick={() => router.push('/reviews')}
                        className={`w-full py-5 px-6 rounded-[9px] glass border text-foreground flex items-center gap-4 active:scale-95 transition-all group overflow-hidden relative ${getDueCount() > 0 ? 'border-pink-500/40 shadow-[0_0_20px_-5px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.4)]' : 'border-white/5 hover:bg-white/5'}`}
                    >
                        <div className={`absolute inset-0 transition-colors ${getDueCount() > 0 ? 'bg-pink-500/10 group-hover:bg-pink-500/15' : 'bg-pink-500/5 group-hover:bg-pink-500/10'}`} />
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                            <span className="material-symbols-outlined text-8xl">style</span>
                        </div>
                        <div className={`h-12 w-12 rounded-[9px] border flex items-center justify-center flex-shrink-0 relative z-10 ${getDueCount() > 0 ? 'bg-pink-500/20 text-pink-400 border-pink-500/40' : 'bg-pink-500/10 text-pink-400 border-pink-500/20'}`}>
                            <span className={`material-symbols-outlined text-2xl transition-transform group-hover:scale-110 ${getDueCount() > 0 ? 'animate-pulse' : ''}`}>style</span>
                        </div>
                        <div className="text-left flex-1 relative z-10 pr-4">
                            <h3 className="text-lg font-black uppercase tracking-tight flex items-center justify-between">
                                Daily Flashcards
                                {getDueCount() > 0 && (
                                    <span className="bg-pink-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md ml-2 animate-bounce">
                                        {getDueCount()} Due!
                                    </span>
                                )}
                            </h3>
                            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-0.5">
                                {getDueCount() > 0 ? `${getDueCount()} cards ready for review` : 'Spaced Repetition Review'}
                            </p>
                        </div>
                        <span className="material-symbols-outlined text-xl opacity-30 group-hover:translate-x-1 transition-all relative z-10">arrow_forward_ios</span>
                    </button>

                    {/* 6. Exam Mode */}
                    <button 
                        onClick={() => router.push('/exam/setup')}
                        className="w-full py-5 px-6 rounded-[9px] glass border border-white/5 text-foreground flex items-center gap-4 hover:bg-white/5 active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-amber-600/5 group-hover:bg-amber-600/10 transition-colors" />
                        <div className="absolute top-0 right-0 p-2 opacity-10 text-white">
                            <span className="material-symbols-outlined text-8xl">verified</span>
                        </div>
                        <div className="h-12 w-12 rounded-[9px] bg-amber-600/10 text-amber-500 border border-amber-600/20 flex items-center justify-center flex-shrink-0 relative z-10">
                            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">verified</span>
                        </div>
                        <div className="text-left flex-1 relative z-10">
                            <h3 className="text-lg font-black uppercase tracking-tight">Exam Mode</h3>
                            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-0.5">Full NCLEX Simulation</p>
                        </div>
                        <span className="material-symbols-outlined text-xl opacity-30 group-hover:translate-x-1 transition-all relative z-10">arrow_forward_ios</span>
                    </button>
                </div>

                {/* AI Needs Review Section */}
                <section className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Needs Review</h2>
                        <button className="text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">View All</button>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 snap-x snap-mandatory">
                        {weakEpisodes.length > 0 ? weakEpisodes.map((ep, i) => (
                            <div key={ep.id || i} className="min-w-[280px] snap-center glass rounded-[9px] p-6 border border-white/5 flex flex-col gap-4">
                                <div className="h-12 w-12 rounded-[9px] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                                    <span className="material-symbols-outlined">warning</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-black uppercase tracking-tight leading-tight">{ep.title}</h3>
                                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Score • {ep.score}%</p>
                                </div>
                                <button className="w-full py-3 rounded-[9px] bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                                    Start Drill
                                </button>
                            </div>
                        )) : (
                            <div className="w-full py-12 glass rounded-[9px] border border-white/5 text-center px-6">
                                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">All topics are up to date! Great job.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Recent Achievements */}
                <section className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Recent Achievements</h2>
                        <span className="material-symbols-outlined text-slate-600">military_tech</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 snap-x snap-mandatory">
                        {unlockedBadges.length > 0 ? recentBadges.map((ach, i) => (
                            <div key={ach.id || i} className="min-w-[200px] snap-center glass rounded-[9px] p-6 border border-white/5 flex flex-col items-center text-center gap-4">
                                <div className={`h-16 w-16 rounded-full bg-white/5 flex items-center justify-center text-3xl`}>
                                    <span className="material-symbols-outlined text-4xl">{ach.icon}</span>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-tight">{ach.name}</h4>
                                    <p className="text-[10px] font-bold opacity-40 uppercase mt-1">Unlocked</p>
                                </div>
                            </div>
                        )) : (
                            <div className="w-full py-8 glass rounded-[9px] border border-white/5 text-center">
                                <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">No badges unlocked yet</p>
                            </div>
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
}
