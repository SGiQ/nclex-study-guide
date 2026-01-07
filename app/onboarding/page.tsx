'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/app/context/OnboardingContext';
import { generateStudyPlan } from '@/utils/studyPlanGenerator';
import quizzes from '@/app/data/quizzes.json';

export default function OnboardingPage() {
    const router = useRouter();
    const { preferences, updatePreferences, completeOnboarding } = useOnboarding();
    const [step, setStep] = useState(1);
    const [examDate, setExamDate] = useState('');
    const [studyHours, setStudyHours] = useState(10);
    const [diagnosticAnswers, setDiagnosticAnswers] = useState<Record<number, number>>({});
    const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);

    // Select 10 random questions for diagnostic
    const diagnosticQuestions = quizzes
        .flatMap(quiz => quiz.questions.map((q, idx) => ({ ...q, quizTitle: quiz.title, quizId: quiz.id, qIdx: idx })))
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);

    const handleNext = () => {
        if (step === 1 && examDate) {
            updatePreferences({ examDate });
            setStep(2);
        } else if (step === 2) {
            updatePreferences({ studyHoursPerWeek: studyHours });
            setStep(3);
        } else if (step === 3) {
            // Calculate diagnostic score
            const correct = Object.entries(diagnosticAnswers).filter(
                ([idx, answer]) => diagnosticQuestions[parseInt(idx)].correctAnswer === answer
            ).length;
            const score = Math.round((correct / diagnosticQuestions.length) * 100);

            // Identify weak categories
            const categoryScores: Record<string, { correct: number; total: number }> = {};
            Object.entries(diagnosticAnswers).forEach(([idx, answer]) => {
                const q = diagnosticQuestions[parseInt(idx)];
                if (!categoryScores[q.quizTitle]) {
                    categoryScores[q.quizTitle] = { correct: 0, total: 0 };
                }
                categoryScores[q.quizTitle].total++;
                if (q.correctAnswer === answer) {
                    categoryScores[q.quizTitle].correct++;
                }
            });

            const weakCategories = Object.entries(categoryScores)
                .filter(([_, data]) => (data.correct / data.total) < 0.7)
                .map(([category]) => category);

            updatePreferences({ diagnosticScore: score, weakCategories });

            // Generate study plan
            const plan = generateStudyPlan({ examDate, studyHoursPerWeek: studyHours, diagnosticScore: score, weakCategories });
            updatePreferences({ studyPlan: plan });

            setStep(4);
        } else if (step === 4) {
            setStep(5);
        } else if (step === 5) {
            completeOnboarding();
            router.push('/dashboard');
        }
    };

    const handleSkip = () => {
        completeOnboarding();
        router.push('/dashboard');
    };

    const selectDiagnosticAnswer = (answer: number) => {
        setDiagnosticAnswers({ ...diagnosticAnswers, [currentQuizQuestion]: answer });
        if (currentQuizQuestion < diagnosticQuestions.length - 1) {
            setCurrentQuizQuestion(currentQuizQuestion + 1);
        }
    };

    const minDate = new Date().toISOString().split('T')[0];
    const maxDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-foreground/60">Step {step} of 5</span>
                        <button onClick={handleSkip} className="text-sm text-foreground/60 hover:text-foreground">
                            Skip →
                        </button>
                    </div>
                    <div className="h-2 bg-surface/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
                            style={{ width: `${(step / 5) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Step 1: Exam Date */}
                {step === 1 && (
                    <div className="text-center">
                        <div className="text-6xl mb-6">📅</div>
                        <h1 className="text-4xl font-black mb-4">When is your NCLEX exam?</h1>
                        <p className="text-foreground/60 mb-8">
                            We'll create a personalized study plan to help you prepare
                        </p>
                        <input
                            type="date"
                            value={examDate}
                            onChange={(e) => setExamDate(e.target.value)}
                            min={minDate}
                            max={maxDate}
                            className="w-full max-w-md mx-auto px-6 py-4 rounded-xl bg-card border border-card-border text-center text-xl font-semibold mb-8"
                        />
                        <button
                            onClick={handleNext}
                            disabled={!examDate}
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all"
                        >
                            Continue →
                        </button>
                    </div>
                )}

                {/* Step 2: Study Goals */}
                {step === 2 && (
                    <div className="text-center">
                        <div className="text-6xl mb-6">⏰</div>
                        <h1 className="text-4xl font-black mb-4">How many hours per week can you study?</h1>
                        <p className="text-foreground/60 mb-8">
                            Be realistic - consistency is more important than quantity
                        </p>
                        <div className="max-w-md mx-auto mb-8">
                            <div className="text-7xl font-black text-indigo-400 mb-4">{studyHours}h</div>
                            <input
                                type="range"
                                min="3"
                                max="40"
                                value={studyHours}
                                onChange={(e) => setStudyHours(parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-sm text-foreground/60 mt-2">
                                <span>3h</span>
                                <span>40h</span>
                            </div>
                        </div>
                        <button
                            onClick={handleNext}
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-lg transition-all"
                        >
                            Continue →
                        </button>
                    </div>
                )}

                {/* Step 3: Diagnostic Quiz */}
                {step === 3 && (
                    <div>
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">🎯</div>
                            <h1 className="text-3xl font-black mb-2">Quick Diagnostic Quiz</h1>
                            <p className="text-foreground/60">
                                Question {currentQuizQuestion + 1} of {diagnosticQuestions.length}
                            </p>
                        </div>

                        {currentQuizQuestion < diagnosticQuestions.length ? (
                            <div>
                                <div className="mb-6">
                                    <div className="text-sm text-foreground/60 mb-2">
                                        {diagnosticQuestions[currentQuizQuestion].quizTitle}
                                    </div>
                                    <h2 className="text-xl font-bold mb-6">
                                        {diagnosticQuestions[currentQuizQuestion].text}
                                    </h2>
                                    <div className="space-y-3">
                                        {diagnosticQuestions[currentQuizQuestion].options.map((option, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => selectDiagnosticAnswer(idx)}
                                                className="w-full text-left p-4 rounded-xl border-2 border-card-border bg-card hover:border-indigo-500 transition-all"
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-lg mb-6">All questions answered!</p>
                                <button
                                    onClick={handleNext}
                                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-lg transition-all"
                                >
                                    See Results →
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 4: Study Plan */}
                {step === 4 && (
                    <div className="text-center">
                        <div className="text-6xl mb-6">📚</div>
                        <h1 className="text-4xl font-black mb-4">Your Personalized Study Plan</h1>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 mb-6">
                            <div className="text-6xl font-black text-green-400 mb-2">
                                {preferences.diagnosticScore}%
                            </div>
                            <p className="text-foreground/80">Diagnostic Score</p>
                        </div>
                        <p className="text-foreground/80 mb-6">
                            We've created a {preferences.studyPlan.length}-day study plan tailored to your schedule and weak areas.
                        </p>
                        <div className="text-left max-w-md mx-auto mb-8 p-4 rounded-xl bg-card border border-card-border">
                            <h3 className="font-bold mb-3">Your Daily Schedule:</h3>
                            <ul className="space-y-2 text-sm">
                                <li>📖 Audio lessons ({Math.round(studyHours * 60 / 7 * 0.5)} min/day)</li>
                                <li>📝 Practice quizzes ({Math.round(studyHours * 60 / 7 * 0.25)} min/day)</li>
                                <li>🗂️ Flashcard review ({Math.round(studyHours * 60 / 7 * 0.25)} min/day)</li>
                            </ul>
                        </div>
                        <button
                            onClick={handleNext}
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-lg transition-all"
                        >
                            Continue →
                        </button>
                    </div>
                )}

                {/* Step 5: Tutorial */}
                {step === 5 && (
                    <div className="text-center">
                        <div className="text-6xl mb-6">🚀</div>
                        <h1 className="text-4xl font-black mb-4">You're All Set!</h1>
                        <p className="text-foreground/60 mb-8">
                            Here's what you can do in the app:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            <div className="p-4 rounded-xl bg-card border border-card-border text-left">
                                <div className="text-3xl mb-2">📊</div>
                                <h3 className="font-bold mb-1">Track Progress</h3>
                                <p className="text-sm text-foreground/60">See your readiness score and analytics</p>
                            </div>
                            <div className="p-4 rounded-xl bg-card border border-card-border text-left">
                                <div className="text-3xl mb-2">🎯</div>
                                <h3 className="font-bold mb-1">Take Exams</h3>
                                <p className="text-sm text-foreground/60">Practice with realistic NCLEX simulations</p>
                            </div>
                            <div className="p-4 rounded-xl bg-card border border-card-border text-left">
                                <div className="text-3xl mb-2">🗂️</div>
                                <h3 className="font-bold mb-1">Review Cards</h3>
                                <p className="text-sm text-foreground/60">Spaced repetition for better retention</p>
                            </div>
                            <div className="p-4 rounded-xl bg-card border border-card-border text-left">
                                <div className="text-3xl mb-2">📅</div>
                                <h3 className="font-bold mb-1">Follow Your Plan</h3>
                                <p className="text-sm text-foreground/60">Daily tasks customized for you</p>
                            </div>
                        </div>
                        <button
                            onClick={handleNext}
                            className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold text-lg transition-all"
                        >
                            Start Studying →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
