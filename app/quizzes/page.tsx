'use client';

import Link from 'next/link';
import quizzes from '@/app/data/quizzes.json';
import { useLibrary } from '@/app/context/LibraryContext';
import { useProgress } from '@/app/context/ProgressContext';

export default function QuizListPage() {
    const { getQuizResult } = useProgress();
    const { isSaved, saveItem, removeItem } = useLibrary();

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
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-nav-border animate-in">
                <div className="mx-auto max-w-2xl px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/dashboard"
                            className="grid h-10 w-10 place-items-center rounded-full bg-surface/10 hover:bg-surface/20 active:bg-surface/30 text-foreground"
                        >
                            ←
                        </Link>
                        <h1 className="text-xl font-semibold leading-none">Quizzes</h1>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-6 py-8 pb-32">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">Practice Tests</h2>
                    <p className="text-foreground/60">Select a topic to begin a focused practice session. Immediate feedback provided.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {quizzes.map((quiz) => {
                        const result = getQuizResult(quiz.id);
                        const isCompleted = !!result;
                        const scorePercent = result ? Math.round((result.score / result.total) * 100) : 0;
                        const isBookmarked = isSaved(quiz.id, 'quiz');

                        return (
                            <Link
                                key={quiz.id}
                                href={`/quizzes/${quiz.id}`}
                                className="group relative overflow-hidden rounded-2xl bg-card hover:bg-surface/5 transition-all duration-300 border border-card-border hover:border-border hover:shadow-2xl hover:-translate-y-1 block"
                            >
                                {/* Decorative Gradient Background */}
                                <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${quiz.color}`} />

                                <div className="relative p-6 h-full flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${quiz.color} flex items-center justify-center shadow-lg text-white`}>
                                            <span className="text-lg font-bold">?</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Save Button */}
                                            <button
                                                onClick={(e) => handleToggleSave(e, quiz)}
                                                className={`h-8 w-8 grid place-items-center rounded-full transition-colors ${isBookmarked ? 'bg-indigo-500/20 text-indigo-500' : 'bg-surface/10 text-muted-foreground hover:bg-surface/20'}`}
                                            >
                                                <span className="text-sm">{isBookmarked ? '🔖' : '🏷️'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Progress Bar / Score Display */}
                                    {isCompleted && (
                                        <div className="mb-4">
                                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1">
                                                <span className={scorePercent >= 70 ? 'text-emerald-500' : 'text-orange-500'}>
                                                    {scorePercent}% Score
                                                </span>
                                                <span className="text-foreground/40">Completed</span>
                                            </div>
                                            <div className="h-2 w-full bg-surface/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${scorePercent >= 70 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                                    style={{ width: `${scorePercent}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {!isCompleted && (
                                        <div className="mb-4 flex items-center gap-2">
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

                                    <h3 className="text-lg font-bold mb-2 leading-tight text-foreground group-hover:text-purple-400 transition-colors">
                                        {quiz.title}
                                    </h3>
                                    <p className="text-sm text-foreground/50 mb-6 flex-1">
                                        {quiz.description}
                                    </p>

                                    <div className="flex items-center gap-2 text-sm font-semibold text-purple-500 group-hover:text-purple-400">
                                        <span>{isCompleted ? 'Retake Quiz' : 'Start Quiz'}</span>
                                        <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Coming Soon Section */}
                <div className="mt-12 p-6 rounded-2xl border border-dashed border-white/10 text-center">
                    <p className="text-white/40 text-sm">More categories coming soon...</p>
                </div>
            </main>
        </div>
    );
}
