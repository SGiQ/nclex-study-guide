'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminFlashcardsPage() {
    const [episodeId, setEpisodeId] = useState(2);
    const [csvContent, setCsvContent] = useState('');
    const [preview, setPreview] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    // Simple CSV Parser: Assumes "Front, Back" or "Front|Back" or Tab separated
    const handlePreview = () => {
        if (!csvContent.trim()) return;

        const lines = csvContent.split('\n');
        const parsed = lines.map((line, idx) => {
            // Try comma first, then pipe, then tab
            let parts = line.split(',');
            if (parts.length < 2) parts = line.split('|');
            if (parts.length < 2) parts = line.split('\t');

            if (parts.length >= 2) {
                return {
                    id: idx,
                    front: parts[0].trim(),
                    back: parts.slice(1).join(',').trim() // Re-join rest in case answers have commas
                };
            }
            return null;
        }).filter(item => item !== null && item.front && item.back);

        setPreview(parsed);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            const response = await fetch('/api/flashcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    episodeId,
                    title: `Episode ${episodeId} Flashcards`,
                    cards: preview
                }),
            });

            if (response.ok) {
                setSaveStatus('success');
            } else {
                setSaveStatus('error');
            }
        } catch (e) {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    // --- File Upload Handler ---
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setCsvContent(text);
            // Auto-preview after upload
            setTimeout(() => handlePreview(), 100);
        };
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen bg-[#111] text-white font-sans p-8">

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="text-white/50 hover:text-white">← Back</Link>
                        <h1 className="text-3xl font-bold">Flashcard Importer</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Input Section */}
                    <div className="space-y-6">
                        <div className="bg-[#1A1A20] p-6 rounded-lg border border-white/10">
                            <label className="block text-sm font-bold text-white/60 mb-2">Target Episode ID</label>
                            <input
                                type="number"
                                value={episodeId}
                                onChange={(e) => setEpisodeId(parseInt(e.target.value))}
                                className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                            />
                        </div>

                        <div className="bg-[#1A1A20] p-6 rounded-lg border border-white/10">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-bold text-white/60">Paste CSV Content</label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".csv,.txt"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <button className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs font-bold transition-colors">
                                        📂 Upload File
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-white/40 mb-3">Format: Question, Answer (one per line)</p>
                            <textarea
                                value={csvContent}
                                onChange={(e) => setCsvContent(e.target.value)}
                                rows={10}
                                className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-sm font-mono text-white/80 focus:border-purple-500 outline-none"
                                placeholder={`What is HIPAA?, Health Insurance Portability Act\nDefine negligence, Failure to provide care...`}
                            />
                            <button
                                onClick={handlePreview}
                                className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors"
                            >
                                Preview Cards
                            </button>
                        </div>
                    </div>
                    {/* Preview Section */}
                    <div className={`bg-[#1A1A20] rounded-lg border border-white/10 flex flex-col ${preview.length === 0 ? 'items-center justify-center opacity-50' : ''}`}>

                        {preview.length === 0 ? (
                            <div className="text-center p-12">
                                <span className="text-4xl mb-4 block">🃏</span>
                                <p className="text-white/40">Preview will appear here</p>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                    <span className="font-bold">{preview.length} Cards Found</span>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold text-sm disabled:opacity-50"
                                    >
                                        {isSaving ? 'Saving...' : 'Save All Cards'}
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[600px]">
                                    {saveStatus === 'success' && (
                                        <div className="bg-emerald-500/20 text-emerald-300 p-3 rounded-lg text-center mb-4">
                                            Successfully Saved!
                                        </div>
                                    )}

                                    {preview.map((card, idx) => (
                                        <div key={idx} className="bg-[#111] p-4 rounded-lg border border-white/10 group hover:border-white/20">
                                            <div className="mb-2">
                                                <span className="text-[10px] uppercase font-bold text-blue-400">Front</span>
                                                <p className="text-sm font-medium">{card.front}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] uppercase font-bold text-purple-400">Back</span>
                                                <p className="text-sm text-white/60">{card.back}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
