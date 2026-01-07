import Link from 'next/link';
import fs from 'fs';
import path from 'path';

// Server Component Data Fetching
function getMindMaps() {
    const filePath = path.join(process.cwd(), 'app', 'data', 'mindmaps.json');
    if (!fs.existsSync(filePath)) return [];
    try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileData);
    } catch (e) {
        return [];
    }
}

export default function MindMapsLibraryPage() {
    const mindmaps = getMindMaps();

    return (
        <div className="min-h-dvh bg-[#0A0A0F] text-white font-sans p-6 pb-24">
            {/* Header */}
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <Link href="/dashboard" className="text-sm font-medium text-white/50 hover:text-white mb-2 block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
                        Mind Maps
                    </h1>
                    <p className="text-white/60 text-sm mt-1">
                        Visual concept maps for complex topics.
                    </p>
                </div>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mindmaps.length === 0 ? (
                    <div className="col-span-full text-center py-16 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <div className="text-6xl mb-4">🧠</div>
                        <h3 className="text-xl font-bold text-white/80 mb-2">No Mind Maps Yet</h3>
                        <p className="text-white/50 text-sm">
                            Mind maps will appear here once uploaded.
                        </p>
                    </div>
                ) : (
                    mindmaps.map((item: any) => (
                        <Link
                            key={item.id}
                            href={`/mindmaps/${item.id}`}
                            className="group relative aspect-[4/3] bg-[#16161C] rounded-2xl overflow-hidden border border-white/5 hover:border-purple-500/50 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-900/20 active:scale-[0.99] block"
                        >
                            {/* Image Thumbnail */}
                            <img
                                src={`/uploads/mindmaps/${item.fileName}`}
                                alt={item.title}
                                className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-500"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-5">
                                <h3 className="text-base font-bold leading-tight mb-2 text-white group-hover:text-purple-300 transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-white/50 font-medium uppercase tracking-wider">
                                    {item.episodeId ? `Episode ${item.episodeId}` : 'Concept Map'}
                                </p>
                            </div>

                            {/* Hover Icon */}
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-full p-2">
                                    <span className="text-xl">🔍</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
