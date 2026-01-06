import Link from 'next/link';
import { notFound } from 'next/navigation';
import fs from 'fs';
import path from 'path';
import { use } from 'react';

function getInfographicById(id: number) {
    const filePath = path.join(process.cwd(), 'app', 'data', 'infographics.json');
    if (!fs.existsSync(filePath)) return null;
    try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        const items = JSON.parse(fileData);
        return items.find((s: any) => s.id === id);
    } catch (e) {
        return null;
    }
}

export default function InfographicViewerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const item = getInfographicById(parseInt(id));

    if (!item) return notFound();

    return (
        <div className="flex flex-col h-dvh bg-[#0A0A0F] text-white overflow-hidden">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-4 border-b border-white/10 bg-[#16161C] flex-shrink-0 z-20">
                <Link href="/infographics" className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors">
                    <span>←</span> Library
                </Link>
                <div className="font-bold text-sm truncate max-w-[200px]">
                    {item.title}
                </div>
                <div className="w-16"></div> {/* Spacer */}
            </header>

            {/* Image Viewer */}
            <main className="flex-1 w-full relative overflow-auto bg-black flex items-center justify-center p-4">
                <img
                    src={`/uploads/infographics/${item.fileName}`}
                    alt={item.title}
                    className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
                />
            </main>
        </div>
    );
}
