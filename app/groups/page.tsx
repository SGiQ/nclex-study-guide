'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getAuthToken } from '@/app/context/AuthContext';

interface Group {
    id: number;
    name: string;
    invite_code: string;
    member_count: number;
    role: string;
    created_at: string;
}

export default function GroupsPage() {
    const { user } = useAuth();
    const token = getAuthToken();
    const router = useRouter();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showJoin, setShowJoin] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [toast, setToast] = useState<string | null>(null);
    const createRef = useRef<HTMLInputElement>(null);
    const joinRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (showCreate) setTimeout(() => createRef.current?.focus(), 100);
        if (showJoin) setTimeout(() => joinRef.current?.focus(), 100);
    }, [showCreate, showJoin]);

    function showToast(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    }

    async function fetchGroups() {
        if (!token) return;
        try {
            const res = await fetch('/api/groups', { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) setGroups(await res.json());
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchGroups(); }, [token]);

    async function handleCreate() {
        if (!newGroupName.trim()) return;
        const res = await fetch('/api/groups', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ name: newGroupName.trim() })
        });
        if (res.ok) {
            setShowCreate(false);
            setNewGroupName('');
            showToast('Group created!');
            fetchGroups();
        } else {
            showToast('Failed to create group');
        }
    }

    async function handleJoin() {
        if (!inviteCode.trim()) return;
        const res = await fetch('/api/groups/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ invite_code: inviteCode.trim() })
        });
        if (res.ok) {
            setShowJoin(false);
            setInviteCode('');
            showToast('Joined group!');
            fetchGroups();
        } else {
            const err = await res.json();
            showToast(err.error || 'Invalid invite code');
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] bg-emerald-500 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    {toast}
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">Study Together</p>
                        <h1 className="text-xl font-black uppercase tracking-tight text-white">My Groups</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowJoin(true)}
                            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                        >
                            Join
                        </button>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors"
                        >
                            + Create
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 pb-32">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                ) : groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-6">
                        <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-4xl text-white/20">group</span>
                        </div>
                        <div className="text-center">
                            <p className="text-white/30 text-sm font-bold uppercase tracking-widest">No groups yet</p>
                            <p className="text-white/20 text-xs mt-1">Create one or join with an invite code</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCreate(true)}
                                className="px-6 py-3 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors"
                            >
                                Create Group
                            </button>
                            <button
                                onClick={() => setShowJoin(true)}
                                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
                            >
                                Join Group
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {groups.map(group => (
                            <button
                                key={group.id}
                                onClick={() => router.push(`/groups/${group.id}`)}
                                className="w-full text-left bg-white/[0.03] border border-white/10 rounded-2xl p-4 hover:border-primary/30 hover:bg-white/[0.05] transition-all group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-black uppercase tracking-tight text-white text-sm group-hover:text-primary transition-colors">
                                        {group.name}
                                    </h3>
                                    {group.role === 'admin' && (
                                        <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                                            Admin
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] text-white/40 font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">group</span>
                                        {group.member_count} member{Number(group.member_count) !== 1 ? 's' : ''}
                                    </span>
                                    <span className="text-[10px] text-white/30 font-mono">
                                        Code: {group.invite_code}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 pb-8">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowCreate(false)} />
                    <div className="relative w-full max-w-md bg-[#0F0F14] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Create Group</h3>
                        <input
                            ref={createRef}
                            type="text"
                            value={newGroupName}
                            onChange={e => setNewGroupName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                            placeholder="Group name..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50"
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-xs font-black uppercase tracking-widest text-white/60">Cancel</button>
                            <button onClick={handleCreate} className="flex-1 py-3 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors">Create</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Group Modal */}
            {showJoin && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 pb-8">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowJoin(false)} />
                    <div className="relative w-full max-w-md bg-[#0F0F14] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-300">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white">Join Group</h3>
                        <input
                            ref={joinRef}
                            type="text"
                            value={inviteCode}
                            onChange={e => setInviteCode(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && handleJoin()}
                            placeholder="Enter invite code..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono placeholder-white/30 focus:outline-none focus:border-primary/50 uppercase tracking-widest"
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowJoin(false)} className="flex-1 py-3 rounded-xl bg-white/5 text-xs font-black uppercase tracking-widest text-white/60">Cancel</button>
                            <button onClick={handleJoin} className="flex-1 py-3 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors">Join</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
