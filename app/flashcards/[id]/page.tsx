'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import flashcardsData from '@/app/data/flashcards.json';
import { useSRS } from '@/app/context/SRSContext';

export default function FlashcardRunnerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const episodeId = parseInt(id);
    const flashcardSet = flashcardsData.find((f) => f.episodeId === episodeId);
    const { initializeCard, recordReview, getCardStatus } = useSRS();

    if (!flashcardSet) {
        return (
            <div className="min-h-dvh bg-background text-foreground flex items-center justify-center flex-col gap-6 text-center px-6">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-white/20 mb-2 border border-white/10">
                    <span className="material-symbols-outlined text-5xl">style</span>
                </div>
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tight">No Flashcards Found</h1>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-2">There are no flashcards for this episode yet.</p>
                </div>
                <Link href="/" className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-105 active:scale-95 transition-all">
                    Back Home
                </Link>
            </div>
        );
    }

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [showExplain, setShowExplain] = useState(false);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loadingExplain, setLoadingExplain] = useState(false);

    const currentCard = flashcardSet.cards[currentIndex];
    const totalCards = flashcardSet.cards.length;
    const cardId = `flashcard-${episodeId}-${currentCard.id}`;

    // Initialize card in SRS system
    useEffect(() => {
        initializeCard(cardId, 'flashcard', episodeId);
    }, [cardId, episodeId]);

    const cardStatus = getCardStatus(cardId);

    const handleExplain = async () => {
        setShowExplain(true);
        if (explanation) return;

        setLoadingExplain(true);
        try {
            const res = await fetch('/api/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    front: currentCard.front,
                    back: currentCard.back
                })
            });
            const data = await res.json();
            if (data.explanation) {
                setExplanation(data.explanation);
            } else {
                setExplanation('Sorry, I could not generate an explanation.');
            }
        } catch (error) {
            console.error(error);
            setExplanation('An error occurred while fetching the explanation.');
        } finally {
            setLoadingExplain(false);
        }
    };

    // Handle SRS difficulty rating
    const handleDifficulty = (difficulty: 'again' | 'hard' | 'good' | 'easy') => {
        recordReview(cardId, difficulty);
        nextCard();
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                setIsFlipped(prev => !prev);
            } else if (e.code === 'ArrowRight') {
                nextCard();
            } else if (e.code === 'ArrowLeft') {
                prevCard();
            } else if (isFlipped) {
                // SRS shortcuts when card is flipped
                if (e.code === 'Digit1') handleDifficulty('again');
                else if (e.code === 'Digit2') handleDifficulty('hard');
                else if (e.code === 'Digit3') handleDifficulty('good');
                else if (e.code === 'Digit4') handleDifficulty('easy');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, isFlipped]);

    // Reset state on card change
    useEffect(() => {
        setExplanation(null);
        setShowExplain(false);
        setIsFlipped(false);
    }, [currentIndex]);

    const nextCard = () => {
        if (currentIndex < totalCards - 1) {
            setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
        }
    };

    // Get status badge
    const getStatusBadge = () => {
        if (!cardStatus) return null;

        const badges = {
            new: { text: 'New', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
            learning: { text: 'Learning', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
            mastered: { text: 'Mastered', color: 'bg-green-500/10 text-green-500 border-green-500/20' }
        };

        const badge = badges[cardStatus.status];
        return (
            <div className={`px-2 py-1 rounded-full text-[10px] font-bold border ${badge.color}`}>
                {badge.text}
            </div>
        );
    };

    return (
        <div className="min-h-dvh bg-background text-foreground flex flex-col font-sans overflow-hidden relative transition-colors duration-300">

            {/* Top Bar */}
            <header className="px-6 py-4 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
                <div className="mx-auto w-full max-w-2xl flex items-center justify-between">
                    <Link href="/" className="grid h-10 w-10 place-items-center rounded-2xl glass border border-white/5 hover:bg-white/10 active:scale-95 transition-all text-foreground">
                        <span className="material-symbols-outlined">close</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="text-[10px] font-black text-foreground uppercase tracking-widest truncate max-w-[120px]">
                            {flashcardSet.title}
                        </div>
                        {getStatusBadge()}
                    </div>
                </div>
            </header>

            {/* Main Content Area - Optimized for Mobile */}
            <main className="flex-1 flex items-center justify-center px-2 sm:px-6 py-4 relative perspective-1000">

                {/* Card Counter - Fixed at Top */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-0.5 bg-background/80 backdrop-blur px-3 py-1.5 rounded-full">
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                        Card
                    </span>
                    <span className="text-base font-bold tabular-nums text-foreground">
                        {currentIndex + 1} <span className="text-foreground/30">/</span> {totalCards}
                    </span>
                </div>

                {/* Previous Button - Left Side */}
                <button
                    onClick={prevCard}
                    disabled={currentIndex === 0}
                    className="absolute left-4 sm:relative sm:left-0 h-12 w-12 sm:h-16 sm:w-16 rounded-2xl glass hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-black/20 transition-all text-foreground border border-white/5 flex items-center justify-center z-30 shrink-0"
                    aria-label="Previous Card"
                >
                    <span className="material-symbols-outlined text-2xl">chevron_left</span>
                </button>

                {/* Card Container */}
                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
                    {/* 3D Flip Card Container */}
                    <div
                        className="relative w-full aspect-[4/5] sm:aspect-[16/10] max-h-[65vh] cursor-pointer group"
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div
                            className={`w-full h-full duration-500 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}
                            style={{ transformStyle: 'preserve-3d' }}
                        >

                            {/* FRONT */}
                            <div
                                className="absolute inset-0 backface-hidden glass rounded-4xl border border-white/10 p-6 sm:p-10 flex flex-col justify-between items-center text-center shadow-2xl group-hover:border-white/20 transition-all"
                            >
                                <div className="flex-none">
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-2 border border-blue-500/20">
                                        <span className="material-symbols-outlined text-sm">question_mark</span>
                                    </div>
                                    <span className="text-[10px] uppercase font-black text-blue-400 tracking-widest">Question</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center w-full min-h-0 py-6">
                                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight leading-relaxed text-foreground px-4 overflow-y-auto max-h-full no-scrollbar">
                                        {currentCard.front}
                                    </h2>
                                </div>
                                <div className="flex-none text-foreground/40 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 animate-pulse">
                                    <span className="material-symbols-outlined text-sm">touch_app</span>
                                    Tap to flip
                                </div>
                            </div>

                            {/* BACK */}
                            <div
                                className="absolute inset-0 backface-hidden glass rounded-4xl border border-purple-500/30 p-6 sm:p-10 flex flex-col justify-between items-center text-center shadow-2xl rotate-y-180 transition-all pb-32"
                            >
                                <div className="flex-none w-full relative flex flex-col items-center">
                                    <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-2 border border-purple-500/20">
                                        <span className="material-symbols-outlined text-sm">lightbulb</span>
                                    </div>
                                    <span className="text-[10px] uppercase font-black text-purple-400 tracking-widest block mb-1">Answer</span>

                                    {/* Explain Button - Header Position */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleExplain();
                                        }}
                                        className="absolute right-0 top-0 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all border border-indigo-500/20"
                                    >
                                        <span className="material-symbols-outlined text-sm">psychology</span> <span className="hidden sm:inline">Explain</span>
                                    </button>
                                </div>

                                <div className="flex-1 flex items-center justify-center w-full min-h-0 py-4">
                                    <p className="text-base sm:text-lg font-bold text-foreground/90 leading-relaxed px-4 overflow-y-auto max-h-full no-scrollbar">
                                        {currentCard.back}
                                    </p>
                                </div>

                                {/* SRS Difficulty Buttons - Footer Position */}
                                <div className="absolute bottom-6 left-0 right-0 px-4 sm:px-6 w-full" onClick={(e) => e.stopPropagation()}>
                                    <div className="text-[10px] text-foreground/40 text-center mb-3 font-black uppercase tracking-[0.2em]">
                                        How well did you know this?
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 w-full max-w-[400px] mx-auto">
                                        <button
                                            onClick={() => handleDifficulty('again')}
                                            className="px-1 py-3 rounded-2xl glass border border-red-500/20 text-red-500 hover:bg-red-500/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group"
                                        >
                                            <div className="text-[10px] font-black uppercase tracking-widest group-hover:scale-110 transition-transform">Again</div>
                                            <div className="text-[9px] opacity-60 font-bold hidden sm:block">&lt;1m</div>
                                        </button>
                                        <button
                                            onClick={() => handleDifficulty('hard')}
                                            className="px-1 py-3 rounded-2xl glass border border-orange-500/20 text-orange-500 hover:bg-orange-500/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group"
                                        >
                                            <div className="text-[10px] font-black uppercase tracking-widest group-hover:scale-110 transition-transform">Hard</div>
                                            <div className="text-[9px] opacity-60 font-bold hidden sm:block">&lt;10m</div>
                                        </button>
                                        <button
                                            onClick={() => handleDifficulty('good')}
                                            className="px-1 py-3 rounded-2xl glass border border-green-500/20 text-green-500 hover:bg-green-500/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group"
                                        >
                                            <div className="text-[10px] font-black uppercase tracking-widest group-hover:scale-110 transition-transform">Good</div>
                                            <div className="text-[9px] opacity-60 font-bold hidden sm:block">1d</div>
                                        </button>
                                        <button
                                            onClick={() => handleDifficulty('easy')}
                                            className="px-1 py-3 rounded-2xl glass border border-blue-500/20 text-blue-500 hover:bg-blue-500/10 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 group"
                                        >
                                            <div className="text-[10px] font-black uppercase tracking-widest group-hover:scale-110 transition-transform">Easy</div>
                                            <div className="text-[9px] opacity-60 font-bold hidden sm:block">4d</div>
                                        </button>
                                    </div>
                                </div>

                                {/* Removed absolute explain button since it's now in header */}
                            </div>

                        </div>
                    </div>
                </div>

                {/* Next Button - Right Side */}
                <button
                    onClick={nextCard}
                    disabled={currentIndex === totalCards - 1}
                    className="absolute right-4 sm:relative sm:right-0 h-12 w-12 sm:h-16 sm:w-16 rounded-2xl glass hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-black/20 transition-all text-foreground border border-white/5 flex items-center justify-center z-30 shrink-0"
                    aria-label="Next Card"
                >
                    <span className="material-symbols-outlined text-2xl">chevron_right</span>
                </button>
            </main>

            {/* Explain Chat Overlay */}
            {
                showExplain && (
                    <div className="absolute inset-x-0 bottom-0 bg-card border-t border-card-border p-6 rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom-full duration-300 z-50 max-h-[60vh] overflow-y-auto">
                        <div className="max-w-md mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                                    <span className="text-indigo-400">✨</span> AI Explanation
                                </h3>
                                <button onClick={() => setShowExplain(false)} className="p-2 hover:bg-surface/10 rounded-full text-foreground/50">✕</button>
                            </div>

                            <div className="space-y-4">
                                {/* User Bubble */}
                                <div className="flex justify-end">
                                    <div className="bg-surface/10 text-foreground rounded-lg rounded-tr-sm px-4 py-2 text-sm max-w-[80%]">
                                        Explain this concept simply.
                                    </div>
                                </div>

                                {/* AI Bubble */}
                                <div className="flex justify-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-lg text-white">
                                        AI
                                    </div>
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 text-foreground/90 rounded-lg rounded-tl-sm px-5 py-3 text-sm leading-relaxed max-w-[90%] shadow-sm">
                                        {loadingExplain ? (
                                            <div className="flex gap-1 items-center h-6">
                                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        ) : (
                                            <>
                                                <p>{explanation || "I couldn't generate an explanation right now. Try again!"}</p>
                                                <p className="mt-2 text-foreground/40 text-xs italic">
                                                    (Powered by Google Gemini)
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <style jsx global>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>

        </div >
    );
}
