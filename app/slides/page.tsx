import Link from 'next/link';
import fs from 'fs';
import path from 'path';

// Server Component Data Fetching
function getSlides() {
    const filePath = path.join(process.cwd(), 'app', 'data', 'slides.json');
    if (!fs.existsSync(filePath)) return [];
    try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileData);
    } catch (e) {
        return [];
    }
}

export default function SlidesLibraryPage() {
    const slides = getSlides();

    return (
        <div className="min-h-dvh bg-[#0A0A0F] text-white font-sans p-6 pb-24">
            {/* Header */}
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <Link href="/" className="text-sm font-medium text-white/50 hover:text-white mb-2 block">
                        ← Back Home
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        Slide Decks
                    </h1>
                    <p className="text-white/60 text-sm mt-1">
                        Review detailed notes and diagrams.
                    </p>
                </div>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {slides.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <div className="text-4xl mb-4">📂</div>
                        <h3 className="text-lg font-bold text-white/80">No Slide Decks Yet</h3>
                        <p className="text-white/50 text-sm mt-2">
                            Check back later or upload one in Admin.
                        </p>
                    </div>
                ) : (
                    slides.map((deck: any) => (
                        <Link
                            key={deck.id}
                            href={`/slides/${deck.id}`}
                            className="group relative bg-[#16161C] rounded-2xl p-5 border border-white/5 hover:border-blue-500/50 transition-all hover:-translate-y-1 active:scale-[0.99]"
                        >
                            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                ↗
                            </div>

                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-xl shadow-lg mb-4">
                                📊
                            </div>

                            <h3 className="text-lg font-bold leading-tight mb-1 group-hover:text-blue-400 transition-colors">
                                {deck.title}
                            </h3>
                            <p className="text-xs text-white/40 font-medium uppercase tracking-wider">
                                {deck.episodeId ? `Episode ${deck.episodeId}` : 'General Reference'}
                            </p>

                            <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
                                <span>PDF</span>
                                <span>•</span>
                                <span>{new Date(deck.uploadedAt).toLocaleDateString()}</span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
