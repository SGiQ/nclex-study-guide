'use client';

import { useState, useEffect, use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import flashcardsData from '@/app/data/flashcards.json';

export default function FlashcardRunnerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const episodeId = parseInt(id);
    const flashcardSet = flashcardsData.find((f) => f.episodeId === episodeId);

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

    const handleExplain = async () => {
        setShowExplain(true);
        if (explanation) return; // Already have it for this card? (Actually we should reset on next card)

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
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex]);

    // Reset state on card change
    useEffect(() => {
        setExplanation(null);
        setShowExplain(false);
        setIsFlipped(false);
    }, [currentIndex]);

    const nextCard = () => {
        if (currentIndex < totalCards - 1) {
            // setIsFlipped(false); // Handled by effect
            // setShowExplain(false); // Handled by effect
            setTimeout(() => setCurrentIndex(prev => prev + 1), 150);
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            // setIsFlipped(false);
            // setShowExplain(false);
            setTimeout(() => setCurrentIndex(prev => prev - 1), 150);
        }
    };

    return (
        <div className="min-h-dvh bg-background text-foreground flex flex-col font-sans overflow-hidden relative transition-colors duration-300">

            {/* Top Bar */}
            <div className="px-6 py-4 flex items-center justify-between bg-nav/80 backdrop-blur-sm sticky top-0 z-50 border-b border-nav-border">
                <Link href="/" className="text-foreground/50 hover:text-foreground transition-colors text-sm font-medium">
                    ✕ Quit
                </Link>
                <div className="text-xs font-bold text-foreground/30 uppercase tracking-widest">
                    {flashcardSet.title}
                </div>
                <div className="w-8"></div> {/* Spacer for centering */}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 relative perspective-1000">

                {/* 3D Flip Card Container */}
                <div
                    className="relative w-full max-w-md aspect-[3/4] sm:aspect-[4/3] cursor-pointer group"
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    <div
                        className={`w-full h-full duration-500 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}
                        style={{ transformStyle: 'preserve-3d' }}
                    >

                        {/* FRONT */}
                        <div
                            className="absolute inset-0 backface-hidden bg-card rounded-3xl border border-card-border p-8 flex flex-col items-center justify-center text-center shadow-2xl group-hover:border-card-border/70 transition-colors"
                        >
                            <span className="text-xs uppercase font-bold text-blue-500 tracking-wider mb-6">Question</span>
                            <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-foreground">
                                {currentCard.front}
                            </h2>
                            <div className="absolute bottom-8 text-foreground/40 text-xs font-bold tracking-widest animate-pulse">
                                CLICK OR SPACE FOR ANSWER
                            </div>
                        </div>

                        {/* BACK */}
                        <div
                            className="absolute inset-0 backface-hidden bg-card rounded-3xl border border-purple-500/30 p-8 flex flex-col items-center justify-center text-center shadow-2xl rotate-y-180"
                        >
                            <span className="text-xs uppercase font-bold text-purple-500 tracking-wider mb-6">Answer</span>
                            <p className="text-xl sm:text-2xl font-medium text-foreground/90 leading-relaxed">
                                {currentCard.back}
                            </p>

                            {/* Actions on Back */}
                            <div className="absolute bottom-8 flex gap-4" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Stop flip
                                        handleExplain();
                                    }}
                                    className="px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 text-sm font-bold flex items-center gap-2 transition-colors border border-indigo-500/10"
                                >
                                    <span className="text-lg">✨</span> Explain
                                </button>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="mt-10 flex items-center gap-6">
                    <button
                        onClick={prevCard}
                        disabled={currentIndex === 0}
                        className="p-4 rounded-full bg-surface/10 hover:bg-surface/20 disabled:opacity-20 disabled:hover:bg-surface/10 transition-colors text-foreground shadow-sm"
                        aria-label="Previous Card"
                    >
                        ←
                    </button>

                    <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
                            Card
                        </span>
                        <span className="text-xl font-bold tabular-nums text-foreground">
                            {currentIndex + 1} <span className="text-foreground/30">/</span> {totalCards}
                        </span>
                    </div>

                    <button
                        onClick={nextCard}
                        disabled={currentIndex === totalCards - 1}
                        className="p-4 rounded-full bg-surface/10 hover:bg-surface/20 disabled:opacity-20 disabled:hover:bg-surface/10 transition-colors text-foreground shadow-sm"
                        aria-label="Next Card"
                    >
                        →
                    </button>
                </div>

            </main>

            {/* Explain Chat Overlay */}
            {showExplain && (
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
                                <div className="bg-surface/10 text-foreground rounded-2xl rounded-tr-sm px-4 py-2 text-sm max-w-[80%]">
                                    Explain this concept simply.
                                </div>
                            </div>

                            {/* AI Bubble */}
                            <div className="flex justify-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold shadow-lg text-white">
                                    AI
                                </div>
                                <div className="bg-indigo-500/10 border border-indigo-500/20 text-foreground/90 rounded-2xl rounded-tl-sm px-5 py-3 text-sm leading-relaxed max-w-[90%] shadow-sm">
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
            )}

            <style jsx global>{`
                .perspective-1000 { perspective: 1000px; }
                .preserve-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
            `}</style>

        </div>
    );
}
