'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

interface ChallengeResult {
    user_id: number;
    score: number;
    total: number;
    completed_at: string;
    user_name?: string;
}

interface Challenge {
    id: number;
    group_id: number;
    quiz_id: number;
    quiz_title: string;
    status: string;
    created_at: string;
    ends_at: string | null;
    created_by_name: string;
}

export default function ChallengeDetailPage() {
    const params = useParams();
    const groupId = params.id as string;
    const challengeId = params.challengeId as string;
    const { token } = useAuth();
    const router = useRouter();

    const [challenge, setChallenge] = useState<Challenge | null>(null);
    const [results, setResults] = useState<ChallengeResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;
        async function load() {
            try {
                // Fetch challenge details via challenges list (filter by id)
                const res = await fetch(`/api/groups/${groupId}/challenges`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const all = await res.json();
                    const found = all.find((c: Challenge) => c.id === parseInt(challengeId));
                    if (found) setChallenge(found);
                }

                // Fetch results (using a direct DB-backed route)
                const rRes = await fetch(`/api/groups/${groupId}/challenges/${challengeId}/results`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (rRes.ok) setResults(await rRes.json());
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [groupId, challengeId, token]);

    const sorted = [...results].sort((a, b) => {
        const pctA = a.total ? a.score / a.total : 0;
        const pctB = b.total ? b.score / b.total : 0;
        return pctB - pctA;
    });

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button onClick={() => router.push(`/groups/${groupId}`)} className="p-1 text-white/50 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Challenge</p>
                        <h1 className="text-base font-black uppercase tracking-tight text-white">
                            {challenge?.quiz_title || `Quiz #${challenge?.quiz_id || challengeId}`}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : (
                    <>
                        {challenge && (
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                        challenge.status === 'active'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-white/5 text-white/30 border-white/10'
                                    }`}>{challenge.status}</span>
                                    {challenge.ends_at && (
                                        <span className="text-[9px] text-white/30">Ends {new Date(challenge.ends_at).toLocaleDateString()}</span>
                                    )}
                                </div>
                                <p className="text-[10px] text-white/40">Created by {challenge.created_by_name}</p>
                            </div>
                        )}

                        {/* Take Challenge Button */}
                        {challenge?.status === 'active' && (
                            <button
                                onClick={() => router.push(`/quizzes/${challenge.quiz_id}`)}
                                className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mb-6 shadow-lg shadow-primary/20"
                            >
                                <span className="material-symbols-outlined">sports_score</span>
                                Take Challenge
                            </button>
                        )}

                        {/* Results Leaderboard */}
                        <h2 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-3">Results</h2>
                        {sorted.length === 0 ? (
                            <div className="text-center py-12 text-white/20 text-xs font-bold uppercase tracking-widest">No results yet — be the first!</div>
                        ) : sorted.map((result, i) => {
                            const pct = result.total ? Math.round((result.score / result.total) * 100) : 0;
                            return (
                                <div key={result.user_id} className={`flex items-center gap-3 bg-white/[0.03] border rounded-2xl p-4 mb-3 ${
                                    i === 0 ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-white/5'
                                }`}>
                                    <span className="text-base font-black w-6 text-center">
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-white">{result.user_name || `User #${result.user_id}`}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-white/60">{pct}%</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-white/40">{result.score}/{result.total}</span>
                                </div>
                            );
                        })}
                    </>
                )}
            </div>
        </div>
    );
}
