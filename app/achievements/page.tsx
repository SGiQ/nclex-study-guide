'use client';

import Link from 'next/link';
import { useAchievements } from '@/app/context/AchievementContext';
import BadgeCard from '@/app/components/BadgeCard';

export default function AchievementsPage() {
    const { badges, stats, getCompletionRate } = useAchievements();

    const unlockedBadges = badges.filter(b => b.unlocked);
    const lockedBadges = badges.filter(b => !b.unlocked);
    const totalBadges = badges.length;
    const unlockedCount = unlockedBadges.length;
    const completionPercentage = Math.round((unlockedCount / totalBadges) * 100);

    // Sort unlocked badges by unlock date (most recent first)
    const recentlyUnlocked = [...unlockedBadges]
        .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0))
        .slice(0, 3);

    // Group badges by rarity
    const badgesByRarity = {
        legendary: badges.filter(b => b.rarity === 'legendary'),
        epic: badges.filter(b => b.rarity === 'epic'),
        rare: badges.filter(b => b.rarity === 'rare'),
        common: badges.filter(b => b.rarity === 'common')
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-[180px]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-nav-border px-4 py-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="h-8 w-8 flex items-center justify-center rounded-full bg-surface/10 hover:bg-surface/20 transition-colors">
                        ←
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Achievements</h1>
                        <p className="text-xs font-medium opacity-60">
                            {unlockedCount} of {totalBadges} unlocked ({completionPercentage}%)
                        </p>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">
                {/* Progress Overview */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30">
                    <div className="text-center mb-4">
                        <div className="text-6xl font-black text-indigo-400 mb-2">
                            {completionPercentage}%
                        </div>
                        <p className="text-sm text-foreground/70">Achievement Progress</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-3 bg-background/30 rounded-full overflow-hidden mb-4">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 rounded-lg bg-background/30">
                            <div className="text-xl font-bold text-yellow-400">{badgesByRarity.legendary.filter(b => b.unlocked).length}</div>
                            <div className="text-[10px] text-foreground/60">Legendary</div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/30">
                            <div className="text-xl font-bold text-purple-400">{badgesByRarity.epic.filter(b => b.unlocked).length}</div>
                            <div className="text-[10px] text-foreground/60">Epic</div>
                        </div>
                        <div className="p-3 rounded-lg bg-background/30">
                            <div className="text-xl font-bold text-blue-400">{badgesByRarity.rare.filter(b => b.unlocked).length}</div>
                            <div className="text-[10px] text-foreground/60">Rare</div>
                        </div>
                    </div>
                </div>

                {/* Recently Unlocked */}
                {recentlyUnlocked.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <span>✨</span> Recently Unlocked
                        </h2>
                        <div className="grid grid-cols-3 gap-3">
                            {recentlyUnlocked.map(badge => (
                                <BadgeCard key={badge.id} badge={badge} size="small" showDescription={false} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Achievement Stats */}
                <div>
                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <span>📊</span> Your Stats
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-card border border-card-border">
                            <div className="text-2xl font-black text-indigo-400">{stats.questionsAnswered}</div>
                            <div className="text-xs text-foreground/60">Questions Answered</div>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-card-border">
                            <div className="text-2xl font-black text-purple-400">{stats.quizzesCompleted}</div>
                            <div className="text-xs text-foreground/60">Quizzes Completed</div>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-card-border">
                            <div className="text-2xl font-black text-orange-400">{stats.currentStreak}</div>
                            <div className="text-xs text-foreground/60">Day Streak</div>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-card-border">
                            <div className="text-2xl font-black text-green-400">{stats.audioCompleted}</div>
                            <div className="text-xs text-foreground/60">Episodes Listened</div>
                        </div>
                    </div>
                </div>

                {/* Badge Gallery by Rarity */}
                {Object.entries(badgesByRarity).map(([rarity, rarityBadges]) => {
                    if (rarityBadges.length === 0) return null;

                    const rarityLabels = {
                        legendary: { icon: '👑', label: 'Legendary', color: 'text-yellow-400' },
                        epic: { icon: '💎', label: 'Epic', color: 'text-purple-400' },
                        rare: { icon: '⭐', label: 'Rare', color: 'text-blue-400' },
                        common: { icon: '🎖️', label: 'Common', color: 'text-gray-400' }
                    };

                    const info = rarityLabels[rarity as keyof typeof rarityLabels];
                    const unlockedInRarity = rarityBadges.filter(b => b.unlocked).length;

                    return (
                        <div key={rarity}>
                            <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${info.color}`}>
                                <span>{info.icon}</span> {info.label} Badges
                                <span className="text-xs font-normal text-foreground/60 ml-auto">
                                    {unlockedInRarity}/{rarityBadges.length}
                                </span>
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {rarityBadges.map(badge => (
                                    <BadgeCard key={badge.id} badge={badge} size="medium" />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Empty State */}
                {unlockedCount === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🏆</div>
                        <h2 className="text-2xl font-bold mb-2">Start Your Journey!</h2>
                        <p className="text-foreground/60 mb-6">
                            Complete quizzes and listen to episodes to unlock achievements!
                        </p>
                        <Link
                            href="/quizzes"
                            className="inline-block px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors font-semibold"
                        >
                            Take Your First Quiz
                        </Link>
                    </div>
                )}

                {/* Motivational Message */}
                {unlockedCount > 0 && unlockedCount < totalBadges && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                        <div className="text-sm text-foreground/80">
                            <strong>💡 Keep Going!</strong> You've unlocked {unlockedCount} out of {totalBadges} achievements.
                            {lockedBadges.length > 0 && ` ${lockedBadges.length} more to go!`}
                        </div>
                    </div>
                )}

                {/* All Unlocked Celebration */}
                {unlockedCount === totalBadges && (
                    <div className="p-6 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-center">
                        <div className="text-6xl mb-3">🎉</div>
                        <h2 className="text-2xl font-bold mb-2">Achievement Master!</h2>
                        <p className="text-foreground/70">
                            Congratulations! You've unlocked all {totalBadges} achievements!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
