'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ExamSetupPage() {
    const router = useRouter();
    const [examMode, setExamMode] = useState<'realistic' | 'practice'>('realistic');

    const startExam = () => {
        // Store exam mode in localStorage
        localStorage.setItem('examMode', examMode);
        localStorage.setItem('examStartTime', new Date().toISOString());
        router.push('/exam');
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 mb-4">
                        <span className="text-3xl">📝</span>
                    </div>
                    <h1 className="text-4xl font-black mb-2">NCLEX Exam Simulation</h1>
                    <p className="text-foreground/60">Practice under realistic exam conditions</p>
                </div>

                {/* Mode Selection */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={() => setExamMode('realistic')}
                        className={`p-6 rounded-2xl border-2 transition-all ${examMode === 'realistic'
                                ? 'border-indigo-500 bg-indigo-500/10'
                                : 'border-card-border bg-card hover:border-indigo-500/50'
                            }`}
                    >
                        <div className="text-3xl mb-3">🎯</div>
                        <h3 className="text-xl font-bold mb-2">Realistic Mode</h3>
                        <ul className="text-sm text-foreground/70 space-y-1 text-left">
                            <li>✓ 85 questions</li>
                            <li>✓ 5-hour time limit</li>
                            <li>✓ No immediate feedback</li>
                            <li>✓ Adaptive difficulty</li>
                            <li>✓ Mimics real NCLEX</li>
                        </ul>
                    </button>

                    <button
                        onClick={() => setExamMode('practice')}
                        className={`p-6 rounded-2xl border-2 transition-all ${examMode === 'practice'
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-card-border bg-card hover:border-purple-500/50'
                            }`}
                    >
                        <div className="text-3xl mb-3">📚</div>
                        <h3 className="text-xl font-bold mb-2">Practice Mode</h3>
                        <ul className="text-sm text-foreground/70 space-y-1 text-left">
                            <li>✓ 85 questions</li>
                            <li>✓ Untimed</li>
                            <li>✓ Immediate feedback</li>
                            <li>✓ Review as you go</li>
                            <li>✓ Learning-focused</li>
                        </ul>
                    </button>
                </div>

                {/* Instructions */}
                <div className="p-6 rounded-2xl bg-card border border-card-border mb-8">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span>📋</span> Exam Instructions
                    </h3>
                    <div className="space-y-3 text-sm text-foreground/80">
                        <p>
                            <strong>What to expect:</strong> This exam simulates the actual NCLEX-PN experience
                            with 85 questions covering all categories.
                        </p>
                        <p>
                            <strong>Time limit:</strong> {examMode === 'realistic' ? '5 hours' : 'No time limit'}
                        </p>
                        <p>
                            <strong>Passing score:</strong> You need 75% or higher to pass (64/85 questions)
                        </p>
                        <p>
                            <strong>Navigation:</strong> You can mark questions for review and navigate between them
                        </p>
                        {examMode === 'realistic' && (
                            <p className="text-yellow-400">
                                <strong>⚠️ Important:</strong> In realistic mode, you won't see if your answers are
                                correct until you complete the entire exam.
                            </p>
                        )}
                    </div>
                </div>

                {/* Tips */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-8">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                        <span>💡</span> Exam Tips
                    </h3>
                    <ul className="text-sm text-foreground/80 space-y-2">
                        <li>• Read each question carefully before selecting an answer</li>
                        <li>• Mark questions you're unsure about for review</li>
                        <li>• Manage your time - aim for ~3.5 minutes per question</li>
                        <li>• Trust your first instinct unless you're certain it's wrong</li>
                        <li>• Stay calm and focused throughout the exam</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <Link
                        href="/dashboard"
                        className="flex-1 py-4 rounded-xl bg-surface/10 hover:bg-surface/20 transition-colors text-center font-semibold"
                    >
                        Cancel
                    </Link>
                    <button
                        onClick={startExam}
                        className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all font-bold shadow-lg shadow-indigo-500/50"
                    >
                        Start Exam →
                    </button>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-center text-foreground/40 mt-6">
                    This is a practice exam. Results do not guarantee performance on the actual NCLEX.
                </p>
            </div>
        </div>
    );
}
