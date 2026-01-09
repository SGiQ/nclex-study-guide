'use client';

import Link from 'next/link';
import { useProgress } from '@/app/context/ProgressContext';
import { useSRS } from '@/app/context/SRSContext';
import { useStreak } from '@/app/context/StreakContext';
import episodes from '@/app/data/episodes.json';
import quizzes from '@/app/data/quizzes.json';

export default function AnalyticsPage() {
    const { quizResults } = useProgress();
    const { getMasteredCount, getLearningCount, getNewCount, reviewData } = useSRS();
    const { currentStreak } = useStreak();

    // Calculate Quiz Performance (40% weight)
    const quizScores = Object.values(quizResults);
    const avgQuizScore = quizScores.length > 0
        ? quizScores.reduce((sum, r) => sum + (r.score / r.total), 0) / quizScores.length
        : 0;
    const quizPerformance = avgQuizScore * 100;

    // Calculate Flashcard Mastery (30% weight)
    const totalCards = getMasteredCount() + getLearningCount() + getNewCount();
    const flashcardMastery = totalCards > 0
        ? (getMasteredCount() / totalCards) * 100
        : 0;

    // Calculate Study Consistency (20% weight)
    const studyConsistency = Math.min(currentStreak * 5, 100); // 20 days = 100%

    // Calculate Weak Area Improvement (10% weight)
    const weakAreas = quizScores.filter(r => (r.score / r.total) < 0.7);
    const weakAreaImprovement = weakAreas.length === 0 ? 100 : Math.max(0, 100 - (weakAreas.length * 10));

    // READINESS SCORE (0-100%)
    const readinessScore = Math.round(
        quizPerformance * 0.40 +
        flashcardMastery * 0.30 +
        studyConsistency * 0.20 +
        weakAreaImprovement * 0.10
    );

    // Category Performance
    const categoryPerformance: Record<string, { total: number; correct: number; count: number }> = {};

    quizScores.forEach(result => {
        const quiz = quizzes.find(q => q.episodeId === result.episodeId);
        const episode = episodes.find(e => e.id === result.episodeId);
        const category = episode?.category || 'Other';

        if (!categoryPerformance[category]) {
            categoryPerformance[category] = { total: 0, correct: 0, count: 0 };
        }

        categoryPerformance[category].total += result.total;
        categoryPerformance[category].correct += result.score;
        categoryPerformance[category].count += 1;
    });

    const categories = Object.entries(categoryPerformance).map(([name, data]) => ({
        name,
        percentage: Math.round((data.correct / data.total) * 100),
        questionsAnswered: data.total,
    })).sort((a, b) => b.percentage - a.percentage);

    // Study Statistics
    const totalQuestionsAnswered = quizScores.reduce((sum, r) => sum + r.total, 0);
    const totalFlashcardsReviewed = Object.keys(reviewData).length;

    // Get readiness color
    const getReadinessColor = (score: number) => {
        if (score >= 80) return { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', text: 'text-green-400' };
        if (score >= 60) return { bg: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/30', text: 'text-yellow-400' };
        return { bg: 'from-red-500/20 to-pink-500/20', border: 'border-red-500/30', text: 'text-red-400' };
    };

    const readinessColor = getReadinessColor(readinessScore);

    // Get category color
    const getCategoryColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 70) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // Identify weak areas
    const weakCategories = categories.filter(c => c.percentage < 70);

    return (
        <div className="min-h-screen bg-background text-foreground pb-[180px]">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-nav-border px-4 py-4">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="h-8 w-8 flex items-center justify-center rounded-full bg-surface/10 hover:bg-surface/20 transition-colors">
                        ←
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Performance Analytics</h1>
                        <p className="text-xs font-medium opacity-60">Track your NCLEX readiness</p>
                    </div>
                </div>
            </div>

            <div className="px-4 py-6 max-w-2xl mx-auto space-y-6">

                {/* Readiness Score Card */}
                <div className={`p-6 rounded-lg bg-gradient-to-br ${readinessColor.bg} border ${readinessColor.border}`}>
                    <div className="text-center">
                        <div className="text-sm font-bold text-foreground/60 uppercase tracking-wider mb-2">
                            NCLEX Readiness Score
                        </div>
                        <div className={`text-7xl font-black ${readinessColor.text} mb-2`}>
                            {readinessScore}%
                        </div>
                        <div className="text-sm text-foreground/70 mb-4">
                            {readinessScore >= 80 && "🎉 You're ready to pass!"}
                            {readinessScore >= 60 && readinessScore < 80 && "📚 Almost there! Keep studying."}
                            {readinessScore < 60 && "💪 Keep going! You're making progress."}
                        </div>

                        {/* Progress Bar */}
                        <div className="h-3 bg-background/30 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${readinessScore >= 80 ? 'bg-green-500' : readinessScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'} transition-all duration-500`}
                                style={{ width: `${readinessScore}%` }}
                            />
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <div className="p-3 rounded-lg bg-background/30">
                                <div className="text-xs text-foreground/60">Quiz Performance</div>
                                <div className="text-lg font-bold">{Math.round(quizPerformance)}%</div>
                                <div className="text-[10px] text-foreground/40">40% weight</div>
                            </div>
                            <div className="p-3 rounded-lg bg-background/30">
                                <div className="text-xs text-foreground/60">Card Mastery</div>
                                <div className="text-lg font-bold">{Math.round(flashcardMastery)}%</div>
                                <div className="text-[10px] text-foreground/40">30% weight</div>
                            </div>
                            <div className="p-3 rounded-lg bg-background/30">
                                <div className="text-xs text-foreground/60">Consistency</div>
                                <div className="text-lg font-bold">{Math.round(studyConsistency)}%</div>
                                <div className="text-[10px] text-foreground/40">20% weight</div>
                            </div>
                            <div className="p-3 rounded-lg bg-background/30">
                                <div className="text-xs text-foreground/60">Improvement</div>
                                <div className="text-lg font-bold">{Math.round(weakAreaImprovement)}%</div>
                                <div className="text-[10px] text-foreground/40">10% weight</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Study Statistics */}
                <div>
                    <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                        <span>📊</span> Study Statistics
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-lg bg-card border border-card-border">
                            <div className="text-3xl font-black text-indigo-400">{totalQuestionsAnswered}</div>
                            <div className="text-xs text-foreground/60">Questions Answered</div>
                        </div>
                        <div className="p-4 rounded-lg bg-card border border-card-border">
                            <div className="text-3xl font-black text-purple-400">{getMasteredCount()}</div>
                            <div className="text-xs text-foreground/60">Cards Mastered</div>
                        </div>
                        <div className="p-4 rounded-lg bg-card border border-card-border">
                            <div className="text-3xl font-black text-orange-400">{currentStreak}</div>
                            <div className="text-xs text-foreground/60">Day Streak</div>
                        </div>
                        <div className="p-4 rounded-lg bg-card border border-card-border">
                            <div className="text-3xl font-black text-green-400">{quizScores.length}</div>
                            <div className="text-xs text-foreground/60">Quizzes Completed</div>
                        </div>
                    </div>
                </div>

                {/* Category Performance */}
                {categories.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <span>🎯</span> Category Performance
                        </h2>
                        <div className="space-y-3">
                            {categories.map((category) => (
                                <div key={category.name} className="p-4 rounded-lg bg-card border border-card-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <div className="font-bold text-foreground">{category.name}</div>
                                            <div className="text-xs text-foreground/60">{category.questionsAnswered} questions</div>
                                        </div>
                                        <div className="text-2xl font-black" style={{ color: category.percentage >= 80 ? '#4ade80' : category.percentage >= 70 ? '#fbbf24' : '#f87171' }}>
                                            {category.percentage}%
                                        </div>
                                    </div>
                                    <div className="h-2 bg-surface/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getCategoryColor(category.percentage)} transition-all duration-500`}
                                            style={{ width: `${category.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Weak Areas */}
                {weakCategories.length > 0 && (
                    <div>
                        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                            <span>⚠️</span> Areas Needing Attention
                        </h2>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20">
                            <p className="text-sm text-foreground/80 mb-3">
                                Focus on these categories to improve your readiness score:
                            </p>
                            <div className="space-y-2">
                                {weakCategories.map((category) => (
                                    <div key={category.name} className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-red-400">{category.name}</span>
                                        <span className="text-red-400/70">{category.percentage}%</span>
                                    </div>
                                ))}
                            </div>
                            <Link
                                href="/quizzes"
                                className="mt-4 block w-full py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors text-center text-sm font-bold text-red-400"
                            >
                                Practice Weak Areas →
                            </Link>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {quizScores.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📊</div>
                        <h2 className="text-2xl font-bold mb-2">No Data Yet</h2>
                        <p className="text-foreground/60 mb-6">
                            Complete some quizzes and review flashcards to see your analytics!
                        </p>
                        <Link
                            href="/quizzes"
                            className="inline-block px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors font-semibold"
                        >
                            Start a Quiz
                        </Link>
                    </div>
                )}

                {/* Motivational Message */}
                {quizScores.length > 0 && (
                    <div className="p-4 rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                        <div className="text-sm text-foreground/80">
                            <strong>💡 Tip:</strong> Aim for 80%+ readiness score before your exam.
                            Focus on weak categories and maintain your study streak for best results!
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
