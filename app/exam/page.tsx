'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import quizzes from '@/app/data/quizzes.json';

interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    category: string;
    episodeId: number;
}

interface ExamState {
    questions: Question[];
    answers: Record<number, number>;
    markedQuestions: Set<number>;
    currentQuestion: number;
    startTime: number;
    timeRemaining: number;
    isCompleted: boolean;
    examMode: 'realistic' | 'practice';
}

export default function ExamPage() {
    const router = useRouter();
    const [examState, setExamState] = useState<ExamState | null>(null);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [showTimeWarning, setShowTimeWarning] = useState(false);

    // Initialize exam
    useEffect(() => {
        const examMode = (localStorage.getItem('examMode') as 'realistic' | 'practice') || 'realistic';
        const savedState = localStorage.getItem('examState');

        if (savedState) {
            // Resume existing exam
            const state = JSON.parse(savedState);
            state.markedQuestions = new Set(state.markedQuestions);
            setExamState(state);
        } else {
            // Create new exam
            const allQuestions: Question[] = [];

            // Collect all questions from quizzes
            quizzes.forEach(quiz => {
                quiz.questions.forEach((q, idx) => {
                    allQuestions.push({
                        id: `${quiz.id}-${idx}`,
                        text: q.text,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation,
                        category: quiz.title,
                        episodeId: quiz.episodeId
                    });
                });
            });

            // Shuffle and select 85 questions
            const shuffled = allQuestions.sort(() => Math.random() - 0.5);
            const selectedQuestions = shuffled.slice(0, 85);

            const newState: ExamState = {
                questions: selectedQuestions,
                answers: {},
                markedQuestions: new Set(),
                currentQuestion: 0,
                startTime: Date.now(),
                timeRemaining: examMode === 'realistic' ? 5 * 60 * 60 * 1000 : 0, // 5 hours in ms
                isCompleted: false,
                examMode
            };

            setExamState(newState);
            localStorage.setItem('examState', JSON.stringify({
                ...newState,
                markedQuestions: Array.from(newState.markedQuestions)
            }));
        }
    }, []);

    // Timer countdown
    useEffect(() => {
        if (!examState || examState.examMode !== 'realistic' || examState.isCompleted) return;

        const interval = setInterval(() => {
            setExamState(prev => {
                if (!prev) return prev;

                const newTimeRemaining = prev.timeRemaining - 1000;

                // Show warning at 30 minutes
                if (newTimeRemaining <= 30 * 60 * 1000 && newTimeRemaining > 29 * 60 * 1000) {
                    setShowTimeWarning(true);
                }

                // Auto-submit when time expires
                if (newTimeRemaining <= 0) {
                    submitExam();
                    return prev;
                }

                const updated = { ...prev, timeRemaining: newTimeRemaining };
                localStorage.setItem('examState', JSON.stringify({
                    ...updated,
                    markedQuestions: Array.from(updated.markedQuestions)
                }));

                return updated;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [examState]);

    const selectAnswer = (answerIndex: number) => {
        if (!examState) return;

        const updated = {
            ...examState,
            answers: { ...examState.answers, [examState.currentQuestion]: answerIndex }
        };

        setExamState(updated);
        localStorage.setItem('examState', JSON.stringify({
            ...updated,
            markedQuestions: Array.from(updated.markedQuestions)
        }));
    };

    const toggleMark = () => {
        if (!examState) return;

        const newMarked = new Set(examState.markedQuestions);
        if (newMarked.has(examState.currentQuestion)) {
            newMarked.delete(examState.currentQuestion);
        } else {
            newMarked.add(examState.currentQuestion);
        }

        const updated = { ...examState, markedQuestions: newMarked };
        setExamState(updated);
        localStorage.setItem('examState', JSON.stringify({
            ...updated,
            markedQuestions: Array.from(updated.markedQuestions)
        }));
    };

    const goToQuestion = (index: number) => {
        if (!examState) return;
        setExamState({ ...examState, currentQuestion: index });
    };

    const nextQuestion = () => {
        if (!examState) return;
        if (examState.currentQuestion < examState.questions.length - 1) {
            goToQuestion(examState.currentQuestion + 1);
        }
    };

    const previousQuestion = () => {
        if (!examState) return;
        if (examState.currentQuestion > 0) {
            goToQuestion(examState.currentQuestion - 1);
        }
    };

    const submitExam = () => {
        if (!examState) return;

        // Calculate results
        let correct = 0;
        examState.questions.forEach((q, idx) => {
            if (examState.answers[idx] === q.correctAnswer) {
                correct++;
            }
        });

        const results = {
            totalQuestions: examState.questions.length,
            correctAnswers: correct,
            percentage: Math.round((correct / examState.questions.length) * 100),
            passed: (correct / examState.questions.length) >= 0.75,
            timeTaken: Date.now() - examState.startTime,
            questions: examState.questions,
            answers: examState.answers,
            examMode: examState.examMode
        };

        localStorage.setItem('examResults', JSON.stringify(results));
        localStorage.removeItem('examState');
        router.push('/exam/results');
    };

    const formatTime = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    if (!examState) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">📝</div>
                    <div className="text-foreground/60">Loading exam...</div>
                </div>
            </div>
        );
    }

    const currentQ = examState.questions[examState.currentQuestion];
    const selectedAnswer = examState.answers[examState.currentQuestion];
    const isMarked = examState.markedQuestions.has(examState.currentQuestion);
    const answeredCount = Object.keys(examState.answers).length;
    const unansweredCount = examState.questions.length - answeredCount;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-nav-border px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="font-bold">NCLEX Simulation</div>
                        <div className="text-sm text-foreground/60">
                            Question {examState.currentQuestion + 1}/{examState.questions.length}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {examState.examMode === 'realistic' && (
                            <div className={`text-sm font-mono ${examState.timeRemaining < 30 * 60 * 1000 ? 'text-red-400' : 'text-foreground'}`}>
                                ⏱️ {formatTime(examState.timeRemaining)}
                            </div>
                        )}
                        <div className="text-sm text-foreground/60">
                            Marked: {examState.markedQuestions.size}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto pb-32">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Question */}
                    <div className="mb-8">
                        <div className="text-sm text-foreground/60 mb-2">{currentQ.category}</div>
                        <h2 className="text-2xl font-bold leading-relaxed mb-6">{currentQ.text}</h2>

                        {/* Options */}
                        <div className="space-y-3">
                            {currentQ.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => selectAnswer(idx)}
                                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedAnswer === idx
                                            ? 'border-indigo-500 bg-indigo-500/10'
                                            : 'border-card-border bg-card hover:border-indigo-500/50'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center ${selectedAnswer === idx
                                                ? 'border-indigo-500 bg-indigo-500'
                                                : 'border-foreground/30'
                                            }`}>
                                            {selectedAnswer === idx && <div className="h-2 w-2 rounded-full bg-white" />}
                                        </div>
                                        <div className="flex-1">{option}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Controls */}
            <div className="sticky bottom-0 bg-background/95 backdrop-blur-md border-t border-nav-border px-4 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleMark}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${isMarked
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    : 'bg-surface/10 hover:bg-surface/20'
                                }`}
                        >
                            {isMarked ? '★ Marked' : '☆ Mark'}
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={previousQuestion}
                            disabled={examState.currentQuestion === 0}
                            className="px-6 py-2 rounded-lg bg-surface/10 hover:bg-surface/20 disabled:opacity-30 disabled:hover:bg-surface/10 font-semibold transition-colors"
                        >
                            ← Previous
                        </button>

                        {examState.currentQuestion < examState.questions.length - 1 ? (
                            <button
                                onClick={nextQuestion}
                                className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors"
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowSubmitConfirm(true)}
                                className="px-6 py-2 rounded-lg bg-green-600 hover:bg-green-500 font-bold transition-colors"
                            >
                                Submit Exam
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-card border border-card-border rounded-2xl p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold mb-4">Submit Exam?</h3>
                        <div className="space-y-3 mb-6 text-foreground/80">
                            <p>
                                <strong>Answered:</strong> {answeredCount}/{examState.questions.length} questions
                            </p>
                            {unansweredCount > 0 && (
                                <p className="text-yellow-400">
                                    <strong>⚠️ Warning:</strong> You have {unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}
                                </p>
                            )}
                            <p>Once submitted, you cannot change your answers.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSubmitConfirm(false)}
                                className="flex-1 py-3 rounded-lg bg-surface/10 hover:bg-surface/20 font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitExam}
                                className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-500 font-bold"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Time Warning Modal */}
            {showTimeWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-card border border-yellow-500/30 rounded-2xl p-8 max-w-md w-full">
                        <div className="text-center">
                            <div className="text-5xl mb-4">⏰</div>
                            <h3 className="text-2xl font-bold mb-2">30 Minutes Remaining</h3>
                            <p className="text-foreground/80 mb-6">
                                You have 30 minutes left to complete the exam. Make sure to answer all questions.
                            </p>
                            <button
                                onClick={() => setShowTimeWarning(false)}
                                className="px-8 py-3 rounded-lg bg-yellow-600 hover:bg-yellow-500 font-bold"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
