'use client';

import Link from 'next/link';
import flashcards from '@/app/data/flashcards.json';

export default function FlashcardsListPage() {
    return (
        <div className="min-h-dvh bg-background text-foreground transition-colors duration-500 pb-[180px]">
            {/* Header */}
            <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/5 animate-in">
                <div className="mx-auto max-w-2xl px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="grid h-10 w-10 place-items-center rounded-2xl glass border border-white/5 hover:bg-white/10 active:scale-95 transition-all text-foreground"
                        >
                            <span className="material-symbols-outlined">chevron_left</span>
                        </Link>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tight">Flashcards</h1>
                            <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-0.5">Study Decks</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-6 py-8 pb-32 space-y-8 animate-in slide-in-from-bottom-5 fade-in duration-500">
                
                <section>
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400">All Decks</h2>
                    </div>

                    <div className="grid gap-4">
                        {flashcards.map((deck) => (
                            <Link
                                key={deck.episodeId}
                                href={`/flashcards/${deck.episodeId}`}
                                className="group relative overflow-hidden rounded-3xl glass hover:bg-white/5 transition-all duration-300 border border-white/10 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1 block p-6"
                            >
                                {/* Decorative Background */}
                                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br from-purple-500 to-indigo-600" />
                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-white/50 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-8xl">style</span>
                                </div>

                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 flex items-center justify-center shadow-lg text-purple-400 border border-purple-500/20">
                                            <span className="material-symbols-outlined text-2xl">folder_special</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl text-white/60 border border-white/10">
                                            {deck.cards.length} Cards
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-black uppercase tracking-tight mb-2 leading-tight text-foreground group-hover:text-purple-400 transition-colors pr-8">
                                        {deck.title}
                                    </h3>
                                    <p className="text-[10px] font-bold text-foreground/50 mb-6 flex-1 uppercase tracking-wider leading-relaxed">
                                        {deck.description}
                                    </p>

                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-purple-500 group-hover:text-purple-400 border-t border-white/5 pt-4">
                                        <span>Practice Deck</span>
                                        <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
}
