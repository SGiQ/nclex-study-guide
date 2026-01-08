'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useProgress } from './ProgressContext';

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    unlocked: boolean;
    unlockedAt?: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Stats {
    totalStudyTime: number; // in seconds
    questionsAnswered: number;
    currentStreak: number;
    longestStreak: number;
    bestQuizScore: number;
    quizzesCompleted: number;
    audioCompleted: number;
    lastStudyDate: string;
}

interface AchievementContextType {
    badges: Badge[];
    stats: Stats;
    recentlyUnlocked: Badge | null;
    checkAndUnlockBadges: () => Badge[];
    updateStats: (updates: Partial<Stats>) => void;
    getCompletionRate: (type: 'quiz' | 'audio' | 'overall') => number;
    dismissNotification: () => void;
    getNextBadge: () => { badge: Badge; progress: number; target: number } | null;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

const BADGE_DEFINITIONS: Omit<Badge, 'unlocked' | 'unlockedAt'>[] = [
    {
        id: 'first_quiz',
        name: 'First Steps',
        description: 'Complete your first quiz',
        icon: '🎯',
        rarity: 'common'
    },
    {
        id: 'quiz_master',
        name: 'Quiz Master',
        description: 'Complete all quizzes with 80%+ score',
        icon: '🏆',
        rarity: 'legendary'
    },
    {
        id: 'perfect_score',
        name: 'Perfect Score',
        description: 'Get 100% on any quiz',
        icon: '💯',
        rarity: 'epic'
    },
    {
        id: 'dedicated_learner',
        name: 'Dedicated Learner',
        description: 'Complete 5 quizzes in a row',
        icon: '📚',
        rarity: 'rare'
    },
    {
        id: 'audio_enthusiast',
        name: 'Audio Enthusiast',
        description: 'Listen to 10 episodes',
        icon: '🎧',
        rarity: 'rare'
    },
    {
        id: 'study_streak_7',
        name: 'Week Warrior',
        description: 'Study 7 days in a row',
        icon: '🔥',
        rarity: 'epic'
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete a quiz before 8 AM',
        icon: '🌅',
        rarity: 'rare'
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete a quiz after 10 PM',
        icon: '🦉',
        rarity: 'rare'
    },
    {
        id: 'hundred_questions',
        name: 'Century Club',
        description: 'Answer 100 questions',
        icon: '💪',
        rarity: 'rare'
    },
    {
        id: 'five_hundred_questions',
        name: 'Knowledge Seeker',
        description: 'Answer 500 questions',
        icon: '🧠',
        rarity: 'epic'
    },
    {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Complete a 25-question quiz in under 10 minutes',
        icon: '⚡',
        rarity: 'epic'
    },
    {
        id: 'completionist',
        name: 'Completionist',
        description: 'Complete all available content',
        icon: '👑',
        rarity: 'legendary'
    }
];

export function AchievementProvider({ children }: { children: ReactNode }) {
    const { quizResults } = useProgress();

    const [badges, setBadges] = useState<Badge[]>(() => {
        if (typeof window === 'undefined') return BADGE_DEFINITIONS.map(b => ({ ...b, unlocked: false }));

        const saved = localStorage.getItem('achievements_badges');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return BADGE_DEFINITIONS.map(b => ({ ...b, unlocked: false }));
            }
        }
        return BADGE_DEFINITIONS.map(b => ({ ...b, unlocked: false }));
    });

    const [stats, setStats] = useState<Stats>(() => {
        if (typeof window === 'undefined') {
            return {
                totalStudyTime: 0,
                questionsAnswered: 0,
                currentStreak: 0,
                longestStreak: 0,
                bestQuizScore: 0,
                quizzesCompleted: 0,
                audioCompleted: 0,
                lastStudyDate: ''
            };
        }

        const saved = localStorage.getItem('achievements_stats');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) { }
        }

        return {
            totalStudyTime: 0,
            questionsAnswered: 0,
            currentStreak: 0,
            longestStreak: 0,
            bestQuizScore: 0,
            quizzesCompleted: 0,
            audioCompleted: 0,
            lastStudyDate: ''
        };
    });

    const [recentlyUnlocked, setRecentlyUnlocked] = useState<Badge | null>(null);

    // Save badges to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('achievements_badges', JSON.stringify(badges));
        }
    }, [badges]);

    // Save stats to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('achievements_stats', JSON.stringify(stats));
        }
    }, [stats]);


    const updateStats = (updates: Partial<Stats>) => {
        setStats(prev => {
            const newStats = { ...prev };

            // Handle incremental updates for counters
            if (updates.questionsAnswered !== undefined) {
                newStats.questionsAnswered = prev.questionsAnswered + updates.questionsAnswered;
            }
            if (updates.quizzesCompleted !== undefined) {
                newStats.quizzesCompleted = prev.quizzesCompleted + updates.quizzesCompleted;
            }
            if (updates.audioCompleted !== undefined) {
                newStats.audioCompleted = prev.audioCompleted + updates.audioCompleted;
            }
            if (updates.totalStudyTime !== undefined) {
                newStats.totalStudyTime = prev.totalStudyTime + updates.totalStudyTime;
            }

            // Handle max values
            if (updates.bestQuizScore !== undefined) {
                newStats.bestQuizScore = Math.max(prev.bestQuizScore, updates.bestQuizScore);
            }
            if (updates.longestStreak !== undefined) {
                newStats.longestStreak = Math.max(prev.longestStreak, updates.longestStreak);
            }

            // Direct replacements
            if (updates.currentStreak !== undefined) {
                newStats.currentStreak = updates.currentStreak;
            }
            if (updates.lastStudyDate !== undefined) {
                newStats.lastStudyDate = updates.lastStudyDate;
            }

            return newStats;
        });
    };

    const unlockBadge = (badgeId: string): Badge | null => {
        let unlockedBadge: Badge | null = null;
        setBadges(prev => prev.map(badge => {
            if (badge.id === badgeId && !badge.unlocked) {
                unlockedBadge = { ...badge, unlocked: true, unlockedAt: Date.now() };
                return unlockedBadge;
            }
            return badge;
        }));
        return unlockedBadge;
    };

    const dismissNotification = () => {
        setRecentlyUnlocked(null);
    };

    const checkAndUnlockBadges = (): Badge[] => {
        const completedQuizzes = Object.values(quizResults).filter(r => r && r.score > 0);
        const newlyUnlocked: Badge[] = [];

        // First Steps - Complete first quiz
        if (completedQuizzes.length >= 1) {
            const badge = unlockBadge('first_quiz');
            if (badge) newlyUnlocked.push(badge);
        }

        // Perfect Score - Get 100% on any quiz
        const hasPerfectScore = completedQuizzes.some(r => r.score === r.total);
        if (hasPerfectScore) {
            const badge = unlockBadge('perfect_score');
            if (badge) newlyUnlocked.push(badge);
        }

        // Quiz Master - Complete all quizzes with 80%+
        const totalQuizzes = 25;
        const highScoreQuizzes = completedQuizzes.filter(r => (r.score / r.total) >= 0.8);
        if (highScoreQuizzes.length >= totalQuizzes) {
            const badge = unlockBadge('quiz_master');
            if (badge) newlyUnlocked.push(badge);
        }

        // Dedicated Learner - Complete 5 quizzes
        if (completedQuizzes.length >= 5) {
            const badge = unlockBadge('dedicated_learner');
            if (badge) newlyUnlocked.push(badge);
        }

        // Century Club - Answer 100 questions
        if (stats.questionsAnswered >= 100) {
            const badge = unlockBadge('hundred_questions');
            if (badge) newlyUnlocked.push(badge);
        }

        // Knowledge Seeker - Answer 500 questions
        if (stats.questionsAnswered >= 500) {
            const badge = unlockBadge('five_hundred_questions');
            if (badge) newlyUnlocked.push(badge);
        }

        // Week Warrior - 7 day streak
        if (stats.currentStreak >= 7) {
            const badge = unlockBadge('study_streak_7');
            if (badge) newlyUnlocked.push(badge);
        }

        // Audio Enthusiast - Listen to 10 episodes
        if (stats.audioCompleted >= 10) {
            const badge = unlockBadge('audio_enthusiast');
            if (badge) newlyUnlocked.push(badge);
        }

        // Show notification for first newly unlocked badge
        if (newlyUnlocked.length > 0 && !recentlyUnlocked) {
            setRecentlyUnlocked(newlyUnlocked[0]);
        }

        return newlyUnlocked;
    };

    const getCompletionRate = (type: 'quiz' | 'audio' | 'overall'): number => {
        if (type === 'quiz') {
            const totalQuizzes = 25; // Update based on actual count
            return Math.round((stats.quizzesCompleted / totalQuizzes) * 100);
        } else if (type === 'audio') {
            const totalEpisodes = 16;
            return Math.round((stats.audioCompleted / totalEpisodes) * 100);
        } else {
            // Overall completion
            const quizRate = getCompletionRate('quiz');
            const audioRate = getCompletionRate('audio');
            return Math.round((quizRate + audioRate) / 2);
        }
    };

    const getNextBadge = (): { badge: Badge; progress: number; target: number } | null => {
        const lockedBadges = badges.filter(b => !b.unlocked);
        if (lockedBadges.length === 0) return null;

        // Calculate progress for each locked badge
        const badgeProgress = lockedBadges.map(badge => {
            let progress = 0;
            let target = 1;

            switch (badge.id) {
                case 'first_quiz':
                    progress = Object.values(quizResults).filter(r => r && r.score > 0).length;
                    target = 1;
                    break;
                case 'dedicated_learner':
                    progress = Object.values(quizResults).filter(r => r && r.score > 0).length;
                    target = 5;
                    break;
                case 'hundred_questions':
                    progress = stats.questionsAnswered;
                    target = 100;
                    break;
                case 'five_hundred_questions':
                    progress = stats.questionsAnswered;
                    target = 500;
                    break;
                case 'study_streak_7':
                    progress = stats.currentStreak;
                    target = 7;
                    break;
                case 'audio_enthusiast':
                    progress = stats.audioCompleted;
                    target = 10;
                    break;
                case 'perfect_score':
                    progress = Object.values(quizResults).some(r => r && r.score === r.total) ? 1 : 0;
                    target = 1;
                    break;
                default:
                    progress = 0;
                    target = 1;
            }

            return {
                badge,
                progress: Math.min(progress, target),
                target,
                percentage: Math.min((progress / target) * 100, 100)
            };
        });

        // Return the badge with highest progress percentage
        const closest = badgeProgress.sort((a, b) => b.percentage - a.percentage)[0];
        return closest || null;
    };

    // Check badges on mount and when stats change
    useEffect(() => {
        checkAndUnlockBadges();
    }, [stats, quizResults]);

    return (
        <AchievementContext.Provider value={{
            badges,
            stats,
            recentlyUnlocked,
            checkAndUnlockBadges,
            updateStats,
            getCompletionRate,
            dismissNotification,
            getNextBadge
        }}>
            {children}
        </AchievementContext.Provider>
    );
}

export function useAchievements() {
    const context = useContext(AchievementContext);
    if (context === undefined) {
        throw new Error('useAchievements must be used within an AchievementProvider');
    }
    return context;
}
