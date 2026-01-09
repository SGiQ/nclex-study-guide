'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Document {
    id: number;
    contentPreview: string;
    source: string;
    chunkIndex: number;
    totalChunks: number;
    uploadedAt: string;
    createdAt: string;
}

export default function ViewDatabasePage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const [groupedBySource, setGroupedBySource] = useState<Record<string, Document[]>>({});

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const response = await fetch('/api/admin/view-database');
            const data = await response.json();

            if (data.success) {
                setDocuments(data.documents);
                setTotalCount(data.totalDocuments);

                // Group by source file
                const grouped = data.documents.reduce((acc: Record<string, Document[]>, doc: Document) => {
                    if (!acc[doc.source]) {
                        acc[doc.source] = [];
                    }
                    acc[doc.source].push(doc);
                    return acc;
                }, {});

                setGroupedBySource(grouped);
            }
        } catch (error) {
            console.error('Error loading documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading database...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/admin"
                        className="h-10 w-10 grid place-items-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
                    >
                        ←
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Database Contents</h1>
                        <p className="text-gray-400">View all {totalCount} chunks stored in the knowledge base</p>
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-white mb-4">Summary</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-gray-400 text-sm">Total Chunks</div>
                            <div className="text-2xl font-bold text-white">{totalCount}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm">Source Files</div>
                            <div className="text-2xl font-bold text-white">{Object.keys(groupedBySource).length}</div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm">Avg per File</div>
                            <div className="text-2xl font-bold text-white">
                                {Math.round(totalCount / Object.keys(groupedBySource).length)}
                            </div>
                        </div>
                        <div>
                            <div className="text-gray-400 text-sm">Status</div>
                            <div className="text-2xl font-bold text-green-400">✓ Active</div>
                        </div>
                    </div>
                </div>

                {/* Files Grouped by Source */}
                <div className="space-y-4">
                    {Object.entries(groupedBySource).map(([source, docs]) => (
                        <div key={source} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{source}</h3>
                                    <p className="text-sm text-gray-400">{docs.length} chunks</p>
                                </div>
                                <div className="text-sm text-gray-400">
                                    Uploaded: {formatDate(docs[0].uploadedAt)}
                                </div>
                            </div>

                            {/* Show first 3 chunks as preview */}
                            <div className="space-y-2">
                                {docs.slice(0, 3).map((doc) => (
                                    <div key={doc.id} className="bg-white/5 rounded-lg p-4 border border-white/5">
                                        <div className="flex items-start justify-between mb-2">
                                            <span className="text-xs text-purple-400 font-mono">
                                                Chunk {doc.chunkIndex + 1} of {doc.totalChunks}
                                            </span>
                                            <span className="text-xs text-gray-500">ID: {doc.id}</span>
                                        </div>
                                        <p className="text-sm text-gray-300 line-clamp-2">{doc.contentPreview}</p>
                                    </div>
                                ))}
                                {docs.length > 3 && (
                                    <div className="text-center text-sm text-gray-500 pt-2">
                                        + {docs.length - 3} more chunks from this file
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
