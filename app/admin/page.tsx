'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Episode {
    id: number;
    title: string;
    audioUrl?: string;
}

export default function AdminPage() {
    const router = useRouter();
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [uploading, setUploading] = useState<number | null>(null);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check authentication with server
        const verifyAuth = async () => {
            const token = localStorage.getItem('adminToken');

            if (!token) {
                router.push('/admin/login');
                return;
            }

            try {
                const response = await fetch('/api/admin/auth', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (data.authenticated) {
                    setIsAuthenticated(true);
                    fetchEpisodes();
                } else {
                    localStorage.removeItem('adminToken');
                    router.push('/admin/login');
                }
            } catch (error) {
                localStorage.removeItem('adminToken');
                router.push('/admin/login');
            }
        };

        verifyAuth();
    }, [router]);

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
            fetchEpisodes();
        } catch (error) {
            console.error(error);
            setMessage({ text: 'Upload failed. Please try again.', type: 'error' });
        } finally {
            setUploading(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black text-white">
            {/* Header */}
            <header className="bg-black/30 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                            <span className="text-xl">🔐</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">Admin Dashboard</h1>
                            <p className="text-xs text-white/60">NCLEX Study Guide</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="text-sm text-white/60 hover:text-white transition-colors"
                        >
                            View App →
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/30"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {message && (
                    <div className={`p-4 rounded-lg mb-6 border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                {/* Admin Tools Grid */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6">Content Management</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link
                            href="/admin/users"
                            className="group flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all"
                        >
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">👥</span>
                            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Users</h3>
                            <p className="text-white/40 text-sm mt-2">View & Manage Users</p>
                        </Link>
                        <Link
                            href="/admin/view-database"
                            className="group flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-green-500/50 hover:bg-white/10 transition-all"
                        >
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🗄️</span>
                            <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">View Database</h3>
                            <p className="text-white/40 text-sm mt-2">Browse Uploaded Content</p>
                        </Link>
                        <Link
                            href="/admin/upload-docx"
                            className="group flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-sm rounded-lg border-2 border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/20 transition-all shadow-lg shadow-purple-500/20"
                        >
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📄</span>
                            <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">Upload DOCX</h3>
                            <p className="text-white/40 text-sm mt-2">Add Book Content to AI Tutor</p>
                        </Link>
                        <Link
                            href="/admin/quizzes"
                            className="group flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-purple-500/50 hover:bg-white/10 transition-all"
                        >
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📝</span>
                            <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">Quizzes</h3>
                            <p className="text-white/40 text-sm mt-2">Create & Edit Questions</p>
                        </Link>

                        <Link
                            href="/admin/flashcards"
                            className="group flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-indigo-500/50 hover:bg-white/10 transition-all"
                        >
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🗂️</span>
                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">Flashcards</h3>
                            <p className="text-white/40 text-sm mt-2">Manage Study Cards</p>
                        </Link>

                        <Link
                            href="/admin/slides"
                            className="group flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all"
                        >
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">📊</span>
                            <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Slide Decks</h3>
                            <p className="text-white/40 text-sm mt-2">Upload PDF Presentations</p>
                        </Link>

                        <Link
                            href="/admin/infographics"
                            className="group flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-pink-500/50 hover:bg-white/10 transition-all"
                        >
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🖼️</span>
                            <h3 className="text-lg font-bold text-white group-hover:text-pink-400 transition-colors">Infographics</h3>
                            <p className="text-white/40 text-sm mt-2">Upload Visual Charts</p>
                        </Link>

                        <Link
                            href="/admin/mindmaps"
                            className="group flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all"
                        >
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🧠</span>
                            <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Mind Maps</h3>
                            <p className="text-white/40 text-sm mt-2">Upload Concept Maps</p>
                        </Link>

                        <div className="group flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all">
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎧</span>
                            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">Audio Episodes</h3>
                            <p className="text-white/40 text-sm mt-2">Manage Below ↓</p>
                        </div>
                    </div>
                </div>

                {/* Audio Episodes Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6">Audio Episodes Manager</h2>
                    <div className="space-y-3">
                        {episodes.map((episode) => (
                            <div key={episode.id} className="bg-white/5 backdrop-blur-sm border border-white/10 p-5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-all">
                                <div>
                                    <h3 className="font-semibold text-lg">{episode.title}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${episode.audioUrl && !episode.audioUrl.startsWith('http') ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'}`}>
                                            {episode.audioUrl && !episode.audioUrl.startsWith('http') ? '✅ Local Audio' : '⚠️ Missing / Remote'}
                                        </span>
                                        <span className="text-xs text-white/40">Episode {episode.id}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <label className={`cursor-pointer px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${uploading === episode.id ? 'bg-white/10 text-white/40 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30'}`}>
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
            </main>
        </div>
    );
}
