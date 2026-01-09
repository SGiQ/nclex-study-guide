'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSRS } from '@/app/context/SRSContext';
import { useProgress } from '@/app/context/ProgressContext';
import quizzes from '@/app/data/quizzes.json';

export default function QuickActionsFAB() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const { getDueCount } = useSRS();
    const { quizResults } = useProgress();

    const dueCards = getDueCount();

    // Get weak categories for random quiz
    const quizScores = Object.values(quizResults);
    const weakEpisodes = quizScores
        .filter(r => (r.score / r.total) < 0.7)
        .map(r => r.episodeId);

    const actions = [
        {
            icon: '🎲',
            label: 'Quick Quiz',
            subtitle: 'From weak areas',
            onClick: () => {
                // Find quizzes that match the user's weak episodes
                const weakQuizzes = quizzes.filter(q => typeof q.episodeId === 'number' && weakEpisodes.includes(q.episodeId));

                let targetQuizId;

                if (weakQuizzes.length > 0) {
                    // Pick a random quiz from weak areas
                    targetQuizId = weakQuizzes[Math.floor(Math.random() * weakQuizzes.length)].id;
                } else {
                    // Fallback: Pick any random available quiz
                    targetQuizId = quizzes[Math.floor(Math.random() * quizzes.length)].id;
                }

                router.push(`/quizzes/${targetQuizId}`);
            }
        },
        {
            icon: '🗂️',
            label: 'Review Cards',
            subtitle: `${dueCards} due today`,
            onClick: () => router.push('/reviews')
        },
        {
            icon: '▶️',
            label: 'Continue',
            subtitle: 'Where you left off',
            onClick: () => {
                // Get last visited episode from localStorage
                const lastEpisode = localStorage.getItem('lastEpisode');
                if (lastEpisode) {
                    router.push(`/audio/${lastEpisode}`);
                } else {
                    router.push('/audio');
                }
            }
        }
    ];

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Action Menu */}
            <div className={`fixed bottom-24 right-6 z-50 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <div className="space-y-3">
                    {actions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                action.onClick();
                                setIsOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-card-border hover:border-indigo-500 shadow-lg transition-all hover:scale-105 min-w-[200px]"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="text-2xl">{action.icon}</div>
                            <div className="text-left">
                                <div className="font-bold text-sm">{action.label}</div>
                                <div className="text-xs text-foreground/60">{action.subtitle}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* FAB Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/50 flex items-center justify-center transition-all duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                aria-label="Quick Actions"
            >
                <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </>
    );
}
