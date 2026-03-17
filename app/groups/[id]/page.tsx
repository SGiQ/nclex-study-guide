'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth, getAuthToken } from '@/app/context/AuthContext';

type Tab = 'feed' | 'leaderboard' | 'chat' | 'challenges';

interface ActivityEvent {
    id: number;
    activity_type: string;
    metadata: Record<string, any>;
    created_at: string;
    user_name: string;
    user_id: number;
}

interface Message {
    id: number;
    message: string;
    created_at: string;
    user_id: number;
    user_name: string;
}

interface LeaderboardEntry {
    user_id: number;
    name: string;
    role: string;
    readiness_score: number;
    current_streak: number;
    quizzes_completed: number;
    last_study_date: string | null;
}

interface Challenge {
    id: number;
    quiz_id: number;
    quiz_title: string;
    status: string;
    created_at: string;
    created_by_name: string;
    ends_at: string | null;
    result_count: number;
}

interface Group {
    id: number;
    name: string;
    invite_code: string;
    members: { user_id: number; name: string; role: string }[];
}

export default function GroupHomePage() {
    const params = useParams();
    const groupId = params.id as string;
    const { user } = useAuth();
    const token = getAuthToken();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('feed');
    const [group, setGroup] = useState<Group | null>(null);

    const [feed, setFeed] = useState<ActivityEvent[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [challenges, setChallenges] = useState<Challenge[]>([]);

    const [messageInput, setMessageInput] = useState('');
    const [toast, setToast] = useState<string | null>(null);
    const [showCreateChallenge, setShowCreateChallenge] = useState(false);
    const [challengeQuizId, setChallengeQuizId] = useState('');
    const [challengeTitle, setChallengeTitle] = useState('');

    const chatBottomRef = useRef<HTMLDivElement>(null);
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    }

    const fetchFeed = useCallback(async () => {
        const res = await fetch(`/api/groups/${groupId}/activity`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setFeed(await res.json());
    }, [groupId, token]);

    const fetchMessages = useCallback(async () => {
        const res = await fetch(`/api/groups/${groupId}/messages`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setMessages(await res.json());
    }, [groupId, token]);

    const fetchLeaderboard = useCallback(async () => {
        const res = await fetch(`/api/groups/${groupId}/leaderboard`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setLeaderboard(await res.json());
    }, [groupId, token]);

    const fetchChallenges = useCallback(async () => {
        const res = await fetch(`/api/groups/${groupId}/challenges`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setChallenges(await res.json());
    }, [groupId, token]);

    // Load group details
    useEffect(() => {
        if (!token) return;
        fetch(`/api/groups/${groupId}`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json()).then(setGroup).catch(console.error);
    }, [groupId, token]);

    // Load data for current tab
    useEffect(() => {
        if (!token) return;
        if (activeTab === 'feed') fetchFeed();
        if (activeTab === 'chat') fetchMessages();
        if (activeTab === 'leaderboard') fetchLeaderboard();
        if (activeTab === 'challenges') fetchChallenges();
    }, [activeTab, token]);

    // Auto-refresh feed and chat every 30s
    useEffect(() => {
        if (!token) return;
        const interval = setInterval(() => {
            if (activeTab === 'feed') fetchFeed();
            if (activeTab === 'chat') fetchMessages();
        }, 30000);
        return () => clearInterval(interval);
    }, [activeTab, token, fetchFeed, fetchMessages]);

    // Scroll chat to bottom on new messages
    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    async function sendMessage() {
        if (!messageInput.trim()) return;
        const res = await fetch(`/api/groups/${groupId}/messages`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ message: messageInput.trim() })
        });
        if (res.ok) {
            setMessageInput('');
            fetchMessages();
        }
    }

    async function handleNudge(targetUserId: number, targetName: string) {
        const res = await fetch(`/api/groups/${groupId}/nudge`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ target_user_id: targetUserId })
        });
        if (res.ok) showToast(`Nudge sent to ${targetName}! 🔔`);
        else showToast('Failed to send nudge');
    }

    async function createChallenge() {
        if (!challengeQuizId) return;
        const res = await fetch(`/api/groups/${groupId}/challenges`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ quiz_id: parseInt(challengeQuizId), quiz_title: challengeTitle })
        });
        if (res.ok) {
            setShowCreateChallenge(false);
            setChallengeQuizId('');
            setChallengeTitle('');
            showToast('Challenge created!');
            fetchChallenges();
        }
    }

    function isInactive(lastStudyDate: string | null) {
        if (!lastStudyDate) return true;
        const diff = Date.now() - new Date(lastStudyDate).getTime();
        return diff > 24 * 60 * 60 * 1000;
    }

    function activityIcon(type: string) {
        switch (type) {
            case 'episode_completed': return 'headphones';
            case 'quiz_completed': return 'quiz';
            case 'badge_unlocked': return 'emoji_events';
            case 'nudge_received': return 'notifications';
            default: return 'bolt';
        }
    }

    function activityLabel(event: ActivityEvent) {
        const m = event.metadata;
        switch (event.activity_type) {
            case 'episode_completed': return `completed "${m.title || 'an episode'}"`;
            case 'quiz_completed': return `scored ${m.score}/${m.total} on "${m.title || 'a quiz'}"`;
            case 'badge_unlocked': return `unlocked "${m.title || 'a badge'}" 🏅`;
            case 'nudge_received': return `was nudged by ${m.from_name || 'a teammate'} 🔔`;
            default: return 'did something awesome';
        }
    }

    function timeAgo(dateStr: string) {
        const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
        if (diff < 60) return `${diff}s ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    }

    const tabs: { id: Tab; icon: string; label: string }[] = [
        { id: 'feed', icon: 'dynamic_feed', label: 'Feed' },
        { id: 'leaderboard', icon: 'leaderboard', label: 'Board' },
        { id: 'chat', icon: 'chat', label: 'Chat' },
        { id: 'challenges', icon: 'sports_score', label: 'Challenges' },
    ];

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white flex flex-col">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] bg-emerald-500 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {toast}
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5 px-4 py-3">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button onClick={() => router.push('/groups')} className="p-1 text-white/50 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Study Group</p>
                        <h1 className="text-base font-black uppercase tracking-tight text-white truncate">{group?.name || '...'}</h1>
                    </div>
                    {group && (
                        <span className="text-[9px] font-mono text-white/30 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                            {group.invite_code}
                        </span>
                    )}
                </div>
                {/* Tabs */}
                <div className="max-w-2xl mx-auto flex gap-1 mt-3">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab.id
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-white/30 hover:text-white/60'
                            }`}
                        >
                            <span className="material-symbols-outlined text-base">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-32">

                {/* === FEED === */}
                {activeTab === 'feed' && (
                    <div className="flex flex-col gap-3">
                        {feed.length === 0 ? (
                            <div className="text-center py-20 text-white/20 text-xs font-bold uppercase tracking-widest">No activity yet</div>
                        ) : feed.map(event => (
                            <div key={event.id} className="flex gap-3 items-start bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                    event.activity_type === 'nudge_received' ? 'bg-yellow-500/10' : 'bg-primary/10'
                                }`}>
                                    <span className={`material-symbols-outlined text-lg ${
                                        event.activity_type === 'nudge_received' ? 'text-yellow-400' : 'text-primary'
                                    }`}>{activityIcon(event.activity_type)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-white/80">
                                        <span className="font-black text-white">{event.user_name}</span>{' '}
                                        {activityLabel(event)}
                                    </p>
                                    <p className="text-[9px] text-white/30 mt-0.5">{timeAgo(event.created_at)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* === LEADERBOARD === */}
                {activeTab === 'leaderboard' && (
                    <div className="flex flex-col gap-3">
                        {leaderboard.map((entry, i) => {
                            const inactive = isInactive(entry.last_study_date);
                            const isMe = user && entry.user_id === (user as any).id;
                            return (
                                <div key={entry.user_id} className={`flex items-center gap-3 bg-white/[0.03] border rounded-2xl p-4 transition-all ${
                                    i === 0 ? 'border-yellow-500/20 bg-yellow-500/5' :
                                    isMe ? 'border-primary/20' : 'border-white/5'
                                }`}>
                                    <span className={`text-base font-black w-6 text-center ${
                                        i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : i === 2 ? 'text-amber-600' : 'text-white/20'
                                    }`}>
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black text-white truncate">
                                            {entry.name} {isMe && <span className="text-primary">(you)</span>}
                                        </p>
                                        <div className="flex gap-3 mt-0.5">
                                            <span className="text-[9px] text-white/40">📊 {entry.readiness_score}%</span>
                                            <span className="text-[9px] text-white/40">🔥 {entry.current_streak}d</span>
                                            <span className="text-[9px] text-white/40">✅ {entry.quizzes_completed} quizzes</span>
                                        </div>
                                    </div>
                                    {inactive && !isMe && (
                                        <button
                                            onClick={() => handleNudge(entry.user_id, entry.name)}
                                            className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 hover:bg-yellow-500/20 transition-colors"
                                            title={`Nudge ${entry.name}`}
                                        >
                                            <span className="material-symbols-outlined text-sm">notifications</span>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* === CHAT === */}
                {activeTab === 'chat' && (
                    <div className="flex flex-col h-full">
                        <div className="flex-1 flex flex-col gap-2 overflow-y-auto pb-4" style={{ minHeight: '50vh' }}>
                            {messages.length === 0 ? (
                                <div className="text-center py-20 text-white/20 text-xs font-bold uppercase tracking-widest">No messages yet</div>
                            ) : messages.map(msg => {
                                const isMe = user && msg.user_id === (user as any).id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                                            isMe ? 'bg-primary text-white rounded-br-md' : 'bg-white/[0.06] text-white rounded-bl-md'
                                        }`}>
                                            {!isMe && <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{msg.user_name}</p>}
                                            <p className="text-sm">{msg.message}</p>
                                            <p className="text-[8px] opacity-40 mt-1 text-right">{timeAgo(msg.created_at)}</p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatBottomRef} />
                        </div>
                        {/* Chat Input */}
                        <div className="fixed bottom-[64px] left-0 right-0 max-w-2xl mx-auto px-4 pb-2">
                            <div className="flex gap-2 bg-[#0A0A0F] pt-2">
                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={e => setMessageInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                    placeholder="Message..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
                                />
                                <button
                                    onClick={sendMessage}
                                    className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
                                >
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* === CHALLENGES === */}
                {activeTab === 'challenges' && (
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => setShowCreateChallenge(true)}
                            className="w-full py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Create Challenge
                        </button>
                        {challenges.length === 0 ? (
                            <div className="text-center py-16 text-white/20 text-xs font-bold uppercase tracking-widest">No challenges yet</div>
                        ) : challenges.map(c => (
                            <button
                                key={c.id}
                                onClick={() => router.push(`/groups/${groupId}/challenges/${c.id}`)}
                                className="w-full text-left bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-xs font-black uppercase tracking-tight text-white">{c.quiz_title || `Quiz #${c.quiz_id}`}</h4>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                                        c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-white/5 text-white/30 border-white/10'
                                    }`}>{c.status}</span>
                                </div>
                                <div className="flex gap-3 text-[9px] text-white/30">
                                    <span>By {c.created_by_name}</span>
                                    <span>{c.result_count} result{Number(c.result_count) !== 1 ? 's' : ''}</span>
                                    {c.ends_at && <span>Ends {new Date(c.ends_at).toLocaleDateString()}</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Challenge Modal */}
            {showCreateChallenge && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 pb-8">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowCreateChallenge(false)} />
                    <div className="relative w-full max-w-md bg-[#0F0F14] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Create Challenge</h3>
                        <input
                            type="number"
                            value={challengeQuizId}
                            onChange={e => setChallengeQuizId(e.target.value)}
                            placeholder="Quiz ID..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
                        />
                        <input
                            type="text"
                            value={challengeTitle}
                            onChange={e => setChallengeTitle(e.target.value)}
                            placeholder="Challenge title (optional)..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowCreateChallenge(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-xs font-black uppercase tracking-widest text-white/60">Cancel</button>
                            <button onClick={createChallenge} className="flex-1 py-3 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
