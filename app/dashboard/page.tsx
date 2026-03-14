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
import episodesPN from '@/app/data/episodes.json';
import episodesRN from '@/app/data/episodes-rn.json';
import quizzesPN from '@/app/data/quizzes.json';
import quizzesRN from '@/app/data/quizzes-rn.json';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const { currentStreak, hasCheckedInToday } = useStreak();
    const { quizResults } = useProgress();
    const { getDueCount } = useSRS();
    const { badges } = useAchievements();
    const { activeProgram, switchProgram, availablePrograms } = useProgram();
    const router = useRouter();

    const episodes = activeProgram.slug === 'nclex-rn' ? episodesRN : episodesPN;
    const quizzes = activeProgram.slug === 'nclex-rn' ? quizzesRN : quizzesPN;

    const unlockedBadges = badges.filter(b => b.unlocked);
    const recentBadges = [...unlockedBadges]
        .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
        .slice(0, 4);

    if (!user) {
        router.push('/landing');
        return null;
    }

    // Readiness Score Calculation
    const readinessScore = (() => {
        const currentProgramQuizIds = new Set(quizzes.map(q => q.id));
        const relevantResults = Object.values(quizResults).filter(r =>
            currentProgramQuizIds.has(r.episodeId)
        );
        if (relevantResults.length === 0) return 0;
        const totalPercentage = relevantResults.reduce((acc, curr) => {
            const bestRaw = (curr.bestScore !== undefined && curr.bestScore !== null) ? curr.bestScore : curr.score;
            if (!curr.total || curr.total === 0) return acc;
            return acc + ((bestRaw / curr.total) * 100);
        }, 0);
        return Math.round(totalPercentage / relevantResults.length);
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

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen pb-32 transition-colors duration-300">
            {/* Top Bar */}
            <header className="flex items-center justify-between px-6 py-5 sticky top-0 z-50 glass">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <span className="material-symbols-outlined text-primary">medical_services</span>
                    </div>
                    <div>
                        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Program</h2>
                        <div className="relative group">
                            <button className="text-lg font-bold flex items-center gap-1 hover:text-primary transition-colors">
                                {activeProgram.name} <span className="text-xs">▾</span>
                            </button>
                            <div className="absolute top-full left-0 mt-1 w-48 py-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50">
                                {availablePrograms.map(prog => (
                                    <button
                                        key={prog.id}
                                        onClick={() => switchProgram(prog.slug as any)}
                                        className={`w-full text-left px-4 py-2 hover:bg-white/5 transition-colors ${activeProgram.id === prog.id ? 'text-primary font-bold' : 'text-white/70 font-medium'}`}
                                    >
                                        {prog.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20">
                        <span className={`material-symbols-outlined text-orange-500 text-sm fill-1 ${hasCheckedInToday ? 'animate-bounce' : ''}`}>local_fire_department</span>
                        <span className="text-orange-500 font-bold text-sm">{currentStreak} Day Streak</span>
                    </div>
                    <button onClick={logout} className="p-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors" title="Logout">
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-6 flex flex-col gap-8 animate-in">
                {/* Readiness Score Ring */}
                <section className="flex flex-col items-center justify-center py-8">
                    <div className="relative flex items-center justify-center w-48 h-48">
                        {/* Background track circle */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="85"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-slate-800/50"
                            />
                            {/* Progress circle */}
                            <circle
                                cx="96"
                                cy="96"
                                r="85"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 85}
                                strokeDashoffset={2 * Math.PI * 85 * (1 - readinessScore / 100)}
                                strokeLinecap="round"
                                className="text-primary transition-all duration-1000 ease-out"
                                style={{ filter: 'drop-shadow(0 0 8px rgba(37, 123, 244, 0.5))' }}
                            />
                        </svg>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-bold tracking-tighter">{readinessScore}%</span>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">Readiness</span>
                        </div>
                        
                        {/* Outer Glow */}
                        <div className="absolute inset-0 rounded-full shadow-[0_0_40px_-10px_rgba(37,123,244,0.3)] pointer-events-none"></div>
                    </div>
                    <div className="mt-6 text-center">
                        <p className={`font-medium flex items-center gap-2 ${readinessScore >= 75 ? 'text-emerald-400' : readinessScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                            <span className="material-symbols-outlined text-sm">
                                {readinessScore >= 75 ? 'verified' : 'info'}
                            </span>
                            {readinessScore >= 75 ? 'High Probability of Passing' : readinessScore >= 50 ? 'Steady Progress' : 'More Practice Needed'}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">Based on {questionsAttempted} simulated questions</p>
                    </div>
                </section>

                {/* Main Action Buttons */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                        onClick={() => router.push('/quizzes')}
                        className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-primary to-blue-600 flex items-center justify-between shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity group"
                    >
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-white">play_circle</span>
                            <div className="text-left">
                                <span className="block text-white font-bold text-lg">Start Quick Quiz</span>
                                <span className="block text-white/70 text-xs">Test your knowledge now</span>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-white/50 group-hover:text-white transition-colors">chevron_right</span>
                    </button>
                    
                    <button 
                        onClick={() => router.push('/audio')}
                        className="w-full py-4 px-6 rounded-xl glass flex items-center justify-between hover:bg-white/5 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-indigo-400">graphic_eq</span>
                            <div className="text-left">
                                <span className="block font-bold text-lg">Start Audio Lesson</span>
                                <span className="block text-slate-400 text-xs text-indigo-200/60">Study while you move</span>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-500 group-hover:text-white transition-colors">chevron_right</span>
                    </button>
                </section>

                {/* SRS Mini-Widget */}
                <Link href="/reviews" className="glass rounded-xl p-5 flex items-center justify-between hover:bg-white/5 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-lg bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-indigo-400">layers</span>
                        </div>
                        <div>
                            <h3 className="font-bold">SRS Flashcards</h3>
                            <p className="text-slate-400 text-xs">Daily Spaced Repetition</p>
                        </div>
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-lg">
                        <span className="text-indigo-400 font-bold text-sm tracking-wide">{getDueCount()} due</span>
                    </div>
                </Link>

                {/* Achievements Section */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-lg font-bold tracking-tight">Recent Achievements</h3>
                        <Link className="text-primary text-sm font-medium hover:underline" href="/achievements">View All</Link>
                    </div>
                    <div className="flex overflow-x-auto gap-6 pb-2 snap-x hide-scrollbar">
                        {unlockedBadges.length > 0 ? recentBadges.map(badge => (
                            <div key={badge.id} className="flex flex-col items-center gap-2 min-w-[100px] snap-center">
                                <div className={`size-16 rounded-full glass flex items-center justify-center border transition-all hover:scale-110 ${
                                    badge.rarity === 'legendary' ? 'badge-glow-orange border-orange-500/20' :
                                    badge.rarity === 'epic' ? 'badge-glow-purple border-purple-500/20' :
                                    badge.rarity === 'rare' ? 'badge-glow-blue border-primary/20' :
                                    'badge-glow-emerald border-emerald-500/20'
                                }`}>
                                    <span className="text-3xl">{badge.icon}</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-center max-w-[80px] truncate">{badge.name}</span>
                            </div>
                        )) : (
                            <div className="w-full text-center py-4 bg-white/5 rounded-xl border border-white/5">
                                <p className="text-slate-500 text-xs italic">Complete quizzes to unlock badges!</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* AI Needs Review Section */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-lg font-bold tracking-tight">AI Needs Review</h3>
                        <p className="text-slate-400 text-xs">Based on your quiz performance</p>
                    </div>
                    <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
                        {weakEpisodes.length > 0 ? weakEpisodes.map(ep => (
                            <Link key={ep.id} href="/audio" className="min-w-[240px] snap-start glass rounded-xl p-4 flex flex-col gap-4 hover:bg-white/5 transition-all group">
                                <div className="w-full h-32 rounded-lg bg-slate-800 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent flex items-center justify-center">
                                        <span className="material-symbols-outlined text-white/20 text-5xl group-hover:scale-125 transition-transform">warning</span>
                                    </div>
                                    <div className={`absolute bottom-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded ${ep.status === 'CRITICAL' ? 'bg-red-500/80' : 'bg-orange-500/80'}`}>
                                        {ep.status}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-base line-clamp-1">{ep.title}</p>
                                    <p className="text-slate-400 text-xs font-medium">Last score: {ep.score}%</p>
                                </div>
                            </Link>
                        )) : (
                            <div className="w-full flex items-center gap-4 glass p-6 rounded-xl">
                                <span className="material-symbols-outlined text-emerald-400 text-4xl">check_circle</span>
                                <div>
                                    <p className="font-bold">Looking Good!</p>
                                    <p className="text-slate-400 text-xs">No critical weak areas identified yet. Keep it up!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Quick Access Grid */}
                <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
                    {[
                        { title: "Mind Maps", icon: "psychology", color: "text-emerald-400", href: "/mindmaps" },
                        { title: "Infographics", icon: "image", color: "text-pink-400", href: "/infographics" },
                        { title: "Slide Decks", icon: "presentation_play", color: "text-indigo-400", href: "/slides" },
                        { title: "Analytics", icon: "bar_chart", color: "text-blue-400", href: "/analytics" },
                        { title: "Exam Mode", icon: "assignment_late", color: "text-red-400", href: "/exam/setup" },
                        { title: "Study Guides", icon: "description", color: "text-amber-400", href: "/study-guides" },
                    ].map(item => (
                        <Link key={item.title} href={item.href} className="glass rounded-xl p-4 flex flex-col items-center gap-3 hover:bg-white/5 transition-all text-center group">
                            <span className={`material-symbols-outlined text-3xl ${item.color} group-hover:scale-110 transition-transform`}>{item.icon}</span>
                            <span className="text-xs font-bold uppercase tracking-tight">{item.title}</span>
                        </Link>
                    ))}
                </section>
            </main>
        </div>
    );
}
