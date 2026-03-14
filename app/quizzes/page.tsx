'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLibrary } from '@/app/context/LibraryContext';
import { useProgress } from '@/app/context/ProgressContext';
import { useProgram } from '@/app/context/ProgramContext';
import ScoreHistoryModal from '@/app/components/ScoreHistoryModal';

export default function QuizListPage() {
    const { getQuizResult } = useProgress();
    const { isSaved, saveItem, removeItem } = useLibrary();
    const { activeProgram } = useProgram();
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [historyQuizId, setHistoryQuizId] = useState<number | null>(null);
    const [historyQuizTitle, setHistoryQuizTitle] = useState<string>('');

    useEffect(() => {
        fetch(`/api/quizzes?program=${activeProgram.slug}`)
            .then(res => res.json())
            .then(data => setQuizzes(data));
    }, [activeProgram.slug]);

    const handleToggleSave = (e: React.MouseEvent, quiz: any) => {
        e.preventDefault(); // Prevent navigation
        if (isSaved(quiz.id, 'quiz')) {
            removeItem(quiz.id, 'quiz');
        } else {
            saveItem({
                id: quiz.id,
                type: 'quiz',
                title: quiz.title,
                description: quiz.description
            });
        }
    };

    return (
        <div className="min-h-dvh bg-background text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 animate-in">
                <div className="mx-auto max-w-2xl px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/5 border border-white/5 transition-colors"
                        >
                            <span className="material-symbols-outlined text-xl">arrow_back</span>
                        </Link>
                        <h1 className="text-xl font-black uppercase tracking-tight leading-none text-slate-100">{activeProgram.name} Quizzes</h1>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-6 py-8 pb-mini-player">
                <div className="mb-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Practice Tests</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Select a topic to begin a focused practice session.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {[...quizzes]
                        .sort((a, b) => {
                            // Sort by episodeId, putting quizzes without episodeId at the end
                            const aEpisode = a.episodeId ?? 999;
                            const bEpisode = b.episodeId ?? 999;
                            return aEpisode - bEpisode;
                        })
                        .map((quiz) => {
                            const result = getQuizResult(quiz.id);
                            const isCompleted = !!result;
                            const scorePercent = result ? Math.round((result.score / result.total) * 100) : 0;
                            const bestScore = result?.bestScore || scorePercent;
                            const attemptCount = result?.attemptCount || 0;
                            const isBookmarked = isSaved(quiz.id, 'quiz');

                            return (
                                <Link
                                    key={quiz.id}
                                    href={`/quizzes/${quiz.id}`}
                                    className="group relative overflow-hidden rounded-3xl glass hover:bg-white/10 transition-all duration-300 border border-white/5 hover:border-white/20 block"
                                >
                                    {/* Decorative Gradient Background */}
                                    <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${quiz.color}`} />

                                    <div className="relative p-6 h-full flex flex-col">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${quiz.color} flex items-center justify-center border border-white/10 text-white`}>
                                                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">quiz</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Save Button */}
                                                <button
                                                    onClick={(e) => handleToggleSave(e, quiz)}
                                                    className={`h-10 w-10 flex items-center justify-center rounded-xl transition-colors ${isBookmarked ? 'bg-indigo-500/20 text-indigo-500 border border-indigo-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/5'}`}
                                                >
                                                    <span className="material-symbols-outlined text-xl">{isBookmarked ? 'bookmark_added' : 'bookmark_add'}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Progress Bar / Score Display */}
                                        {isCompleted && (
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={scorePercent >= 70 ? 'text-emerald-500' : 'text-orange-500'}>
                                                            Latest: {scorePercent}%
                                                        </span>
                                                        {bestScore > scorePercent && (
                                                            <span className="text-emerald-400">⭐ Best: {bestScore}%</span>
                                                        )}
                                                    </div>
                                                    <span className="text-foreground/40">Attempt {attemptCount}</span>
                                                </div>
                                                <div className="h-2 w-full bg-surface/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${scorePercent >= 70 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                                        style={{ width: `${scorePercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {!isCompleted && (() => {
                                            // Check for in-progress quiz
                                            const savedProgressStr = typeof window !== 'undefined' ? localStorage.getItem(`quiz_progress_${quiz.id}`) : null;
                                            let inProgress = false;
                                            let currentQuestion = 0;

                                            if (savedProgressStr) {
                                                try {
                                                    const savedProgress = JSON.parse(savedProgressStr);
                                                    if (savedProgress.currentQuestionIndex > 0 || savedProgress.score > 0) {
                                                        inProgress = true;
                                                        currentQuestion = savedProgress.currentQuestionIndex + 1;
                                                    }
                                                } catch (e) { }
                                            }

                                            return (
                                                <div className="mb-4">
                                                    {inProgress ? (
                                                        <>
                                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1">
                                                                <span className="text-yellow-500">📝 In Progress</span>
                                                                <span className="text-foreground/40">Question {currentQuestion}/{quiz.questionCount}</span>
                                                            </div>
                                                            <div className="h-2 w-full bg-surface/10 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full rounded-full bg-yellow-500"
                                                                    style={{ width: `${(currentQuestion / quiz.questionCount) * 100}%` }}
                                                                />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            {quiz.episodeId && (
                                                                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md border border-indigo-500/30">
                                                                    Episode {quiz.episodeId}
                                                                </span>
                                                            )}
                                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-surface/10 px-2 py-1 rounded-md text-foreground/60">
                                                                {quiz.questionCount} Questions
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}

                                        <h3 className="text-lg font-black uppercase tracking-tight leading-tight text-white group-hover:text-primary transition-colors mb-2">
                                            {quiz.title}
                                        </h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex-1 line-clamp-2">
                                            {quiz.description}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-white transition-colors">
                                                <span>{isCompleted ? 'Retake Quiz' : 'Start Quiz'}</span>
                                                <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                                            </div>
                                            {isCompleted && attemptCount > 0 && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setHistoryQuizId(quiz.id);
                                                        setHistoryQuizTitle(quiz.title);
                                                    }}
                                                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-sm">bar_chart</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                </div>

                {/* Coming Soon Section */}
                <div className="mt-12 p-6 rounded-lg border border-dashed border-white/10 text-center">
                    <p className="text-white/40 text-sm">More categories coming soon...</p>
                </div>
            </main>

            {/* Score History Modal */}
            {historyQuizId && (
                <ScoreHistoryModal
                    quizId={historyQuizId}
                    quizTitle={historyQuizTitle}
                    isOpen={true}
                    onClose={() => setHistoryQuizId(null)}
                />
            )}
        </div>
    );
}
