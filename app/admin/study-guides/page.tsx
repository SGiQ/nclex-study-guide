'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminUploadStudyGuidePage() {
    const router = useRouter();
    const [content, setContent] = useState('');
    const [episodeId, setEpisodeId] = useState('');
    const [title, setTitle] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<any>(null);
    const [error, setError] = useState('');

    const handlePreview = () => {
        if (!content || !episodeId || !title) {
            setError('Please fill in all fields');
            return;
        }

        // Count sections for preview
        const sections = content.split('--------------------------------------------------------------------------------');
        const shortAnswerMatches = [...(sections[0] || '').matchAll(/\d+\.\s+/g)];
        const essayMatches = [...(sections[2] || '').matchAll(/\d+\.\s+/g)];
        const glossaryLines = (sections[3] || '').split('\n').filter(line => line.includes('\t'));

        setPreview({
            shortAnswerCount: shortAnswerMatches.length,
            essayCount: essayMatches.length,
            glossaryCount: glossaryLines.length
        });
        setError('');
    };

    const handleUpload = async () => {
        setIsUploading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/upload-study-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content,
                    episodeId: parseInt(episodeId),
                    title
                })
            });

            const data = await res.json();

            if (res.ok) {
                alert(`✅ Study Guide Uploaded!\n\n${data.parsed.shortAnswerCount} short-answer questions\n${data.parsed.essayCount} essay questions\n${data.parsed.glossaryCount} glossary terms`);
                setContent('');
                setEpisodeId('');
                setTitle('');
                setPreview(null);
                router.refresh();
            } else {
                setError(data.error || 'Upload failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-dvh bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white font-sans p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="mb-8">
                    <Link href="/admin" className="text-sm font-medium text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white mb-2 block">
                        ← Back to Admin
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Study Guide</h1>
                    <p className="text-gray-600 dark:text-white/60 text-sm mt-1">
                        Paste NotebookLM study guide output below
                    </p>
                </header>

                {/* Form */}
                <div className="space-y-6">
                    {/* Episode & Title */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Episode Number
                            </label>
                            <input
                                type="number"
                                value={episodeId}
                                onChange={(e) => setEpisodeId(e.target.value)}
                                placeholder="e.g., 1"
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., Coordinated Care Study Guide"
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Study Guide Content
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste the entire NotebookLM output here (including all sections: Short-Answer Quiz, Answer Key, Essay Questions, and Glossary)"
                            rows={20}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Preview */}
                    {preview && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <h3 className="font-bold text-green-800 dark:text-green-400 mb-2">Preview</h3>
                            <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                <li>✅ {preview.shortAnswerCount} short-answer questions found</li>
                                <li>✅ {preview.essayCount} essay questions found</li>
                                <li>✅ {preview.glossaryCount} glossary terms found</li>
                            </ul>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handlePreview}
                            disabled={isUploading}
                            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                            Preview
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading || !preview}
                            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                        >
                            {isUploading ? 'Uploading...' : 'Upload Study Guide'}
                        </button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h3 className="font-bold text-blue-800 dark:text-blue-400 mb-2">📝 Instructions</h3>
                    <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                        <li>Copy the entire NotebookLM study guide output</li>
                        <li>Paste it into the text area above</li>
                        <li>Enter the episode number and title</li>
                        <li>Click "Preview" to check the parsing</li>
                        <li>Click "Upload Study Guide" to save to database</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
