'use client';

import Link from 'next/link';
import { useAuth } from '@/app/context/AuthContext';
import { useStreak } from '@/app/context/StreakContext';
import { useProgress } from '@/app/context/ProgressContext';
import { useSRS } from '@/app/context/SRSContext';
import { useAchievements } from '@/app/context/AchievementContext';
import BadgeCard from '@/app/components/BadgeCard';
import episodes from '@/app/data/episodes.json';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const { currentStreak, hasCheckedInToday } = useStreak();
    const { quizResults } = useProgress();
    const { getDueCount, getMasteredCount, getLearningCount } = useSRS();
    const { badges } = useAchievements();
    const router = useRouter();

    // Achievement data
    const unlockedBadges = badges.filter(b => b.unlocked);
    const recentBadges = [...unlockedBadges]
        .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
        .slice(0, 3);
    const totalBadges = badges.length;
    const achievementProgress = Math.round((unlockedBadges.length / totalBadges) * 100);

    // Redirect if not logged in
    if (!user) {
        router.push('/landing');
        return null;
    }

    // Weakness Targeting Logic
    const weakEpisodeIds = Object.values(quizResults)
        .filter(r => (r.score / r.total) < 0.7)
        .map(r => r.episodeId);

    const suggestedReview = weakEpisodeIds.length > 0
        ? episodes.find(e => e.id === weakEpisodeIds[0])
        : null;

    const cards = [
        { title: "Audio Lessons", from: "#2563eb", to: "#1d4ed8", href: "/audio", icon: "▶", cta: "Listen Now", image: "/images/dashboard/audio-lessons-card.jpg" },
        { title: "Quizzes", from: "#475569", to: "#334155", href: "/quizzes", icon: "📝", cta: "Start Quiz", image: "/images/dashboard/quizzes-card.jpg" },
        { title: "Flashcards", from: "#9333ea", to: "#7e22ce", href: "/flashcards", icon: "🗂️", cta: "Practice" },
        { title: "Study Guides", from: "#10b981", to: "#059669", href: "/study-guides", icon: "📝", cta: "Study" },
        { title: "Exam Mode", from: "#10b981", to: "#059669", href: "/exam/setup", icon: "🎯", cta: "Take Exam" },
        { title: "Analytics", from: "#ec4899", to: "#db2777", href: "/analytics", icon: "📊", cta: "View Stats" },
        { title: "Mind Maps", from: "#0891b2", to: "#0e7490", href: "/mindmaps", icon: "🧠", cta: "Explore" },
        { title: "Infographics", from: "#db2777", to: "#be185d", href: "/infographics", icon: "🖼️", cta: "Visuals" },
        { title: "Slide Decks", from: "#4f46e5", to: "#4338ca", href: "/slides", icon: "📄", cta: "Review" },
    ];

    return (
        <div className="min-h-dvh bg-background text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-nav-border animate-in">
                <div className="mx-auto max-w-md px-4 pt-4 pb-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/landing')}
                            aria-label="Back"
                            className="grid h-10 w-10 place-items-center rounded-full bg-surface/10 hover:bg-surface/20 active:bg-surface/30 text-foreground"
                        >
                            ←
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-semibold leading-none">
                                Welcome, {user.name}!
                            </h1>
                            <p className="text-xs text-foreground/60 mt-1">
                                {user.plan === 'free' ? '🆓 Free Plan' : user.plan === 'premium' ? '⭐ Premium' : '💎 Lifetime Access'}
                            </p>
                        </div>
                        {/* Streak Counter */}
                        <div className="flex items-center gap-2">
                            <Link href="/library" className="grid h-9 w-9 place-items-center rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 active:scale-95 transition-all">
                                🔖
                            </Link>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                                <span className={`text-sm ${hasCheckedInToday ? 'animate-bounce' : ''}`}>🔥</span>
                                <span className="text-sm font-bold text-orange-500">{currentStreak}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="grid h-9 w-9 place-items-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 active:scale-95 transition-all"
                                title="Logout"
                            >
                                🚪
                            </button>
                        </div>
                    </div>

                    <div className="pt-3">
                        <p className="text-sm font-medium text-foreground/70">Study Categories</p>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="mx-auto max-w-md px-5 pb-[180px] pt-4 stagger-1">

                {/* Achievements Section */}
                <div className="mb-6 animate-slide-up">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h2 className="text-sm font-bold text-yellow-400 flex items-center gap-2">
                            <span>🏆</span> Achievements
                        </h2>
                        <Link href="/achievements" className="text-[10px] uppercase font-bold text-yellow-400/70 tracking-wider hover:text-yellow-400">
                            View All →
                        </Link>
                    </div>

                    <Link
                        href="/achievements"
                        className="group block relative overflow-hidden rounded-lg bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border border-yellow-500/20 p-4 transition-all hover:border-yellow-500/40"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="text-3xl font-black text-yellow-400">{unlockedBadges.length}/{totalBadges}</div>
                                <div className="text-xs text-yellow-400/70">Badges Unlocked</div>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform">
                                🏆
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-2 bg-background/30 rounded-full overflow-hidden mb-3">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                                style={{ width: `${achievementProgress}%` }}
                            />
                        </div>

                        {/* Recent Badges */}
                        {recentBadges.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {recentBadges.map(badge => (
                                    <div key={badge.id} className="text-center">
                                        <div className="text-2xl mb-1">{badge.icon}</div>
                                        <div className="text-[9px] text-yellow-400/70 font-medium truncate">{badge.name}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-2">
                                <span className="text-xs text-yellow-400/50 italic">Complete quizzes to unlock badges!</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Weakness Targeting Alert */}
                {suggestedReview && (
                    <div className="mb-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-2 px-1">
                            <h2 className="text-sm font-bold text-red-400 flex items-center gap-2">
                                <span>⚠️</span> Needs Review
                            </h2>
                            <span className="text-[10px] uppercase font-bold text-red-400/70 tracking-wider">Score &lt; 70%</span>
                        </div>

                        <Link
                            href={`/audio`}
                            className="group block relative overflow-hidden rounded-lg bg-gradient-to-br from-red-900/40 to-black/40 border border-red-500/20 p-4 transition-all hover:border-red-500/40"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                                    ▶
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Recommended</div>
                                    <h3 className="font-bold text-white leading-tight">{suggestedReview.title}</h3>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* SRS Daily Review Widget */}
                <div className="mb-6 animate-slide-up">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h2 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                            <span>📚</span> Daily Reviews
                        </h2>
                        <Link href="/reviews" className="text-[10px] uppercase font-bold text-indigo-300/70 tracking-wider hover:text-indigo-300">
                            View All →
                        </Link>
                    </div>

                    <Link
                        href="/reviews"
                        className="group block relative overflow-hidden rounded-lg bg-gradient-to-br from-indigo-900/60 to-purple-900/60 border border-indigo-500/30 p-4 transition-all hover:border-indigo-500/50"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <div className="text-3xl font-black text-white">{getDueCount()}</div>
                                <div className="text-xs text-indigo-200">Cards Due Today</div>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-indigo-500/30 flex items-center justify-center text-indigo-200 group-hover:scale-110 transition-transform">
                                🔄
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                            <div>
                                <span className="text-emerald-400 font-bold">{getMasteredCount()}</span>
                                <span className="text-indigo-200/60"> Mastered</span>
                            </div>
                            <div>
                                <span className="text-amber-400 font-bold">{getLearningCount()}</span>
                                <span className="text-indigo-200/60"> Learning</span>
                            </div>
                        </div>

                        {getDueCount() > 0 && (
                            <div className="mt-3 text-xs text-white font-bold bg-indigo-500/20 py-2 px-3 rounded-lg inline-block">
                                → Start Review Session
                            </div>
                        )}
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {cards.map((c) => {
                        return (
                            <Link
                                key={c.title}
                                href={c.href}
                                className="animate-enter relative aspect-square w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#3e3e42] to-[#1c1c1e] border-t border-white/10 border-b border-black/50 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-95 group"
                            >
                                {/* Soft inner glow/highlight on hover */}
                                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 text-center gap-4">
                                    {/* Icon */}
                                    <div
                                        className="text-5xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                                        style={{ color: c.from }}
                                    >
                                        {c.icon}
                                    </div>

                                    {/* Title */}
                                    <div
                                        className="text-lg font-bold tracking-wide drop-shadow-md"
                                        style={{ color: c.from }}
                                    >
                                        {c.title}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
