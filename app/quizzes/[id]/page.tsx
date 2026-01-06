'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import quizzes from '@/app/data/quizzes.json';
import { useProgress } from '@/app/context/ProgressContext';

export default function QuizRunnerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const quizId = parseInt(id);
    const quiz = quizzes.find((q) => q.id === quizId);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false); // Used for POST-ANSWER feedback
    const [showHint, setShowHint] = useState(false); // Used for PRE-ANSWER hint toggle
    const [quizCompleted, setQuizCompleted] = useState(false);
    const { saveQuizResult } = useProgress();

    if (!quiz) {
        return notFound();
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    const handleOptionClick = (index: number) => {
        if (isAnswered) return; // Prevent changing after answer
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
            saveQuizResult(quizId, score + (selectedOption === currentQuestion.correctAnswer ? 0 : 0), quiz.questions.length);
            // Note: score state is already updated for previous questions. 
            // Wait, score update for LAST question happens in checkAnswer, which is BEFORE nextQuestion is called?
            // Yes, user clicks Check Answer (score updates), then Next Question.
            // So 'score' is up to date here.
        }
    };

    // Effect to trigger save when completed? 
    // better to do it synchronously in the event handler to ensure it runs before render change if possible, 
    // but state 'score' might be stale in a closure? 
    // Actually, 'score' is state. Accessing it in nextQuestion should be fine if it was updated in checkAnswer.
    // BUT checkAnswer runs, then wait for user to click Next. So re-render happened. 'score' is fresh.

    useEffect(() => {
        if (quizCompleted) {
            saveQuizResult(quizId, score, quiz.questions.length);
        }
    }, [quizCompleted, quizId, score, quiz.questions.length, saveQuizResult]);


    if (quizCompleted) {
        return (
            <div className="min-h-dvh bg-[#0A0A0F] text-white flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-[#1A1A20] rounded-3xl p-8 border border-white/10 text-center shadow-2xl">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow">
                        <span className="text-4xl">🏆</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Quiz Complete!</h1>
                    <p className="text-white/60 mb-8">You successfully finished {quiz.title}.</p>

                    <div className="bg-black/30 rounded-2xl p-6 mb-8">
                        <div className="text-xs uppercase tracking-widest text-white/50 mb-1">Your Score</div>
                        <div className="text-5xl font-black text-white">{Math.round((score / quiz.questions.length) * 100)}%</div>
                        <div className="text-sm text-emerald-400 font-bold mt-2">{score} / {quiz.questions.length} Correct</div>
                    </div>

                    <Link href="/quizzes" className="block w-full py-4 bg-white text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform">
                        Back to Library
                    </Link>
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
                <div className="text-xs font-bold text-white/30 uppercase tracking-widest">
                    {quiz.title}
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
            <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-6">
                <div className="flex-1 flex flex-col justify-center min-h-[50vh]">
                    <span className="text-emerald-500 font-bold text-sm tracking-wider mb-4 block">QUESTION {currentQuestionIndex + 1} OF {quiz.questions.length}</span>
                    <h2 className="text-2xl sm:text-3xl font-bold leading-tight mb-8">
                        {currentQuestion.text}
                    </h2>

                    <div className="grid gap-3">
                        {currentQuestion.options.map((option, index) => {
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
                                    className={`text-left p-5 rounded-xl border transition-all duration-200 font-medium text-lg leading-snug items-center flex gap-4 ${stateStyle}`}
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

                    {/* Hint Section */}
                    {currentQuestion.hint && !isAnswered && (
                        <div className="mt-6">
                            <button
                                onClick={() => setShowHint(!showHint)}
                                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all text-sm font-medium text-blue-300"
                            >
                                <span>Hint</span>
                                <span className={`transition-transform duration-200 ${showHint ? 'rotate-180' : ''}`}>▼</span>
                            </button>

                            {showHint && (
                                <div className="mt-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="text-blue-400 mt-0.5">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-blue-100/90 leading-relaxed">
                                        {currentQuestion.hint}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer / Action Area */}
            <div className="p-6 border-t border-white/10 bg-[#0A0A0F] safe-area-pb">
                <div className="max-w-2xl mx-auto">
                    {!isAnswered ? (
                        <button
                            onClick={checkAnswer}
                            disabled={selectedOption === null}
                            className="w-full py-4 rounded-xl bg-white text-black font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all"
                        >
                            Check Answer
                        </button>
                    ) : (
                        // Feedback Mode
                        <div className="animate-in slide-in-from-bottom-5 fade-in duration-300">
                            <div className={`p-4 rounded-xl mb-4 border ${selectedOption === currentQuestion.correctAnswer
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
                                className="w-full py-4 rounded-xl bg-purple-600 text-white font-bold text-lg hover:bg-purple-500 active:bg-purple-700 transition-colors shadow-lg shadow-purple-900/20"
                            >
                                {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
