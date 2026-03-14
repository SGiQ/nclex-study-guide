'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useProgress } from '@/app/context/ProgressContext';
import { useSRS } from '@/app/context/SRSContext';
import { useStreak } from '@/app/context/StreakContext';
import { useRouter } from 'next/navigation';
import quizzesData from '@/app/data/quizzes.json';
import episodesData from '@/app/data/episodes.json';

type QuizEntry = { id: number; episodeId: number; title: string; description: string; questionCount: number };
type EpEntry = { id: number; title: string; description: string };

export default function AnalyticsPage() {
    const { quizResults, audioProgress } = useProgress();
    const { getMasteredCount, getLearningCount, getNewCount, getDueCount, reviewData } = useSRS();
    const { currentStreak } = useStreak();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const quizzes = quizzesData as QuizEntry[];
    const episodes = episodesData as EpEntry[];

    // Build per-episode stats (topic by topic)
    const episodeStats = useMemo(() => {
        return episodes.map(ep => {
            const epQuizzes = quizzes.filter(q => q.episodeId === ep.id);
            // Try episode ID directly, then check all quiz IDs for that episode
            const results = epQuizzes.map(q => quizResults[q.id] || quizResults[ep.id]).filter(Boolean);

            const hasAudio = Object.values(audioProgress || {}).some(a => a.episodeId === ep.id && a.completed);

            let bestPct: number | null = null;
            if (results.length > 0) {
                const scores = results.map(r => {
                    const best = (r.bestScore !== undefined && r.bestScore !== null) ? r.bestScore : r.score;
                    return r.total > 0 ? (best / r.total) * 100 : 0;
                });
                bestPct = Math.round(Math.max(...scores));
            }

            return { ep, hasAudio, bestPct, quizCount: epQuizzes.length, resultCount: results.length };
        });
    }, [episodes, quizzes, quizResults, audioProgress]);

    const attempted = episodeStats.filter(s => s.bestPct !== null);
    const avgScore = attempted.length > 0
        ? Math.round(attempted.reduce((acc, s) => acc + (s.bestPct ?? 0), 0) / attempted.length)
        : null;

    const strong = attempted.filter(s => (s.bestPct ?? 0) >= 80);
    const needsWork = attempted.filter(s => (s.bestPct ?? 0) < 70);
    const audioCompleted = Object.values(audioProgress || {}).filter(a => a.completed).length;
    const totalQuestionsAnswered = Object.values(quizResults).reduce((sum, r) => sum + (r.total || 0), 0);
    const totalFlashcardsReviewed = Object.keys(reviewData).length;

    const getScoreColor = (pct: number | null) => {
        if (pct === null) return 'text-slate-600';
        if (pct >= 80) return 'text-emerald-400';
        if (pct >= 70) return 'text-amber-400';
        return 'text-red-400';
    };

    const getScoreBg = (pct: number | null) => {
        if (!isMounted || pct === null) return 'border-white/5';
        if (pct >= 80) return 'border-emerald-500/20';
        if (pct >= 70) return 'border-amber-500/20';
        return 'border-red-500/20';
    };

    const getBarColor = (pct: number | null) => {
        if (!isMounted || pct === null) return 'bg-slate-700';
        if (pct >= 80) return 'bg-emerald-500';
        if (pct >= 70) return 'bg-amber-500';
        return 'bg-red-500';
    };

    if (!isMounted) {
        return <div className="min-h-screen bg-background" />;
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-32">
            <div className="max-w-2xl mx-auto px-5 pt-12 pb-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black uppercase tracking-tight">Performance</h1>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">Your NCLEX Exam Analytics</p>
                </div>

                {/* Top KPI Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="glass-card rounded-[9px] p-5 border border-white/5 col-span-2 flex items-center gap-6">
                        <div className="text-center">
                            <p className={`text-4xl font-black ${avgScore !== null ? getScoreColor(avgScore) : 'text-slate-700'}`}>
                                {avgScore !== null ? `${avgScore}%` : '—'}
                            </p>
                            <p className="text-[8px] font-black uppercase text-slate-500 tracking-wider mt-1">Avg Quiz Score</p>
                        </div>
                        <div className="flex-1 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xl font-black text-orange-400">{currentStreak}</p>
                                <p className="text-[8px] font-black uppercase text-slate-600 tracking-wider mt-1">Day Streak</p>
                            </div>
                            <div>
                                <p className="text-xl font-black text-indigo-400">{audioCompleted}/{episodes.length}</p>
                                <p className="text-[8px] font-black uppercase text-slate-600 tracking-wider mt-1">Listened</p>
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-300">{totalQuestionsAnswered}</p>
                                <p className="text-[8px] font-black uppercase text-slate-600 tracking-wider mt-1">Q Answered</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SRS Cards */}
                <div className="glass-card rounded-[9px] p-5 border border-white/5 mb-6">
                    <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Flashcard Mastery (SRS)</h2>
                    <div className="grid grid-cols-4 gap-3 text-center">
                        <div>
                            <p className="text-xl font-black text-emerald-400">{getMasteredCount()}</p>
                            <p className="text-[8px] font-black uppercase text-slate-600 mt-1">Mastered</p>
                        </div>
                        <div>
                            <p className="text-xl font-black text-amber-400">{getLearningCount()}</p>
                            <p className="text-[8px] font-black uppercase text-slate-600 mt-1">Learning</p>
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-400">{getNewCount()}</p>
                            <p className="text-[8px] font-black uppercase text-slate-600 mt-1">New</p>
                        </div>
                        <div>
                            <p className="text-xl font-black text-pink-400">{getDueCount()}</p>
                            <p className="text-[8px] font-black uppercase text-slate-600 mt-1">Due Today</p>
                        </div>
                    </div>
                    {getDueCount() > 0 && (
                        <button onClick={() => router.push('/reviews')} className="mt-4 w-full py-2.5 rounded-[9px] bg-pink-500/15 border border-pink-500/25 text-pink-400 text-[10px] font-black uppercase tracking-widest hover:bg-pink-500/20 transition-colors">
                            Review {getDueCount()} Due Cards Now →
                        </button>
                    )}
                </div>

                {/* Needs Work Alert */}
                {needsWork.length > 0 && (
                    <div className="rounded-[9px] border border-red-500/30 bg-red-500/5 p-5 mb-4">
                        <h2 className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-3">⚠️ Needs Improvement — {needsWork.length} topic{needsWork.length !== 1 ? 's' : ''}</h2>
                        <div className="flex flex-wrap gap-2">
                            {needsWork.map(s => (
                                <button key={s.ep.id} onClick={() => router.push(`/library/episodes/${s.ep.id}`)}
                                    className="px-3 py-1.5 rounded-[6px] bg-red-500/15 border border-red-500/25 text-red-300 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/25 transition-colors">
                                    {s.ep.title.split(':')[0].trim()} · {s.bestPct}%
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Strong Areas */}
                {strong.length > 0 && (
                    <div className="rounded-[9px] border border-emerald-500/25 bg-emerald-500/5 p-5 mb-4">
                        <h2 className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-3">✅ Strong Areas — {strong.length} topic{strong.length !== 1 ? 's' : ''}</h2>
                        <div className="flex flex-wrap gap-2">
                            {strong.map(s => (
                                <span key={s.ep.id} className="px-3 py-1.5 rounded-[6px] bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                                    {s.ep.title.split(':')[0].trim()} · {s.bestPct}%
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {attempted.length === 0 && (
                    <div className="glass-card rounded-[9px] border border-white/5 p-16 text-center mb-4">
                        <span className="material-symbols-outlined text-5xl text-slate-700 block mb-4">bar_chart</span>
                        <p className="text-[10px] font-black uppercase text-slate-600 tracking-widest">No quiz data yet</p>
                        <p className="text-[9px] text-slate-700 mt-2">Take a quiz to see your performance breakdown</p>
                        <button onClick={() => router.push('/audio')} className="mt-6 px-6 py-2.5 rounded-[9px] bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest">
                            Start Studying →
                        </button>
                    </div>
                )}

                {/* Full Topic Breakdown */}
                <div className="space-y-2.5">
                    <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1 mb-3">All Topics</h2>
                    {episodeStats.map(({ ep, hasAudio, bestPct, quizCount, resultCount }) => (
                        <div key={ep.id} onClick={() => router.push(`/library/episodes/${ep.id}`)}
                            className={`glass-card rounded-[9px] p-4 border cursor-pointer hover:border-white/10 transition-all ${getScoreBg(bestPct)}`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasAudio ? 'bg-indigo-400' : 'bg-slate-800'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-tight truncate">{ep.title}</span>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                                    <span className="text-[9px] font-bold text-slate-600">{resultCount}/{quizCount}</span>
                                    <span className={`text-sm font-black w-10 text-right ${getScoreColor(bestPct)}`}>
                                        {bestPct !== null ? `${bestPct}%` : '—'}
                                    </span>
                                </div>
                            </div>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${getBarColor(bestPct)}`} style={{ width: `${bestPct ?? 0}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
