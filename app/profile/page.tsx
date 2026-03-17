'use client';

import React, { useState } from 'react';
import { useAuth, getAuthToken } from '@/app/context/AuthContext';
import { useProgress } from '@/app/context/ProgressContext';
import { useStreak } from '@/app/context/StreakContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const { quizResults, audioProgress } = useProgress();
    const { currentStreak } = useStreak();
    const router = useRouter();

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const stats = [
        { 
            label: 'Current Streak', 
            value: `${currentStreak} Days`, 
            icon: 'local_fire_department',
            color: 'text-orange-500'
        },
        { 
            label: 'Quizzes Taken', 
            value: Object.keys(quizResults).length, 
            icon: 'quiz',
            color: 'text-blue-500'
        },
        { 
            label: 'Audio Lessons', 
            value: Object.values(audioProgress || {}).filter(a => a.completed).length, 
            icon: 'headphones',
            color: 'text-emerald-500'
        },
    ];

    const handleLogout = () => {
        logout();
        router.push('/landing');
    };

    // Password change state
    const [showPwModal, setShowPwModal] = useState(false);
    const [currentPw, setCurrentPw] = useState('');
    const [newPw, setNewPw] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [pwLoading, setPwLoading] = useState(false);
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState(false);

    async function handleChangePassword() {
        setPwError('');
        if (newPw !== confirmPw) { setPwError('New passwords do not match'); return; }
        if (newPw.length < 8) { setPwError('New password must be at least 8 characters'); return; }
        setPwLoading(true);
        try {
            const token = getAuthToken();
            const res = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw })
            });
            const data = await res.json();
            if (!res.ok) { setPwError(data.error || 'Failed to change password'); return; }
            setPwSuccess(true);
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
            setTimeout(() => { setShowPwModal(false); setPwSuccess(false); }, 1500);
        } catch {
            setPwError('Something went wrong');
        } finally {
            setPwLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground pb-32 flex flex-col items-center">
            {/* Header / Banner */}
            <header className="w-full max-w-2xl px-6 pt-12 pb-8 flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-primary/20 mb-6">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tight">{user.name}</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{user.email}</p>
                
                <div className="mt-4 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{user.plan || 'Free Plan'}</span>
                </div>
            </header>

            <main className="w-full max-w-2xl px-6 space-y-8">
                {/* Stats Grid */}
                <section className="grid grid-cols-3 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="glass-card rounded-[9px] p-4 border border-white/5 flex flex-col items-center text-center">
                            <span className={`material-symbols-outlined ${stat.color} mb-2`}>{stat.icon}</span>
                            <span className="text-lg font-black">{stat.value}</span>
                            <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider mt-1">{stat.label}</span>
                        </div>
                    ))}
                </section>

                {/* Analytics Link */}
                <section>
                    <button
                        onClick={() => router.push('/analytics')}
                        className="w-full py-5 px-6 rounded-[9px] glass border border-white/5 text-foreground flex items-center gap-4 hover:bg-white/5 active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                        <div className="h-12 w-12 rounded-[9px] bg-primary/10 text-primary border border-primary/20 flex items-center justify-center flex-shrink-0 relative z-10">
                            <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">bar_chart</span>
                        </div>
                        <div className="text-left flex-1 relative z-10">
                            <h3 className="text-lg font-black uppercase tracking-tight">Performance Analytics</h3>
                            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-0.5">View your topic breakdown</p>
                        </div>
                        <span className="material-symbols-outlined text-xl opacity-30 group-hover:translate-x-1 transition-all relative z-10">arrow_forward_ios</span>
                    </button>
                </section>

                {/* Account Settings */}
                <section className="space-y-3">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Account Settings</h2>
                    <div className="glass-card rounded-[9px] border border-white/5 divide-y divide-white/5">
                        <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">edit</span>
                                <span className="text-[11px] font-bold uppercase tracking-widest">Edit Profile</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-700">chevron_right</span>
                        </button>
                        <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">notifications</span>
                                <span className="text-[11px] font-bold uppercase tracking-widest">Notification Settings</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-700">chevron_right</span>
                        </button>
                        <button
                            onClick={() => { setShowPwModal(true); setPwError(''); setPwSuccess(false); }}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">lock</span>
                                <span className="text-[11px] font-bold uppercase tracking-widest">Change Password</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-700">chevron_right</span>
                        </button>
                    </div>
                </section>

                {/* Support & Legal */}
                <section className="space-y-3">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Support</h2>
                    <div className="glass-card rounded-[9px] border border-white/5 divide-y divide-white/5">
                        <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">help</span>
                                <span className="text-[11px] font-bold uppercase tracking-widest">Help Center</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-700">chevron_right</span>
                        </button>
                        <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">verified_user</span>
                                <span className="text-[11px] font-bold uppercase tracking-widest">Legal & Privacy</span>
                            </div>
                            <span className="material-symbols-outlined text-slate-700">chevron_right</span>
                        </button>
                    </div>
                </section>

                {/* Logout Button */}
                <button 
                    onClick={handleLogout}
                    className="w-full py-4 rounded-[9px] bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-500/20 transition-all active:scale-[0.98]"
                >
                    Logout Session
                </button>

                <div className="text-center opacity-20">
                    <p className="text-[8px] font-black uppercase tracking-widest">NCLEX Study Guide v1.0.4</p>
                </div>
            </main>

            {/* Change Password Modal */}
            {showPwModal && (
                <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 pb-8">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowPwModal(false)} />
                    <div className="relative w-full max-w-md bg-[#0F0F14] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-widest text-white">Change Password</h3>
                            <button onClick={() => setShowPwModal(false)} className="text-white/30 hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {pwSuccess ? (
                            <div className="flex flex-col items-center gap-3 py-6">
                                <span className="material-symbols-outlined text-4xl text-emerald-400">check_circle</span>
                                <p className="text-sm font-black text-emerald-400 uppercase tracking-widest">Password Updated!</p>
                            </div>
                        ) : (
                            <>
                                {pwError && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 font-bold">
                                        {pwError}
                                    </div>
                                )}
                                <div className="flex flex-col gap-3">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5">Current Password</p>
                                        <input
                                            type="password"
                                            value={currentPw}
                                            onChange={e => setCurrentPw(e.target.value)}
                                            placeholder="Enter current password"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5">New Password</p>
                                        <input
                                            type="password"
                                            value={newPw}
                                            onChange={e => setNewPw(e.target.value)}
                                            placeholder="At least 8 characters"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1.5">Confirm New Password</p>
                                        <input
                                            type="password"
                                            value={confirmPw}
                                            onChange={e => setConfirmPw(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                                            placeholder="Repeat new password"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-1">
                                    <button
                                        onClick={() => setShowPwModal(false)}
                                        className="flex-1 py-3 rounded-xl bg-white/5 text-xs font-black uppercase tracking-widest text-white/60"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleChangePassword}
                                        disabled={pwLoading}
                                        className="flex-1 py-3 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {pwLoading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
