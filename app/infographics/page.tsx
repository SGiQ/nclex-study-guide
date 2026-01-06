import Link from 'next/link';
import fs from 'fs';
import path from 'path';

// Server Component Data Fetching
function getInfographics() {
    const filePath = path.join(process.cwd(), 'app', 'data', 'infographics.json');
    if (!fs.existsSync(filePath)) return [];
    try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileData);
    } catch (e) {
        return [];
    }
}

export default function InfographicsLibraryPage() {
    const infographics = getInfographics();

    return (
        <div className="min-h-dvh bg-[#0A0A0F] text-white font-sans p-6 pb-24">
            {/* Header */}
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <Link href="/" className="text-sm font-medium text-white/50 hover:text-white mb-2 block">
                        ← Back Home
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-500 bg-clip-text text-transparent">
                        Infographics
                    </h1>
                    <p className="text-white/60 text-sm mt-1">
                        High-yield visual study aids.
                    </p>
                </div>
            </header>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {infographics.length === 0 ? (
                    <div className="col-span-full text-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                        <div className="text-4xl mb-4">🖼️</div>
                        <h3 className="text-lg font-bold text-white/80">No Infographics Yet</h3>
                        <p className="text-white/50 text-sm mt-2">
                            Upload charts and diagrams in Admin.
                        </p>
                    </div>
                ) : (
                    infographics.map((item: any) => (
                        <Link
                            key={item.id}
                            href={`/infographics/${item.id}`}
                            className="group relative aspect-[4/5] bg-[#16161C] rounded-2xl overflow-hidden border border-white/5 hover:border-pink-500/50 transition-all hover:-translate-y-1 active:scale-[0.99] block"
                        >
                            {/* Image Thumbnail */}
                            <img
                                src={`/uploads/infographics/${item.fileName}`}
                                alt={item.title}
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h3 className="text-sm font-bold leading-tight mb-1 text-white group-hover:text-pink-300 transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">
                                    {item.episodeId ? `Ep ${item.episodeId}` : 'Visual Aid'}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
