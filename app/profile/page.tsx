'use client';

import React from 'react';
import { useAuth } from '@/app/context/AuthContext';
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
                        <button className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors">lock</span>
                                <span className="text-[11px] font-bold uppercase tracking-widest">Privacy & Security</span>
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
        </div>
    );
}
