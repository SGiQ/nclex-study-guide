'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminMindMapsPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [episodeId, setEpisodeId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            // Create preview
            const url = URL.createObjectURL(selectedFile);
            setPreviewUrl(url);

            // Auto-populate title if empty
            if (!title) {
                const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
                setTitle(nameWithoutExt);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Strict validation
        if (!file) {
            alert('Please select an image file');
            return;
        }
        if (!title || title.trim() === '') {
            alert('Please enter a title');
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title.trim());
            formData.append('episodeId', episodeId || '');

            const res = await fetch('/api/mindmaps', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                alert('Mind Map Uploaded Successfully!');
                setTitle('');
                setEpisodeId('');
                setFile(null);
                setPreviewUrl(null);
                router.refresh();
            } else {
                alert(`Failed to upload: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading file. Please try again.');
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
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
                        Upload Mind Map
                    </h1>
                </div>

                <div className="bg-[#16161C] p-8 rounded-lg border border-white/10 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Title Input */}
                        <div>
                            <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wider">
                                Mind Map Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors"
                                placeholder="e.g. Heart Failure Diagram"
                                required
                            />
                        </div>

                        {/* Episode ID (Optional) */}
                        <div>
                            <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wider">
                                Episode ID (Optional)
                            </label>
                            <input
                                type="number"
                                value={episodeId}
                                onChange={(e) => setEpisodeId(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-colors"
                                placeholder="e.g. 3"
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-bold text-white/60 mb-2 uppercase tracking-wider">
                                PNG / Image File
                            </label>
                            <div className="relative group cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center group-hover:border-purple-500/50 group-hover:bg-purple-500/5 transition-all overflow-hidden relative">
                                    {previewUrl ? (
                                        <div className="relative z-20">
                                            <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-lg mb-2" />
                                            <div className="text-purple-400 font-bold text-sm">
                                                Click to change
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-white/40">
                                            <span className="block text-2xl mb-2">🧠</span>
                                            <span className="font-medium">Click to upload PNG</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isUploading || !file}
                            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all shadow-lg shadow-purple-900/20"
                        >
                            {isUploading ? 'Uploading...' : 'Save Mind Map'}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}
