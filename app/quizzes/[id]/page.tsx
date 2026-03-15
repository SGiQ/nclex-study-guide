'use client';

import React, { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { useProgress } from '@/app/context/ProgressContext';
import { useAchievements } from '@/app/context/AchievementContext';


// Types for quiz data
interface Question {
    text: string;
    explanation: string;
    options: string[];
    correctAnswer?: number;
    correctAnswers?: number[];
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
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
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

    const hasUpdatedStats = React.useRef(false);

    // Clear progress when quiz is completed
    useEffect(() => {
        if (quizCompleted && quiz?.questions && !hasUpdatedStats.current) {
            hasUpdatedStats.current = true;
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
        return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading Quiz...</div>;
    }

    if (!quiz || !quiz.questions) {
        // return notFound(); // Cannot use notFound in async fetch like this easily, or just show error
        return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Quiz data incomplete or not found</div>;
    }



    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;





    const handleResumeQuiz = () => {
        if (savedProgress) {
            setCurrentQuestionIndex(savedProgress.currentQuestionIndex);
            setScore(savedProgress.score);
            setSelectedOptions([]);
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
        setSelectedOptions([]);
        setIsAnswered(false);
        setShowExplanation(false);
        setShowHint(false);
        setShowResumePrompt(false);
    };

    const handleOptionClick = (index: number) => {
        if (isAnswered) return;
        
        const isSata = currentQuestion.correctAnswers !== undefined;

        if (isSata) {
            setSelectedOptions((prev) => 
                prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
            );
        } else {
            setSelectedOptions([index]);
        }
    };

    const checkAnswer = () => {
        if (selectedOptions.length === 0) return;

        setIsAnswered(true);
        setShowExplanation(true);

        const isSata = currentQuestion.correctAnswers !== undefined;
        let isCorrect = false;

        if (isSata) {
            const correctAnswers = currentQuestion.correctAnswers || [];
            if (correctAnswers.length === selectedOptions.length && 
                correctAnswers.every((ans) => selectedOptions.includes(ans))) {
                isCorrect = true;
            }
        } else {
            if (selectedOptions[0] === currentQuestion.correctAnswer) {
                isCorrect = true;
            }
        }

        if (isCorrect) {
            setScore((prev) => prev + 1);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
            setSelectedOptions([]);
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
            <div className="min-h-dvh bg-background text-foreground flex items-center justify-center p-6 relative z-[60] pb-mini-player">
                <div className="max-w-2xl w-full glass rounded-3xl p-8 border border-white/5 shadow-2xl">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(37,123,244,0.3)]">
                        <span className="material-symbols-outlined text-4xl text-white">description</span>
                    </div>
                    <h1 className="text-2xl font-black uppercase tracking-tight mb-3 text-center text-slate-100">Resume Quiz?</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 text-center">
                        You have an unfinished quiz. Would you like to continue where you left off?
                    </p>

                    {savedProgress && (
                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Your Progress</div>
                            <div className="text-2xl font-black uppercase tracking-tight text-primary mb-1">
                                Question {savedProgress.currentQuestionIndex + 1} of {quiz.questions.length}
                            </div>
                            <div className="text-sm font-bold text-emerald-400 mt-1">
                                {savedProgress.score} correct so far
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleResumeQuiz}
                            className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(37,123,244,0.2)]"
                        >
                            Resume Quiz
                        </button>
                        <button
                            onClick={handleStartOver}
                            className="w-full py-4 glass text-slate-300 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
                        >
                            Start Over
                        </button>
                        <Link
                            href="/quizzes"
                            className="w-full py-4 mt-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                        >
                            Cancel
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
            <div className="min-h-dvh bg-background text-foreground flex items-center justify-center p-6 pb-mini-player relative z-[60]">
                <div className="max-w-2xl w-full glass rounded-3xl p-10 border border-white/5 text-center shadow-2xl">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                        <span className="material-symbols-outlined text-5xl text-white">emoji_events</span>
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tight mb-2 text-slate-100">Quiz Complete!</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">You successfully finished {quiz.title}.</p>
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Attempt #{attemptNumber}</p>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-4">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Your Score</div>
                        <div className="text-6xl font-black text-white tracking-tighter">{scorePercentage}%</div>
                        <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest mt-4">{score} / {quiz.questions.length} Correct</div>
                    </div>

                    {bestScore > 0 && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-8">
                            <div className="flex items-center justify-center gap-3">
                                <span className="material-symbols-outlined text-emerald-400 text-xl">star</span>
                                <div className="text-left">
                                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400/80">Best Score</div>
                                    <div className="text-xl font-black text-emerald-400 leading-none mt-1">
                                        {isNewBest ? scorePercentage : bestScore}%
                                    </div>
                                </div>
                                {isNewBest && <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white bg-emerald-500 px-2 py-1 rounded-full ml-2">New Record!</span>}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <Link href="/quizzes" className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(37,123,244,0.2)]">
                            Back to Quizzes
                        </Link>
                        <button
                            onClick={handleStartOver}
                            className="w-full py-4 glass text-slate-300 font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-white/10 hover:text-white transition-all border border-white/5"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-background text-foreground flex flex-col font-sans relative z-0">

            {/* Top Bar */}
            <div className="px-6 py-6 flex items-center justify-between border-b border-white/5 glass">
                <Link href="/quizzes" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-sm">close</span> Quit
                </Link>
                <div className="flex items-center gap-4">
                    {currentAttemptCount > 0 && (
                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 bg-white/5 px-2 py-1 rounded-md">
                            Attempt #{currentAttemptCount + 1}
                        </div>
                    )}
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
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
            <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-6 pb-mini-player">
                <div className="flex-1 flex flex-col justify-start pt-4">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-emerald-500 font-black text-[10px] tracking-[0.2em] uppercase">QUESTION {currentQuestionIndex + 1} OF {quiz.questions.length}</span>
                        {currentQuestion.correctAnswers !== undefined && (
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-1 rounded-md">Select all that apply</span>
                        )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-tight mb-8 text-slate-100">
                        {currentQuestion.text}
                    </h2>

                    {/* Hint Button */}
                    {!isAnswered && (
                        <div className="mb-8">
                            {!showHint ? (
                                <button
                                    onClick={() => setShowHint(true)}
                                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-yellow-500/80 hover:text-yellow-400 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-base">lightbulb</span>
                                    <span>Show Hint</span>
                                </button>
                            ) : (
                                <div className="p-5 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 animate-in slide-in-from-top-2 fade-in duration-300">
                                    <div className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-yellow-500 text-xl flex-shrink-0">lightbulb</span>
                                        <p className="text-sm font-medium text-yellow-200/90 leading-relaxed mt-0.5">
                                            {currentQuestion.explanation}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid gap-3">
                        {currentQuestion.options.map((option: string, index: number) => {
                            const isSata = currentQuestion.correctAnswers !== undefined;
                            const isSelected = selectedOptions.includes(index);
                            
                            let isCorrectAnswer = false;
                            if (isSata) {
                                isCorrectAnswer = currentQuestion.correctAnswers!.includes(index);
                            } else {
                                isCorrectAnswer = index === currentQuestion.correctAnswer;
                            }

                            let stateStyle = "glass border border-white/5 hover:border-white/20 text-slate-300";

                            if (isSelected) {
                                stateStyle = "bg-primary/10 border border-primary text-white ring-1 ring-primary/50 shadow-[0_0_15px_rgba(37,123,244,0.1)]";
                            }

                            if (isAnswered) {
                                if (isCorrectAnswer) {
                                    stateStyle = "bg-emerald-500/10 border border-emerald-500 text-white ring-1 ring-emerald-500/50";
                                } else if (isSelected && !isCorrectAnswer) {
                                    stateStyle = "bg-red-500/10 border border-red-500/50 text-slate-400 opacity-70";
                                } else {
                                    stateStyle = "bg-black/20 border border-white/5 text-slate-500 opacity-50";
                                }
                            }

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleOptionClick(index)}
                                    disabled={isAnswered}
                                    className={`text-left p-5 rounded-2xl transition-all duration-300 text-sm sm:text-base font-medium leading-relaxed items-center flex gap-4 ${stateStyle}`}
                                >
                                    <div className={`w-8 h-8 ${isSata ? 'rounded-md' : 'rounded-full'} border-2 flex items-center justify-center flex-shrink-0 transition-colors
                           ${isSelected ? 'border-primary text-primary bg-primary/20' : 'border-slate-700 text-transparent'}
                           ${isAnswered && isCorrectAnswer ? '!border-emerald-500 !bg-emerald-500 !text-black' : ''}
                           ${isAnswered && isSelected && !isCorrectAnswer ? '!border-red-500 !bg-red-500/20 !text-red-400' : ''}
                        `}>
                                        {isAnswered && isCorrectAnswer ? (
                                            <span className="material-symbols-outlined text-sm font-bold">check</span>
                                        ) : isAnswered && isSelected && !isCorrectAnswer ? (
                                            <span className="material-symbols-outlined text-sm font-bold">close</span>
                                        ) : (
                                            <span className="text-[10px] font-black">{String.fromCharCode(65 + index)}</span>
                                        )}
                                    </div>
                                    <span className="flex-1">{option}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Action Buttons - Inline with content */}
                    <div className="mt-8 mb-4">
                        {!isAnswered ? (
                            <button
                                onClick={checkAnswer}
                                disabled={selectedOptions.length === 0}
                                className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-widest text-xs disabled:opacity-20 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl"
                            >
                                Check Answer
                            </button>
                        ) : (
                            // Feedback Mode
                            <div className="animate-in slide-in-from-bottom-5 fade-in duration-300">
                                {(() => {
                                    const isSata = currentQuestion.correctAnswers !== undefined;
                                    let isCorrect = false;
                                    
                                    if (isSata) {
                                        const correctAnswers = currentQuestion.correctAnswers || [];
                                        isCorrect = correctAnswers.length === selectedOptions.length && correctAnswers.every(ans => selectedOptions.includes(ans));
                                    } else {
                                        isCorrect = selectedOptions[0] === currentQuestion.correctAnswer;
                                    }

                                    return (
                                        <div className={`p-6 rounded-3xl mb-6 border glass shadow-2xl ${isCorrect
                                            ? 'bg-emerald-500/5 border-emerald-500/20'
                                            : 'bg-red-500/5 border-red-500/20'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-3">
                                                {isCorrect ? (
                                                    <span className="text-emerald-400 font-black uppercase tracking-widest text-xs flex items-center gap-2"><span className="material-symbols-outlined text-lg">check_circle</span> Correct! Good job.</span>
                                                ) : (
                                                    <span className="text-red-400 font-black uppercase tracking-widest text-xs flex items-center gap-2"><span className="material-symbols-outlined text-lg">cancel</span> Incorrect</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-300 leading-relaxed font-medium">
                                                {currentQuestion.explanation}
                                            </p>
                                        </div>
                                    );
                                })()}

                                <button
                                    onClick={nextQuestion}
                                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl
                                      ${currentQuestionIndex < quiz.questions.length - 1 ? 'bg-primary text-white hover:bg-primary/90 shadow-[0_0_20px_rgba(37,123,244,0.2)]' : 'bg-white text-black'}`}
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
