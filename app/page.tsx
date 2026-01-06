'use client';

import Link from 'next/link';
import { useNotes } from '@/app/context/NotesContext';
import { useStreak } from '@/app/context/StreakContext';
import { useProgress } from '@/app/context/ProgressContext';
import episodes from '@/app/data/episodes.json';

export default function Page() {
  const { toggleNotes } = useNotes();
  const { currentStreak, hasCheckedInToday } = useStreak();
  const { quizResults } = useProgress();

  // Weakness Targeting Logic
  const weakEpisodeIds = Object.values(quizResults)
    .filter(r => (r.score / r.total) < 0.7)
    .map(r => r.episodeId);

  const suggestedReview = weakEpisodeIds.length > 0
    ? episodes.find(e => e.id === weakEpisodeIds[0]) // Just take the first one for now
    : null;

  const cards = [
    { title: "Audio Lessons", from: "#2563eb", to: "#1d4ed8" },
    { title: "Quizzes", from: "#475569", to: "#334155" },
    { title: "Flashcards", from: "#9333ea", to: "#7e22ce" },
    { title: "Mind Maps", from: "#0891b2", to: "#0e7490" }, // Cyan/Cyan-700
    { title: "Infographics", from: "#db2777", to: "#be185d" },
    { title: "Slide Decks", from: "#4f46e5", to: "#4338ca" },
  ];

  return (
    <div className="min-h-dvh bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-nav-border animate-in">
        <div className="mx-auto max-w-md px-4 pt-4 pb-3">
          <div className="flex items-center gap-3">
            <button
              aria-label="Back"
              className="grid h-10 w-10 place-items-center rounded-full bg-surface/10 hover:bg-surface/20 active:bg-surface/30 text-foreground"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold leading-none">
                Study Categories
              </h1>
            </div>
            {/* Streak Counter */}
            <div className="flex items-center gap-2">
              <Link href="/library" className="grid h-9 w-9 place-items-center rounded-full bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 active:scale-95 transition-all">
                🔖
              </Link>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                <span className={`text-sm ${hasCheckedInToday ? 'animate-bounce' : ''}`}>🔥</span>
                <span className="text-sm font-bold text-orange-500">{currentStreak}</span>
              </div>
            </div>
          </div>

          <div className="pt-3">
            <p className="text-sm font-medium text-foreground/70">Categories</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-md px-5 pb-40 pt-4 stagger-1">

        {/* Weakness Targeting Alert */}
        {suggestedReview && (
          <div className="mb-6 animate-slide-up">
            <div className="flex items-center justify-between mb-2 px-1">
              <h2 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <span>⚠️</span> Needs Review
              </h2>
              <span className="text-[10px] uppercase font-bold text-red-400/70 tracking-wider">Score &lt; 70%</span>
            </div>

            <Link
              href={`/audio`} // Ideally deep link to episode, but audio player is global. 
              // To auto-play, we might need a query param or just simple navigation for now.
              className="group block relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-900/40 to-black/40 border border-red-500/20 p-4 transition-all hover:border-red-500/40"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                  ▶
                </div>
                <div>
                  <div className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Recommended</div>
                  <h3 className="font-bold text-white leading-tight">{suggestedReview.title}</h3>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {cards.map((c) => {
            // Determine the link target based on the title
            let href = "#";
            if (c.title === "Audio Lessons") href = "/audio";
            else if (c.title === "Slide Decks") href = "/slides";
            else if (c.title === "Infographics") href = "/infographics";
            else if (c.title === "Mind Maps") href = "/mindmaps";
            else if (c.title === "Quizzes") href = "/quizzes";
            else if (c.title === "Flashcards") href = "/flashcards";

            // Determine Icon and CTA text
            let icon = "↗";
            let cta = "Tap to open";

            if (c.title === "Audio Lessons") { icon = "▶"; cta = "Listen Now"; }
            else if (c.title === "Slide Decks") { icon = "📄"; cta = "Review"; }
            else if (c.title === "Infographics") { icon = "🖼️"; cta = "Visuals"; }
            else if (c.title === "Mind Maps") { icon = "🧠"; cta = "Explore"; }
            else if (c.title === "Quizzes") { icon = "📝"; cta = "Start Quiz"; }
            else if (c.title === "Flashcards") { icon = "🗂️"; cta = "Practice"; }

            return (
              <Link
                key={c.title}
                href={href}
                className="animate-enter relative aspect-square w-full overflow-hidden rounded-3xl shadow-sm transition-transform duration-200 hover:-translate-y-1 active:translate-y-0 text-white block group backdrop-blur-md"
                style={{
                  background: `linear-gradient(to bottom right, ${c.from}CC, ${c.to}CC)`
                }}
              >
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/30 blur-2xl" />
                </div>

                <div className="relative flex h-full flex-col justify-between p-4">
                  <div className="text-left">
                    <div className="text-[11px] font-semibold text-white/80">
                      NCLEX
                    </div>
                    <div className="mt-1 text-lg font-bold leading-tight">
                      {c.title}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white/85">
                      {cta}
                    </span>
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-black/25 group-hover:bg-black/30 transition-colors">
                      {icon}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
