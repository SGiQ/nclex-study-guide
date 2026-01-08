'use client';

import Link from 'next/link';
import flashcards from '@/app/data/flashcards.json';

export default function FlashcardsListPage() {
    return (
        <div className="min-h-dvh bg-background text-foreground transition-colors duration-300">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-nav-border animate-in">
                <div className="mx-auto max-w-2xl px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/"
                            className="grid h-10 w-10 place-items-center rounded-full bg-surface/10 hover:bg-surface/20 active:bg-surface/30 text-foreground"
                        >
                            ←
                        </Link>
                        <h1 className="text-xl font-semibold leading-none">Flashcards</h1>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-6 py-8 pb-[180px]">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2">Study Decks</h2>
                    <p className="text-foreground/60">Master key concepts with spaced repetition.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    {flashcards.map((deck) => (
                        <Link
                            key={deck.episodeId}
                            href={`/flashcards/${deck.episodeId}`}
                            className="group relative overflow-hidden rounded-2xl bg-card hover:bg-surface/5 transition-all duration-300 border border-card-border hover:border-border hover:shadow-2xl hover:-translate-y-1 block"
                        >
                            {/* Decorative Background */}
                            <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br from-purple-500 to-indigo-600" />

                            <div className="relative p-6 h-full flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg text-white">
                                        <span className="text-lg font-bold">🗂️</span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-surface/10 px-2 py-1 rounded-md text-foreground/60">
                                        {deck.cards.length} Cards
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold mb-2 leading-tight text-foreground group-hover:text-purple-400 transition-colors">
                                    {deck.title}
                                </h3>
                                <p className="text-sm text-foreground/50 mb-6 flex-1">
                                    {deck.description}
                                </p>

                                <div className="flex items-center gap-2 text-sm font-semibold text-purple-500 group-hover:text-purple-400">
                                    <span>Practice Deck</span>
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}
