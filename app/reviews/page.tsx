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
        <div className="min-h-dvh bg-background text-foreground transition-colors duration-500 pb-[180px]">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/5 animate-in">
                <div className="mx-auto max-w-2xl px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="grid h-10 w-10 place-items-center rounded-2xl glass border border-white/5 hover:bg-white/10 active:scale-95 transition-all text-foreground"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </Link>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tight">Daily Reviews</h1>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-0.5">Spaced Repetition</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-6 py-8 pb-32 space-y-8 animate-in slide-in-from-bottom-5 fade-in duration-500">
                
                {/* Due Cards by Episode */}
                {dueCount > 0 ? (
                    <section className="space-y-4">
                        <div className="flex items-center gap-3 mb-2 px-2">
                            <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></div>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500">Reviews Pending</h2>
                        </div>
                        
                        <div className="space-y-3">
                            {Object.entries(cardsByEpisode).map(([episodeId, cards]) => {
                                const episode = flashcardsData.find(f => f.episodeId === parseInt(episodeId));
                                if (!episode) return null;

                                return (
                                    <Link
                                        key={episodeId}
                                        href={`/flashcards/${episodeId}`}
                                        className="block p-5 rounded-3xl glass border border-white/10 hover:bg-white/5 active:scale-95 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute -right-4 -bottom-4 opacity-5 text-white/50 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-8xl">style</span>
                                        </div>
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="pr-4">
                                                <h3 className="text-lg font-black uppercase tracking-tight">{episode.title}</h3>
                                                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest mt-1">
                                                    {cards.length} card{cards.length !== 1 ? 's' : ''} to review
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-black text-sm border border-pink-500/20">
                                                    {cards.length}
                                                </div>
                                                <span className="material-symbols-outlined text-white/20 group-hover:text-pink-400 group-hover:translate-x-1 transition-all">arrow_forward_ios</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Start Review Button */}
                        <div className="pt-4">
                            <Link
                                href={`/flashcards/${Object.keys(cardsByEpisode)[0]}`}
                                className="w-full py-5 px-6 rounded-2xl bg-pink-600 text-white flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-pink-900/20 font-black uppercase tracking-widest text-sm"
                            >
                                <span className="material-symbols-outlined">play_circle</span>
                                Start Daily Stack ({dueCount})
                            </Link>
                        </div>
                    </section>
                ) : (
                    <section className="text-center py-16 px-6 glass rounded-4xl border border-white/5">
                        <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 text-emerald-400 border border-emerald-500/20">
                            <span className="material-symbols-outlined text-5xl">task_alt</span>
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">All Caught Up!</h2>
                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-relaxed mb-8">
                            No cards due for review right now.<br/>Great job staying on track.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-flex px-8 py-4 rounded-xl glass border border-white/10 hover:bg-white/10 transition-colors font-black text-[10px] uppercase tracking-widest"
                        >
                            Back to Dashboard
                        </Link>
                    </section>
                )}

                {/* Stats Overview */}
                <section className="pt-4">
                    <div className="flex items-center gap-2 mb-4 px-2">
                        <span className="material-symbols-outlined text-sm text-slate-400">bar_chart</span>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Performance Stats</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-5 rounded-3xl glass border border-red-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <div className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest">Due Today</div>
                            </div>
                            <div className="text-4xl font-black text-red-400 tracking-tighter tabular-nums">{dueCount}</div>
                        </div>
                        <div className="p-5 rounded-3xl glass border border-emerald-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <div className="text-[10px] font-bold text-emerald-400/70 uppercase tracking-widest">Mastered</div>
                            </div>
                            <div className="text-4xl font-black text-emerald-400 tracking-tighter tabular-nums">{masteredCount}</div>
                        </div>
                        <div className="p-5 rounded-3xl glass border border-yellow-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <div className="text-[10px] font-bold text-yellow-400/70 uppercase tracking-widest">Learning</div>
                            </div>
                            <div className="text-4xl font-black text-yellow-400 tracking-tighter tabular-nums">{learningCount}</div>
                        </div>
                        <div className="p-5 rounded-3xl glass border border-blue-500/10">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <div className="text-[10px] font-bold text-blue-400/70 uppercase tracking-widest">New Cards</div>
                            </div>
                            <div className="text-4xl font-black text-blue-400 tracking-tighter tabular-nums">{newCount}</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="glass rounded-3xl p-6 border border-white/5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Overall Progress</span>
                            <span className="text-sm font-black text-emerald-400 tabular-nums">
                                {masteredCount + learningCount + newCount > 0
                                    ? Math.round((masteredCount / (masteredCount + learningCount + newCount)) * 100)
                                    : 0}%
                            </span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                                style={{
                                    width: `${masteredCount + learningCount + newCount > 0
                                        ? (masteredCount / (masteredCount + learningCount + newCount)) * 100
                                        : 0}%`
                                }}
                            />
                        </div>
                    </div>
                </section>

                {/* How SRS Works */}
                <section className="glass rounded-3xl p-6 border border-white/5 mt-8 border-t border-t-white/10 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
                    <h3 className="font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2 text-indigo-400">
                        <span className="material-symbols-outlined text-sm">psychology</span>
                        The Algorithm
                    </h3>
                    <div className="space-y-3 text-[10px] font-bold uppercase tracking-wider text-white/50">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-white/80">Again</span>
                            <span className="opacity-60">&lt; 1 minute (Missed)</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-white/80">Hard</span>
                            <span className="opacity-60">~10 minutes (Struggled)</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-white/80">Good</span>
                            <span className="opacity-60">1+ days (Knew it)</span>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                            <span className="text-white/80">Easy</span>
                            <span className="opacity-60">4+ days (Perfect)</span>
                        </div>
                    </div>
                    <div className="mt-5 p-4 rounded-xl bg-white/5 text-[10px] font-bold leading-relaxed opacity-60">
                        <span className="material-symbols-outlined text-[10px] mr-1 inline">lightbulb</span>
                        Be honest with ratings. The system adapts to show cards right before you forget them.
                    </div>
                </section>
                
            </main>
        </div>
    );
}
