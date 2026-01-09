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
            <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center flex-col gap-4">
                <h1 className="text-2xl font-bold">No Flashcards Found</h1>
                <p className="text-white/50">There are no flashcards for this episode yet.</p>
                <Link href="/admin/flashcards" className="text-blue-400 hover:underline">
                    Go to Admin to Import Cards
                </Link>
                <Link href="/" className="px-6 py-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
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
            <div className="px-6 py-4 flex items-center justify-between bg-nav/80 backdrop-blur-sm sticky top-0 z-50 border-b border-nav-border">
                <Link href="/" className="text-foreground/50 hover:text-foreground transition-colors text-sm font-medium">
                    ✕ Quit
                </Link>
                <div className="flex items-center gap-2">
                    <div className="text-xs font-bold text-foreground/30 uppercase tracking-widest">
                        {flashcardSet.title}
                    </div>
                    {getStatusBadge()}
                </div>
                <div className="w-8"></div> {/* Spacer for centering */}
            </div>

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
                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-surface/10 hover:bg-surface/20 disabled:opacity-20 disabled:hover:bg-surface/10 transition-colors text-foreground shadow-lg flex items-center justify-center text-xl sm:text-2xl z-10 shrink-0"
                    aria-label="Previous Card"
                >
                    ←
                </button>

                {/* Card Container */}
                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-4">
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
                                className="absolute inset-0 backface-hidden bg-card rounded-xl border border-card-border p-6 sm:p-10 flex flex-col justify-between items-center text-center shadow-2xl group-hover:border-card-border/70 transition-colors"
                            >
                                <div className="flex-none">
                                    <span className="text-xs uppercase font-bold text-blue-500 tracking-wider">Question</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center w-full min-h-0 py-4">
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-relaxed text-foreground px-2 overflow-y-auto max-h-full scrollbar-hide">
                                        {currentCard.front}
                                    </h2>
                                </div>
                                <div className="flex-none text-foreground/40 text-[10px] sm:text-xs font-bold tracking-widest animate-pulse">
                                    CLICK OR SPACE FOR ANSWER
                                </div>
                            </div>

                            {/* BACK */}
                            <div
                                className="absolute inset-0 backface-hidden bg-card rounded-xl border border-purple-500/30 p-6 sm:p-10 flex flex-col justify-between items-center text-center shadow-2xl rotate-y-180"
                            >
                                <div className="flex-none w-full relative">
                                    <span className="text-xs uppercase font-bold text-purple-500 tracking-wider block mb-1">Answer</span>

                                    {/* Explain Button - Header Position */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleExplain();
                                        }}
                                        className="absolute right-0 top-0 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 text-[10px] font-bold flex items-center gap-1 transition-colors border border-indigo-500/10"
                                    >
                                        <span>✨</span> <span className="hidden sm:inline">Explain</span>
                                    </button>
                                </div>

                                <div className="flex-1 flex items-center justify-center w-full min-h-0 py-4">
                                    <p className="text-lg sm:text-xl md:text-2xl font-medium text-foreground/90 leading-relaxed px-2 overflow-y-auto max-h-full scrollbar-hide">
                                        {currentCard.back}
                                    </p>
                                </div>

                                {/* SRS Difficulty Buttons - Footer Position */}
                                <div className="flex-none w-full px-2 sm:px-6" onClick={(e) => e.stopPropagation()}>
                                    <div className="text-[9px] text-foreground/40 text-center mb-3 font-bold tracking-widest">
                                        HOW WELL DID YOU KNOW THIS?
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 w-full max-w-md mx-auto">
                                        <button
                                            onClick={() => handleDifficulty('again')}
                                            className="px-1 py-3 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold transition-colors border border-red-500/20 flex flex-col items-center justify-center gap-1"
                                        >
                                            <div>Again</div>
                                            <div className="text-[9px] opacity-60 hidden sm:block">&lt;1m</div>
                                        </button>
                                        <button
                                            onClick={() => handleDifficulty('hard')}
                                            className="px-1 py-3 rounded-lg bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 text-xs font-bold transition-colors border border-orange-500/20 flex flex-col items-center justify-center gap-1"
                                        >
                                            <div>Hard</div>
                                            <div className="text-[9px] opacity-60 hidden sm:block">&lt;10m</div>
                                        </button>
                                        <button
                                            onClick={() => handleDifficulty('good')}
                                            className="px-1 py-3 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 text-xs font-bold transition-colors border border-green-500/20 flex flex-col items-center justify-center gap-1"
                                        >
                                            <div>Good</div>
                                            <div className="text-[9px] opacity-60 hidden sm:block">1d</div>
                                        </button>
                                        <button
                                            onClick={() => handleDifficulty('easy')}
                                            className="px-1 py-3 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 text-xs font-bold transition-colors border border-blue-500/20 flex flex-col items-center justify-center gap-1"
                                        >
                                            <div>Easy</div>
                                            <div className="text-[9px] opacity-60 hidden sm:block">4d</div>
                                        </button>
                                    </div>
                                    <div className="hidden sm:block text-[9px] text-foreground/30 text-center mt-2">
                                        Press 1-4 or click
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
                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-surface/10 hover:bg-surface/20 disabled:opacity-20 disabled:hover:bg-surface/10 transition-colors text-foreground shadow-lg flex items-center justify-center text-xl sm:text-2xl z-10 shrink-0"
                    aria-label="Next Card"
                >
                    →
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
