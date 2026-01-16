'use client';

import React from 'react';
import Link from 'next/link';

interface ReadinessScoreCardProps {
    score: number;
    totalQuestions: number;
    questionsAttempted: number;
}

export default function ReadinessScoreCard({ score, totalQuestions, questionsAttempted }: ReadinessScoreCardProps) {
    // Calculate color based on score
    const getScoreColor = (s: number) => {
        if (s >= 70) return '#10b981'; // Emerald-500
        if (s >= 50) return '#f59e0b'; // Amber-500
        return '#ef4444'; // Red-500
    };

    const scoreColor = getScoreColor(score);
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    // Ensure score is within 0-100
    const normalizedScore = Math.min(100, Math.max(0, score));
    const offset = circumference - (normalizedScore / 100) * circumference;

    // Predicted Pass Probability stars (0-5)
    // Simple logic for MVP: score / 20
    const stars = Math.min(5, Math.max(0, Math.round(score / 20)));

    return (
        <div className="relative overflow-hidden rounded-2xl bg-[#1A1A20] border border-white/10 shadow-xl mb-6 group">
            {/* Top Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl -ml-5 -mb-5" />

            <div className="relative p-6">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-pink-400/90 mb-1">
                        Exam Readiness
                    </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 relative z-10">

                    {/* Left Stats Pill (Desktop: Left, Mobile: Top) */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-1 items-start bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-3 transform -translate-x-2 transition-transform group-hover:translate-x-0">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Content Bank</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-white">{totalQuestions.toLocaleString()}+</span>
                            <span className="text-xs text-white/50">Questions</span>
                        </div>
                    </div>

                    {/* Circular Progress */}
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        {/* Background Circle */}
                        <svg className="absolute w-full h-full transform -rotate-90">
                            <circle
                                cx="50%"
                                cy="50%"
                                r={radius}
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-white/5"
                            />
                            {/* Gradient Defs */}
                            <defs>
                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#ec4899" /> {/* Pink-500 */}
                                    <stop offset="100%" stopColor="#8b5cf6" /> {/* Violet-500 */}
                                </linearGradient>
                            </defs>
                            {/* Progress Circle */}
                            <circle
                                cx="50%"
                                cy="50%"
                                r={radius}
                                stroke="url(#scoreGradient)"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>

                        {/* Center Content */}
                        <div className="text-center flex flex-col items-center">
                            <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 tracking-tighter">
                                {Math.round(normalizedScore)}
                            </span>
                            <span className="text-sm font-bold text-white/30">%</span>
                        </div>
                    </div>

                    {/* Right Stats Pill (Desktop: Right) */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:flex flex-col gap-1 items-end bg-white/5 backdrop-blur-sm border border-white/5 rounded-xl p-3 transform translate-x-2 transition-transform group-hover:translate-x-0">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">Prediction</span>
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <span key={s} className={`text-sm ${s <= stars ? 'text-yellow-400' : 'text-white/10'}`}>★</span>
                            ))}
                        </div>
                        <span className="text-[10px] text-emerald-400 font-bold">Very Likely Pass</span>
                    </div>

                    {/* Mobile Only Floating Stats */}
                    <div className="flex sm:hidden w-full justify-between items-center px-2 mt-2">
                        <div className="text-center">
                            <div className="text-lg font-bold text-white">{totalQuestions}</div>
                            <div className="text-[9px] text-white/40 uppercase">Questions</div>
                        </div>
                        <div className="text-center">
                            <div className="flex gap-0.5 justify-center">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <span key={s} className={`text-xs ${s <= stars ? 'text-yellow-400' : 'text-white/10'}`}>★</span>
                                ))}
                            </div>
                            <div className="text-[9px] text-emerald-400 font-bold mt-0.5">Good Chance</div>
                        </div>
                    </div>

                </div>

                {/* Bottom Status Bubble */}

                <div className="mt-6 flex justify-center">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 flex items-center gap-2">
                        <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-xs font-bold text-emerald-400">+12% this week</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
