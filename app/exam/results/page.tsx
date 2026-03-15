'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/app/context/ProgressContext';
import { useAchievements } from '@/app/context/AchievementContext';

interface ExamResults {
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
    passed: boolean;
    timeTaken: number;
    questions: any[];
    answers: Record<number, number | number[]>;
    examMode: 'realistic' | 'practice';
    startTime?: number; // Added to assume uniqueness
    savedToStats?: boolean;
}

export default function ExamResultsPage() {
    const router = useRouter();
    const [results, setResults] = useState<ExamResults | null>(null);
    const [showReview, setShowReview] = useState(false);
    const [reviewQuestion, setReviewQuestion] = useState(0);

    const { saveQuizResult } = useProgress();
    const { updateStats, checkAndUnlockBadges } = useAchievements();

    const hasSavedStats = React.useRef(false);

    useEffect(() => {
        const savedResultsStr = localStorage.getItem('examResults');
        if (!savedResultsStr) {
            router.push('/exam/setup');
            return;
        }

        const savedResults: ExamResults = JSON.parse(savedResultsStr);

        // If not saved to stats yet, do it now
        if (!savedResults.savedToStats && !hasSavedStats.current) {
            hasSavedStats.current = true;
            // Use startTime as a unique ID for this exam session, or Date.now() if missing
            const uniqueId = savedResults.startTime || Date.now();

            // Save to Progress Context (DB & Analytics)
            // We use the uniqueId as the pseudo-episodeId to ensure each exam counts separately
            saveQuizResult(uniqueId, savedResults.correctAnswers, savedResults.totalQuestions);

            // Update Achievement Stats
            updateStats({
                questionsAnswered: savedResults.totalQuestions,
                quizzesCompleted: 1, // Count exams as quizzes for now
                bestQuizScore: savedResults.percentage, // This tracks global best
                totalStudyTime: Math.round(savedResults.timeTaken / 1000)
            });

            // Mark as saved so we don't count it again on reload
            savedResults.savedToStats = true;
            localStorage.setItem('examResults', JSON.stringify(savedResults));

            // Check badges after a short delay
            setTimeout(() => {
                checkAndUnlockBadges();
            }, 500);
        }

        setResults(savedResults);
    }, [router, saveQuizResult, updateStats, checkAndUnlockBadges]);

    const formatTime = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const retakeExam = () => {
        localStorage.removeItem('examResults');
        router.push('/exam/setup');
    };

    if (!results) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-foreground/60">Loading results...</div>
            </div>
        );
    }

    // Calculate category performance
    const categoryPerformance: Record<string, { correct: number; total: number }> = {};
    results.questions.forEach((q, idx) => {
        if (!categoryPerformance[q.category]) {
            categoryPerformance[q.category] = { correct: 0, total: 0 };
        }
        categoryPerformance[q.category].total++;
        
        const answer = results.answers[idx];
        const isSata = q.correctAnswers !== undefined;
        
        let isCorrect = false;
        if (isSata) {
            const correctAnswers = q.correctAnswers || [];
            const selectedAnswers = (answer as number[]) || [];
            isCorrect = selectedAnswers.length === correctAnswers.length &&
                        correctAnswers.every((a: number) => selectedAnswers.includes(a));
        } else {
            isCorrect = answer === q.correctAnswer;
        }

        if (isCorrect) {
            categoryPerformance[q.category].correct++;
        }
    });

    const categories = Object.entries(categoryPerformance).map(([name, data]) => ({
        name,
        percentage: Math.round((data.correct / data.total) * 100),
        correct: data.correct,
        total: data.total
    })).sort((a, b) => b.percentage - a.percentage);

    if (showReview) {
        const q = results.questions[reviewQuestion];
        const userAnswer = results.answers[reviewQuestion];
        const isSata = q.correctAnswers !== undefined;
        
        let isCorrect = false;
        if (isSata) {
            const correctAnswers = q.correctAnswers || [];
            const selectedAnswers = (userAnswer as number[]) || [];
            isCorrect = selectedAnswers.length === correctAnswers.length &&
                        correctAnswers.every((a: number) => selectedAnswers.includes(a));
        } else {
            isCorrect = userAnswer === q.correctAnswer;
        }

        return (
            <div className="min-h-screen bg-background text-foreground pb-[180px]">
                <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-nav-border px-4 py-3">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <button
                            onClick={() => setShowReview(false)}
                            className="text-foreground/60 hover:text-foreground"
                        >
                            ← Back to Results
                        </button>
                        <div className="text-sm">
                            Question {reviewQuestion + 1}/{results.totalQuestions}
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Question */}
                    <div className="mb-6">
                        <div className="text-sm text-foreground/60 mb-2">{q.category}</div>
                        <h2 className="text-2xl font-bold leading-relaxed mb-6">{q.text}</h2>

                        {/* Options with feedback */}
                        <div className="space-y-3 mb-6">
                            {q.options.map((option: string, idx: number) => {
                                const isUserAnswer = isSata 
                                    ? ((userAnswer as number[]) || []).includes(idx)
                                    : userAnswer === idx;
                                const isCorrectAnswer = isSata 
                                    ? (q.correctAnswers || []).includes(idx)
                                    : q.correctAnswer === idx;

                                let className = 'w-full text-left p-4 rounded-lg border-2 ';
                                if (isCorrectAnswer) {
                                    className += 'border-green-500 bg-green-500/10';
                                } else if (isUserAnswer && !isCorrectAnswer) {
                                    className += 'border-red-500 bg-red-500/10';
                                } else {
                                    className += 'border-card-border bg-card';
                                }

                                return (
                                    <div key={idx} className={className}>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-0.5">
                                                {isCorrectAnswer && <span className="text-green-500 font-bold">✓</span>}
                                                {isUserAnswer && !isCorrectAnswer && <span className="text-red-500 font-bold">✗</span>}
                                            </div>
                                            <div className="flex-1">{option}</div>
                                            {isUserAnswer && <span className="text-xs text-foreground/60">(Your answer)</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Result badge */}
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg mb-6 ${isCorrect ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                        </div>

                        {/* Explanation */}
                        <div className="p-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                            <h3 className="font-bold mb-2 flex items-center gap-2">
                                <span>💡</span> Explanation
                            </h3>
                            <p className="text-foreground/80">{q.explanation}</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setReviewQuestion(Math.max(0, reviewQuestion - 1))}
                            disabled={reviewQuestion === 0}
                            className="px-6 py-3 rounded-lg bg-surface/10 hover:bg-surface/20 disabled:opacity-30 font-semibold"
                        >
                            ← Previous
                        </button>
                        <button
                            onClick={() => setReviewQuestion(Math.min(results.totalQuestions - 1, reviewQuestion + 1))}
                            disabled={reviewQuestion === results.totalQuestions - 1}
                            className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-[180px]">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Pass/Fail Header */}
                <div className={`text-center p-12 rounded-lg mb-8 ${results.passed
                    ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/30'
                    : 'bg-gradient-to-br from-red-500/20 to-orange-500/20 border-2 border-red-500/30'
                    }`}>
                    <div className="text-7xl mb-4">{results.passed ? '🎉' : '📚'}</div>
                    <h1 className={`text-5xl font-black mb-4 ${results.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {results.passed ? 'PASSED!' : 'NOT PASSED'}
                    </h1>
                    <p className="text-2xl font-bold mb-2">{results.percentage}%</p>
                    <p className="text-foreground/60">
                        {results.correctAnswers}/{results.totalQuestions} questions correct
                    </p>
                    {results.passed ? (
                        <p className="mt-4 text-foreground/80">
                            Congratulations! You're ready for the NCLEX!
                        </p>
                    ) : (
                        <p className="mt-4 text-foreground/80">
                            Keep studying! Review your weak areas and try again.
                        </p>
                    )}
                </div>

                {/* Score Breakdown */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                    <div className="p-6 rounded-lg bg-card border border-card-border">
                        <div className="text-3xl font-black text-indigo-400">{results.percentage}%</div>
                        <div className="text-sm text-foreground/60">Overall Score</div>
                    </div>
                    <div className="p-6 rounded-lg bg-card border border-card-border">
                        <div className="text-3xl font-black text-purple-400">{formatTime(results.timeTaken)}</div>
                        <div className="text-sm text-foreground/60">Time Taken</div>
                    </div>
                    <div className="p-6 rounded-lg bg-card border border-card-border">
                        <div className="text-3xl font-black text-pink-400">
                            {Math.round(results.timeTaken / results.totalQuestions / 1000)}s
                        </div>
                        <div className="text-sm text-foreground/60">Avg. per Question</div>
                    </div>
                </div>

                {/* Category Performance */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Category Performance</h2>
                    <div className="space-y-3">
                        {categories.map(cat => (
                            <div key={cat.name} className="p-4 rounded-lg bg-card border border-card-border">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <div className="font-bold">{cat.name}</div>
                                        <div className="text-xs text-foreground/60">
                                            {cat.correct}/{cat.total} correct
                                        </div>
                                    </div>
                                    <div className={`text-2xl font-black ${cat.percentage >= 75 ? 'text-green-400' : cat.percentage >= 60 ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {cat.percentage}%
                                    </div>
                                </div>
                                <div className="h-2 bg-surface/10 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${cat.percentage >= 75 ? 'bg-green-500' : cat.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${cat.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weak Areas */}
                {categories.filter(c => c.percentage < 75).length > 0 && (
                    <div className="p-6 rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 mb-8">
                        <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <span>⚠️</span> Areas to Improve
                        </h3>
                        <div className="space-y-2 mb-4">
                            {categories.filter(c => c.percentage < 75).map(cat => (
                                <div key={cat.name} className="flex items-center justify-between text-sm">
                                    <span className="text-red-400">{cat.name}</span>
                                    <span className="text-red-400/70">{cat.percentage}%</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-foreground/80">
                            Focus on these categories to improve your score. Review the related episodes and practice more questions.
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => setShowReview(true)}
                        className="flex-1 py-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-bold transition-colors"
                    >
                        Review Questions
                    </button>
                    <button
                        onClick={retakeExam}
                        className="flex-1 py-4 rounded-lg bg-purple-600 hover:bg-purple-500 font-bold transition-colors"
                    >
                        Retake Exam
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex-1 py-4 rounded-lg bg-surface/10 hover:bg-surface/20 font-semibold transition-colors text-center"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
