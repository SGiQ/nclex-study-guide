'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UploadResult {
    fileName: string;
    charactersExtracted: number;
    chunksCreated: number;
    chunksStored: number;
    totalDocuments: number;
}

export default function UploadDocxPage() {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState('');
    const [result, setResult] = useState<UploadResult | null>(null);
    const [error, setError] = useState('');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setProgress('Uploading file...');
        setError('');
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            setProgress('Processing DOCX file...');
            const response = await fetch('/api/admin/upload-docx', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setResult({
                    fileName: data.fileName,
                    charactersExtracted: data.charactersExtracted,
                    chunksCreated: data.chunksCreated,
                    chunksStored: data.chunksStored,
                    totalDocuments: data.totalDocuments,
                });
                setProgress('');
            } else {
                setError(data.error || 'Upload failed');
                setProgress('');
            }
        } catch (err: any) {
            setError(err.message || 'Upload failed');
            setProgress('');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/admin"
                        className="h-10 w-10 grid place-items-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        ←
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Upload DOCX Files</h1>
                        <p className="text-gray-400">Upload NCLEX book content to populate the AI tutor knowledge base</p>
                    </div>
                </div>

                {/* Upload Area */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 mb-6">
                    <div className="text-center">
                        <div className="mb-6">
                            <div className="inline-flex h-20 w-20 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 items-center justify-center mb-4 shadow-2xl shadow-purple-500/50">
                                <span className="text-4xl">📄</span>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Upload DOCX File</h2>
                            <p className="text-gray-400">The system will automatically extract text, chunk it, and generate embeddings</p>
                        </div>

                        <label className="block">
                            <input
                                type="file"
                                accept=".docx"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                className="hidden"
                            />
                            <div className={`cursor-pointer px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/30 inline-block ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                {uploading ? 'Processing...' : 'Choose DOCX File'}
                            </div>
                        </label>

                        {progress && (
                            <div className="mt-4 text-purple-300 animate-pulse">
                                {progress}
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">❌</span>
                            <div>
                                <h3 className="text-lg font-bold text-red-400 mb-1">Upload Failed</h3>
                                <p className="text-red-300">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Result */}
                {result && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6 mb-6">
                        <div className="flex items-start gap-3 mb-4">
                            <span className="text-2xl">✅</span>
                            <div>
                                <h3 className="text-lg font-bold text-green-400 mb-1">Upload Successful!</h3>
                                <p className="text-green-300">File processed and added to knowledge base</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="bg-white/5 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">File Name</div>
                                <div className="text-white font-bold truncate">{result.fileName}</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Characters</div>
                                <div className="text-white font-bold">{result.charactersExtracted.toLocaleString()}</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Chunks Created</div>
                                <div className="text-white font-bold">{result.chunksCreated}</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Total Documents</div>
                                <div className="text-white font-bold">{result.totalDocuments}</div>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setResult(null)}
                                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                            >
                                Upload Another File
                            </button>
                            <Link
                                href="/dashboard"
                                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                            >
                                Test AI Tutor
                            </Link>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-white mb-4">📋 How It Works</h3>
                    <ol className="space-y-3 text-gray-300">
                        <li className="flex gap-3">
                            <span className="text-purple-400 font-bold">1.</span>
                            <span>Click "Choose DOCX File" and select your NCLEX book file</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-purple-400 font-bold">2.</span>
                            <span>The system extracts all text from the document</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-purple-400 font-bold">3.</span>
                            <span>Text is split into ~500-word chunks with 50-word overlap</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-purple-400 font-bold">4.</span>
                            <span>OpenAI generates embeddings for each chunk</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-purple-400 font-bold">5.</span>
                            <span>Chunks are stored in PostgreSQL for RAG retrieval</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="text-purple-400 font-bold">6.</span>
                            <span>AI tutor can now answer questions using your book content!</span>
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
