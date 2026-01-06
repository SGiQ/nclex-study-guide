'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Episode {
    id: number;
    title: string;
    audioUrl?: string;
}

export default function AdminPage() {
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [uploading, setUploading] = useState<number | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        fetchEpisodes();
    }, []);

    const fetchEpisodes = () => {
        fetch('/api/episodes')
            .then(res => res.json())
            .then(data => setEpisodes(data));
    };

    const handleUpload = async (episodeId: number, file: File) => {
        setUploading(episodeId);
        setMessage(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('episodeId', episodeId.toString());

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            setMessage({ text: `Episode ${episodeId} updated successfully!`, type: 'success' });
            fetchEpisodes(); // Refresh list to see new status
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Upload failed. Please try again.', type: 'error' });
        } finally {
            setUploading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Audio Admin Dashboard</h1>

                {message && (
                    <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                        {message.text}
                    </div>
                )}

                {/* New section for navigation links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <Link
                        href="/admin/quizzes"
                        className="group flex flex-col items-center justify-center p-8 bg-[#16161C] rounded-3xl border border-white/5 hover:border-slate-500/50 hover:bg-[#1A1A22] transition-all"
                    >
                        <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">📝</span>
                        <h3 className="text-lg font-bold text-white group-hover:text-slate-400">Quizzes</h3>
                        <p className="text-white/40 text-sm mt-2">Create & Edit</p>
                    </Link>

                    <Link
                        href="/admin/flashcards"
                        className="group flex flex-col items-center justify-center p-8 bg-[#16161C] rounded-3xl border border-white/5 hover:border-purple-500/50 hover:bg-[#1A1A22] transition-all"
                    >
                        <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">🗂️</span>
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400">Flashcards</h3>
                        <p className="text-white/40 text-sm mt-2">Create & Edit</p>
                    </Link>

                    <Link
                        href="/admin/slides"
                        className="group flex flex-col items-center justify-center p-8 bg-[#16161C] rounded-3xl border border-white/5 hover:border-emerald-500/50 hover:bg-[#1A1A22] transition-all"
                    >
                        <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">📊</span>
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400">Slide Decks</h3>
                        <p className="text-white/40 text-sm mt-2">Upload PDFs</p>
                    </Link>

                    <Link
                        href="/admin"
                        className="group flex flex-col items-center justify-center p-8 bg-[#16161C] rounded-3xl border border-white/5 hover:border-blue-500/50 hover:bg-[#1A1A22] transition-all"
                    >
                        <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎧</span>
                        <h3 className="text-lg font-bold text-white group-hover:text-blue-400">Audio Episodes</h3>
                        <p className="text-white/40 text-sm mt-2">Manage MP3s</p>
                    </Link>

                    <Link
                        href="/admin/infographics"
                        className="group flex flex-col items-center justify-center p-8 bg-[#16161C] rounded-3xl border border-white/5 hover:border-pink-500/50 hover:bg-[#1A1A22] transition-all"
                    >
                        <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">🖼️</span>
                        <h3 className="text-lg font-bold text-white group-hover:text-pink-400">Infographics</h3>
                        <p className="text-white/40 text-sm mt-2">Upload Charts</p>
                    </Link>

                    <Link
                        href="/admin/mindmaps"
                        className="group flex flex-col items-center justify-center p-8 bg-[#16161C] rounded-3xl border border-white/5 hover:border-purple-500/50 hover:bg-[#1A1A22] transition-all"
                    >
                        <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">🧠</span>
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-400">Mind Maps</h3>
                        <p className="text-white/40 text-sm mt-2">Upload PNGs</p>
                    </Link>
                </div>

                <h2 className="text-2xl font-bold mb-6">Manage Audio Episodes</h2>
                <div className="space-y-4">
                    {episodes.map((episode) => (
                        <div key={episode.id} className="bg-gray-800 p-4 rounded-xl flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-lg">{episode.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-xs px-2 py-0.5 rounded ${episode.audioUrl && !episode.audioUrl.startsWith('http') ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                        {episode.audioUrl && !episode.audioUrl.startsWith('http') ? '✅ Local Audio' : '⚠️ Missing / Remote'}
                                    </span>
                                    <span className="text-xs text-gray-500">ID: {episode.id}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <label className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${uploading === episode.id ? 'bg-gray-700 text-gray-400' : 'bg-blue-600 hover:bg-blue-500 text-white'}`}>
                                    {uploading === episode.id ? 'Uploading...' : 'Upload MP3'}
                                    <input
                                        type="file"
                                        accept="audio/*"
                                        className="hidden"
                                        disabled={uploading === episode.id}
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                handleUpload(episode.id, e.target.files[0]);
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
