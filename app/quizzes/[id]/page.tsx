'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { useProgress } from '@/app/context/ProgressContext';
import { useAchievements } from '@/app/context/AchievementContext';


// Types for quiz data
interface Question {
    text: string;
    explanation: string;
    options: string[];
    correctAnswer: number;
}

interface Quiz {
    title: string;
    questions: Question[];
}

// Types for quiz progress
interface QuizProgress {
    currentQuestionIndex: number;
    score: number;
    answeredQuestions: number[];
}

// Update imports at the top
// Remove: import quizzes from '@/app/data/quizzes.json';

export default function QuizRunnerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const quizId = parseInt(id);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/quizzes?id=${quizId}`)
            .then(res => {
                if (!res.ok) throw new Error('Quiz not found');
                return res.json();
            })
            .then(data => {
                setQuiz(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [quizId]);

    // Update conditional checks down below to handle loading state


    // Helper function to load saved progress
    const loadSavedProgress = (): QuizProgress | null => {
        if (typeof window === 'undefined') return null;
        try {
            const savedProgressStr = localStorage.getItem(`quiz_progress_${quizId}`);
            if (savedProgressStr) {
                return JSON.parse(savedProgressStr);
            }
        } catch (error) {
            console.error('Failed to load quiz progress:', error);
        }
        return null;
    };

    const savedProgress = loadSavedProgress();
    const hasSavedProgress = savedProgress && (savedProgress.currentQuestionIndex > 0 || savedProgress.score > 0);

    // Initialize state with saved progress if available and user wants to resume
    const [showResumePrompt, setShowResumePrompt] = useState(hasSavedProgress);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [attemptNumber, setAttemptNumber] = useState(1);
    const [bestScore, setBestScore] = useState(0);
    const [quizStartTime] = useState(Date.now());
    const { saveQuizResult, getQuizResult } = useProgress();
    const { updateStats, checkAndUnlockBadges } = useAchievements();

    // Get current quiz result for attempt number and best score
    const currentResult = getQuizResult(quizId);
    const currentAttemptCount = currentResult?.attemptCount || 0;
    const currentBestScoreRaw = currentResult?.bestScore || 0;

    // Save progress whenever it changes
    useEffect(() => {
        if (quizCompleted || showResumePrompt) return;

        const progressData: QuizProgress = {
            currentQuestionIndex,
            score,
            answeredQuestions: []
        };

        localStorage.setItem(`quiz_progress_${quizId}`, JSON.stringify(progressData));
    }, [currentQuestionIndex, score, quizId, quizCompleted, showResumePrompt]);

    // Clear progress when quiz is completed
    useEffect(() => {
        if (quizCompleted && quiz?.questions) {
            localStorage.removeItem(`quiz_progress_${quizId}`);
            setAttemptNumber(currentAttemptCount + 1);
            setBestScore(Math.max(Math.round((currentBestScoreRaw / quiz.questions.length) * 100), Math.round((score / quiz.questions.length) * 100)));
            saveQuizResult(quizId, score, quiz.questions.length);

            // Update achievement stats
            const quizDuration = (Date.now() - quizStartTime) / 1000; // in seconds
            const currentHour = new Date().getHours();

            updateStats({
                questionsAnswered: quiz.questions.length,
                quizzesCompleted: 1,
                bestQuizScore: Math.max(Math.round((currentBestScoreRaw / quiz.questions.length) * 100), Math.round((score / quiz.questions.length) * 100)),
                totalStudyTime: Math.round(quizDuration)
            });

            // Check for achievements
            setTimeout(() => {
                checkAndUnlockBadges();
            }, 500);
        }
    }, [quizCompleted, quizId, score, quiz?.questions?.length, saveQuizResult, currentAttemptCount, currentBestScoreRaw, quizStartTime, updateStats, checkAndUnlockBadges]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F] text-white">Loading Quiz...</div>;
    }

    if (!quiz || !quiz.questions) {
        // return notFound(); // Cannot use notFound in async fetch like this easily, or just show error
        return <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F] text-white">Quiz data incomplete or not found</div>;
    }



    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;





    const handleResumeQuiz = () => {
        if (savedProgress) {
            setCurrentQuestionIndex(savedProgress.currentQuestionIndex);
            setScore(savedProgress.score);
            setSelectedOption(null);
            setIsAnswered(false);
            setShowExplanation(false);
            setShowHint(false);
        }
        setShowResumePrompt(false);
    };

    const handleStartOver = () => {
        localStorage.removeItem(`quiz_progress_${quizId}`);
        setCurrentQuestionIndex(0);
        setScore(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setShowExplanation(false);
        setShowHint(false);
        setShowResumePrompt(false);
    };

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;
        setSelectedOption(index);
    };

    const checkAnswer = () => {
        if (selectedOption === null) return;

        setIsAnswered(true);
        setShowExplanation(true);

        if (selectedOption === currentQuestion.correctAnswer) {
            setScore((prev) => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
            setShowExplanation(false);
            setShowHint(false);
        } else {
            setQuizCompleted(true);
        }
    };

    // Show resume prompt if saved progress exists
    if (showResumePrompt) {
        const savedProgressStr = localStorage.getItem(`quiz_progress_${quizId}`);
        const savedProgress: QuizProgress | null = savedProgressStr ? JSON.parse(savedProgressStr) : null;

        return (
            <div className="min-h-dvh bg-[#0A0A0F] text-white flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-[#1A1A20] rounded-lg p-8 border border-white/10 shadow-2xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">📝</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-3 text-center">Resume Quiz?</h1>
                    <p className="text-white/60 mb-6 text-center">
                        You have an unfinished quiz. Would you like to continue where you left off?
                    </p>

                    {savedProgress && (
                        <div className="bg-black/30 rounded-lg p-4 mb-6 text-center">
                            <div className="text-sm text-white/50 mb-1">Your Progress</div>
                            <div className="text-2xl font-bold text-purple-400">
                                Question {savedProgress.currentQuestionIndex + 1} of {quiz.questions.length}
                            </div>
                            <div className="text-sm text-emerald-400 mt-1">
                                {savedProgress.score} correct so far
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleResumeQuiz}
                            className="w-full py-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 active:bg-purple-700 transition-colors"
                        >
                            Resume Quiz
                        </button>
                        <button
                            onClick={handleStartOver}
                            className="w-full py-4 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 active:bg-white/5 transition-colors"
                        >
                            Start Over
                        </button>
                        <Link
                            href="/quizzes"
                            className="w-full py-3 text-center text-white/50 hover:text-white transition-colors text-sm"
                        >
                            Back to Quizzes
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (quizCompleted) {
        const scorePercentage = Math.round((score / quiz.questions.length) * 100);
        const isNewBest = scorePercentage > bestScore;

        return (
            <div className="min-h-dvh bg-[#0A0A0F] text-white flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-[#1A1A20] rounded-lg p-8 border border-white/10 text-center shadow-2xl">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                        <span className="text-4xl">🏆</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
                    <p className="text-white/60 mb-2">You successfully finished {quiz.title}.</p>
                    <p className="text-white/40 text-sm mb-8">Attempt #{attemptNumber}</p>

                    <div className="bg-black/30 rounded-lg p-6 mb-4">
                        <div className="text-xs uppercase tracking-widest text-white/50 mb-1">Your Score</div>
                        <div className="text-5xl font-black text-white">{scorePercentage}%</div>
                        <div className="text-sm text-emerald-400 font-bold mt-2">{score} / {quiz.questions.length} Correct</div>
                    </div>

                    {bestScore > 0 && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-lg">⭐</span>
                                <div>
                                    <div className="text-xs text-emerald-400/80">Best Score</div>
                                    <div className="text-2xl font-bold text-emerald-400">
                                        {isNewBest ? scorePercentage : bestScore}%
                                    </div>
                                </div>
                                {isNewBest && <span className="text-xs text-emerald-400">New Record!</span>}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <Link href="/quizzes" className="flex-1 py-4 bg-white text-black font-bold rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-transform">
                            Back to Library
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-[#0A0A0F] text-white flex flex-col font-sans">

            {/* Top Bar */}
            <div className="px-6 py-4 flex items-center justify-between">
                <Link href="/quizzes" className="text-white/50 hover:text-white transition-colors text-sm font-medium">
                    ✕ Quit
                </Link>
                <div className="flex items-center gap-3">
                    {currentAttemptCount > 0 && (
                        <div className="text-xs text-white/40">
                            Attempt #{currentAttemptCount + 1}
                        </div>
                    )}
                    <div className="text-xs font-bold text-white/30 uppercase tracking-widest">
                        {quiz.title}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/5">
                <div
                    className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4 sm:p-6 pb-40">
                <div className="flex-1 flex flex-col justify-start pt-4">
                    <span className="text-emerald-500 font-bold text-sm tracking-wider mb-4 block">QUESTION {currentQuestionIndex + 1} OF {quiz.questions.length}</span>
                    <h2 className="text-lg sm:text-xl font-bold leading-tight mb-4">
                        {currentQuestion.text}
                    </h2>

                    {/* Hint Button */}
                    {!isAnswered && (
                        <div className="mb-6">
                            {!showHint ? (
                                <button
                                    onClick={() => setShowHint(true)}
                                    className="flex items-center gap-2 text-sm text-yellow-400/80 hover:text-yellow-400 transition-colors"
                                >
                                    <span className="text-base">💡</span>
                                    <span className="font-medium">Show Hint</span>
                                </button>
                            ) : (
                                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 animate-in slide-in-from-top-2 fade-in duration-300">
                                    <div className="flex items-start gap-2">
                                        <span className="text-lg flex-shrink-0">💡</span>
                                        <p className="text-sm text-yellow-100/90 leading-relaxed">
                                            {currentQuestion.explanation}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid gap-3">
                        {currentQuestion.options.map((option: string, index: number) => {
                            let stateStyle = "bg-[#1A1A20] border-white/10 hover:border-white/30 text-white/80";

                            if (selectedOption === index) {
                                stateStyle = "bg-purple-600/20 border-purple-500 text-white ring-1 ring-purple-500";
                            }

                            if (isAnswered) {
                                if (index === currentQuestion.correctAnswer) {
                                    stateStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-100 ring-1 ring-emerald-500";
                                } else if (index === selectedOption && selectedOption !== currentQuestion.correctAnswer) {
                                    stateStyle = "bg-red-500/20 border-red-500 text-red-100 ring-1 ring-red-500 opacity-60";
                                } else {
                                    stateStyle = "bg-[#1A1A20] border-white/5 text-white/30";
                                }
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionClick(index)}
                                    disabled={isAnswered}
                                    className={`text-left p-4 rounded-lg border transition-all duration-200 font-medium text-sm sm:text-base leading-snug items-center flex gap-3 ${stateStyle}`}
                                >
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                           ${selectedOption === index ? 'border-purple-500' : 'border-white/20'}
                           ${isAnswered && index === currentQuestion.correctAnswer ? '!border-emerald-500 bg-emerald-500 text-black' : ''}
                           ${isAnswered && index === selectedOption && index !== currentQuestion.correctAnswer ? '!border-red-500 bg-red-500 text-white' : ''}
                        `}>
                                        {isAnswered && index === currentQuestion.correctAnswer && '✓'}
                                        {isAnswered && index === selectedOption && index !== currentQuestion.correctAnswer && '✕'}
                                    </div>
                                    {option}
                                </button>
                            );
                        })}
                    </div>

                    {/* Action Buttons - Inline with content */}
                    <div className="mt-6">
                        {!isAnswered ? (
                            <button
                                onClick={checkAnswer}
                                disabled={selectedOption === null}
                                className="w-full py-4 rounded-lg bg-white text-black font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all"
                            >
                                Check Answer
                            </button>
                        ) : (
                            // Feedback Mode
                            <div className="animate-in slide-in-from-bottom-5 fade-in duration-300">
                                <div className={`p-4 rounded-lg mb-4 border ${selectedOption === currentQuestion.correctAnswer
                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                    : 'bg-red-500/10 border-red-500/30'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {selectedOption === currentQuestion.correctAnswer ? (
                                            <span className="text-emerald-400 font-bold">Correct! good job.</span>
                                        ) : (
                                            <span className="text-red-400 font-bold">Incorrect</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-white/80 leading-relaxed">
                                        {currentQuestion.explanation}
                                    </p>
                                </div>

                                <button
                                    onClick={nextQuestion}
                                    className="w-full py-4 rounded-lg bg-purple-600 text-white font-bold text-lg hover:bg-purple-500 active:bg-purple-700 transition-colors shadow-lg shadow-purple-900/20"
                                >
                                    {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </main>

        </div>
    );
}
