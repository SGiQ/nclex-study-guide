'use client';

import { useState, useEffect } from 'react';
import { getAuthToken } from '@/app/context/AuthContext';

interface QuizAttempt {
    id: number;
    score: number;
    total: number;
    percentage: number;
    completed_at: string;
}

interface ScoreHistoryModalProps {
    quizId: number;
    quizTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ScoreHistoryModal({ quizId, quizTitle, isOpen, onClose }: ScoreHistoryModalProps) {
    const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
    const [bestScore, setBestScore] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadHistory();
        }
    }, [isOpen, quizId]);

    const loadHistory = async () => {
        const token = getAuthToken();
        if (!token) return;

        try {
            const response = await fetch(`/api/progress/history?quizId=${quizId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setAttempts(data.attempts || []);
                setBestScore(data.bestScore);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const average = attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : 0;

    const improvement = attempts.length >= 2
        ? attempts[0].percentage - attempts[attempts.length - 1].percentage
        : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-[#1A1A20] rounded-lg p-6 max-w-md w-full border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">📊 Score History</h2>
                        <p className="text-sm text-white/50 mt-1">{quizTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-white/50">Loading...</div>
                ) : attempts.length === 0 ? (
                    <div className="text-center py-12 text-white/50">No attempts yet</div>
                ) : (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-black/30 rounded-lg p-3 text-center">
                                <div className="text-xs text-white/50 mb-1">Best</div>
                                <div className="text-xl font-bold text-emerald-400">{bestScore}%</div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3 text-center">
                                <div className="text-xs text-white/50 mb-1">Average</div>
                                <div className="text-xl font-bold text-white">{average}%</div>
                            </div>
                            <div className="bg-black/30 rounded-lg p-3 text-center">
                                <div className="text-xs text-white/50 mb-1">Improvement</div>
                                <div className={`text-xl font-bold ${improvement >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {improvement >= 0 ? '+' : ''}{improvement}%
                                </div>
                            </div>
                        </div>

                        {/* Attempts List */}
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {attempts.map((attempt, index) => {
                                const isBest = attempt.percentage === bestScore;
                                const date = new Date(attempt.completed_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                });

                                return (
                                    <div
                                        key={attempt.id}
                                        className={`p-4 rounded-lg border transition-colors ${isBest
                                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                                : 'bg-white/5 border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-white">
                                                        Attempt {attempts.length - index}
                                                    </span>
                                                    {isBest && <span className="text-xs">⭐</span>}
                                                </div>
                                                <div className="text-xs text-white/50 mt-1">{date}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-2xl font-bold ${attempt.percentage >= 70 ? 'text-emerald-400' : 'text-orange-400'
                                                    }`}>
                                                    {attempt.percentage}%
                                                </div>
                                                <div className="text-xs text-white/50">
                                                    {attempt.score}/{attempt.total}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="w-full mt-6 py-3 bg-white text-black font-bold rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-transform"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
