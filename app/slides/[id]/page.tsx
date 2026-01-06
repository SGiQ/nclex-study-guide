import Link from 'next/link';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { use } from 'react';

// Reusing helper since we are separating files, normally would be in a lib
function getSlideById(id: number) {
    const filePath = path.join(process.cwd(), 'app', 'data', 'slides.json');
    if (!fs.existsSync(filePath)) return null;
    try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        const slides = JSON.parse(fileData);
        return slides.find((s: any) => s.id === id);
    } catch (e) {
        return null;
    }
}

export default function SlideViewerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); // Next.js 16 Unwrap
    const deck = getSlideById(parseInt(id));

    if (!deck) return notFound();

    return (
        <div className="flex flex-col h-dvh bg-[#0A0A0F] text-white">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-[#16161C] flex-shrink-0 z-10">
                <Link href="/slides" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                    <span>←</span> Library
                </Link>
                <div className="font-bold text-sm truncate max-w-[200px]">
                    {deck.title}
                </div>
                <div className="w-16"></div> {/* Spacer */}
            </header>

            {/* PDF Viewer */}
            <main className="flex-1 w-full bg-[#2A2A35] relative">
                <iframe
                    src={`/uploads/slides/${deck.fileName}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-0"
                    title={deck.title}
                />
                {/* Fallback overlay if object/iframe fails (rare on modern browsers) */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                    <p className="text-white/50 animate-pulse">Loading Document...</p>
                </div>
            </main>
        </div>
    );
}
