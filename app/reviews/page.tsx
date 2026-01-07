'use client';

import Link from 'next/link';
import { useSRS } from '@/app/context/SRSContext';
import flashcardsData from '@/app/data/flashcards.json';

export default function ReviewsPage() {
    const { getDueCards, getDueCount, getMasteredCount, getLearningCount, getNewCount } = useSRS();

    const dueCards = getDueCards();
    const dueCount = getDueCount();
    const masteredCount = getMasteredCount();
    const learningCount = getLearningCount();
    const newCount = getNewCount();

    // Group due cards by episode
    const cardsByEpisode = dueCards.reduce((acc, card) => {
        if (card.episodeId) {
            if (!acc[card.episodeId]) {
                acc[card.episodeId] = [];
            }
            acc[card.episodeId].push(card);
        }
        return acc;
    }, {} as Record<number, typeof dueCards>);

    return (
        <div className="min-h-screen bg-background text-foreground pb-32">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-nav-border px-4 py-4">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/dashboard" className="h-8 w-8 flex items-center justify-center rounded-full bg-surface/10 hover:bg-surface/20 transition-colors">
                        ←
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight">Daily Reviews</h1>
                        <p className="text-xs font-medium opacity-60">Spaced Repetition System</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="px-4 py-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
                        <div className="text-3xl font-black text-red-400">{dueCount}</div>
                        <div className="text-xs font-bold text-red-400/70 uppercase tracking-wider">Due Today</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                        <div className="text-3xl font-black text-green-400">{masteredCount}</div>
                        <div className="text-xs font-bold text-green-400/70 uppercase tracking-wider">Mastered</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20">
                        <div className="text-3xl font-black text-yellow-400">{learningCount}</div>
                        <div className="text-xs font-bold text-yellow-400/70 uppercase tracking-wider">Learning</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                        <div className="text-3xl font-black text-blue-400">{newCount}</div>
                        <div className="text-xs font-bold text-blue-400/70 uppercase tracking-wider">New Cards</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-foreground/70">Overall Progress</span>
                        <span className="text-sm font-bold text-foreground">
                            {masteredCount + learningCount + newCount > 0
                                ? Math.round((masteredCount / (masteredCount + learningCount + newCount)) * 100)
                                : 0}%
                        </span>
                    </div>
                    <div className="h-3 bg-surface/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                            style={{
                                width: `${masteredCount + learningCount + newCount > 0
                                    ? (masteredCount / (masteredCount + learningCount + newCount)) * 100
                                    : 0}%`
                            }}
                        />
                    </div>
                </div>

                {/* Due Cards by Episode */}
                {dueCount > 0 ? (
                    <div>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span>📚</span> Cards Due for Review
                        </h2>
                        <div className="space-y-3">
                            {Object.entries(cardsByEpisode).map(([episodeId, cards]) => {
                                const episode = flashcardsData.find(f => f.episodeId === parseInt(episodeId));
                                if (!episode) return null;

                                return (
                                    <Link
                                        key={episodeId}
                                        href={`/flashcards/${episodeId}`}
                                        className="block p-4 rounded-xl bg-card border border-card-border hover:border-indigo-500/50 transition-all group"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-foreground group-hover:text-indigo-400 transition-colors">
                                                    {episode.title}
                                                </h3>
                                                <p className="text-xs text-foreground/60 mt-1">
                                                    {cards.length} card{cards.length !== 1 ? 's' : ''} due
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-sm font-bold border border-red-500/20">
                                                    {cards.length}
                                                </div>
                                                <div className="text-foreground/40 group-hover:text-indigo-400 transition-colors">
                                                    →
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Start Review Button */}
                        <Link
                            href={`/flashcards/${Object.keys(cardsByEpisode)[0]}`}
                            className="mt-6 block w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all font-bold text-center shadow-lg shadow-indigo-500/50"
                        >
                            Start Daily Review ({dueCount} cards)
                        </Link>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold mb-2">All Caught Up!</h2>
                        <p className="text-foreground/60 mb-6">
                            No cards due for review right now. Great job!
                        </p>
                        <Link
                            href="/flashcards"
                            className="inline-block px-6 py-3 rounded-lg bg-surface/10 hover:bg-surface/20 transition-colors font-semibold"
                        >
                            Browse All Flashcards
                        </Link>
                    </div>
                )}

                {/* How SRS Works */}
                <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                    <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <span>💡</span> How Spaced Repetition Works
                    </h3>
                    <div className="space-y-2 text-sm text-foreground/80">
                        <p>
                            <strong className="text-foreground">Again:</strong> Review in &lt;1 minute (didn't know it)
                        </p>
                        <p>
                            <strong className="text-foreground">Hard:</strong> Review in ~10 minutes (struggled)
                        </p>
                        <p>
                            <strong className="text-foreground">Good:</strong> Review in 1+ days (knew it)
                        </p>
                        <p>
                            <strong className="text-foreground">Easy:</strong> Review in 4+ days (very easy)
                        </p>
                    </div>
                    <div className="mt-4 p-3 rounded-lg bg-background/50 text-xs text-foreground/60">
                        💡 <strong>Tip:</strong> Be honest with your ratings! The system adapts to show you cards exactly when you're about to forget them.
                    </div>
                </div>
            </div>
        </div>
    );
}
