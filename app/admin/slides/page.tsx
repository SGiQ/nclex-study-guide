'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminSlidesPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [episodeId, setEpisodeId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Auto-populate title if empty
            if (!title) {
                const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
                setTitle(nameWithoutExt);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('episodeId', episodeId);

        try {
            const res = await fetch('/api/slides', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                alert('Slide Deck Uploaded Successfully!');
                setTitle('');
                setEpisodeId('');
                setFile(null);
                router.refresh();
            } else {
                alert('Failed to upload.');
            }
        } catch (error) {
            console.error(error);
            alert('Error uploading file.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white font-sans p-8">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin" className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                        ←
                    </Link>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                        Upload Slide Deck
                    </h1>
                </div>

                <div className="bg-[#16161C] p-8 rounded-lg border border-white/10 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Title Input */}
                        <div>
                            <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wider">
                                Deck Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                                placeholder="e.g. Respiratory System Overview"
                                required
                            />
                        </div>

                        {/* Episode ID (Optional for now) */}
                        <div>
                            <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wider">
                                Episode ID (Optional)
                            </label>
                            <input
                                type="number"
                                value={episodeId}
                                onChange={(e) => setEpisodeId(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none transition-colors"
                                placeholder="e.g. 2"
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wider">
                                PDF File
                            </label>
                            <div className="relative group cursor-pointer">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center group-hover:border-emerald-500/50 group-hover:bg-emerald-500/5 transition-all">
                                    {file ? (
                                        <div className="text-emerald-400 font-bold flex items-center justify-center gap-2">
                                            📄 {file.name}
                                        </div>
                                    ) : (
                                        <div className="text-white/40">
                                            <span className="block text-2xl mb-2">📂</span>
                                            <span className="font-medium">Click to upload PDF</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isUploading || !file}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-emerald-900/20"
                        >
                            {isUploading ? 'Uploading...' : 'Save Slide Deck'}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}
