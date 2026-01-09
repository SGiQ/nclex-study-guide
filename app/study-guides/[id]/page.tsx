'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface ShortAnswerQuestion {
    question: string;
    answer: string;
}

interface EssayQuestion {
    question: string;
    guidance: string;
}

interface GlossaryTerm {
    term: string;
    definition: string;
}

interface StudyGuide {
    id: number;
    episode_id: number;
    title: string;
    short_answer_questions: ShortAnswerQuestion[];
    essay_questions: EssayQuestion[];
    glossary: GlossaryTerm[];
}

export default function StudyGuidePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [guide, setGuide] = useState<StudyGuide | null>(null);
    const [loading, setLoading] = useState(true);
    const [visibleAnswers, setVisibleAnswers] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch(`/api/study-guides/${id}`)
            .then(r => r.json())
            .then(data => {
                setGuide(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const toggleAnswer = (index: number) => {
        const newVisible = new Set(visibleAnswers);
        if (newVisible.has(index)) {
            newVisible.delete(index);
        } else {
            newVisible.add(index);
        }
        setVisibleAnswers(newVisible);
    };

    const filteredGlossary = guide?.glossary.filter(item =>
        item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white items-center justify-center">
                <div className="text-4xl mb-4">📝</div>
                <div className="text-gray-600 dark:text-white/60">Loading study guide...</div>
            </div>
        );
    }

    if (!guide) return notFound();

    return (
        <div className="min-h-dvh bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white font-sans pb-24">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-white/10 px-6 py-4">
                <Link href="/study-guides" className="text-sm font-medium text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white mb-2 block">
                    ← Back to Study Guides
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{guide.title}</h1>
                <p className="text-sm text-gray-600 dark:text-white/50 mt-1">Episode {guide.episode_id}</p>
            </header>

            <div className="max-w-4xl mx-auto p-6 space-y-8">
                {/* Short Answer Questions */}
                <section className="bg-white dark:bg-[#16161C] rounded-lg p-6 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span>📋</span> Short-Answer Quiz
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-white/60 mb-6">
                        Answer the following questions in two to three sentences.
                    </p>

                    <div className="space-y-4">
                        {guide.short_answer_questions.map((q, index) => (
                            <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                                    {index + 1}. {q.question}
                                </p>
                                <button
                                    onClick={() => toggleAnswer(index)}
                                    className="text-sm text-green-600 dark:text-green-400 hover:underline mb-2"
                                >
                                    {visibleAnswers.has(index) ? '▼ Hide Answer' : '▶ Show Answer'}
                                </button>
                                {visibleAnswers.has(index) && (
                                    <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{q.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Essay Questions */}
                <section className="bg-white dark:bg-[#16161C] rounded-lg p-6 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span>✍️</span> Essay Questions
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-white/60 mb-6">
                        Formulate comprehensive essay responses, synthesizing information from the source materials.
                    </p>

                    <div className="space-y-6">
                        {guide.essay_questions.map((q, index) => (
                            <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                                    {index + 1}. {q.question}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                    {q.guidance}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Glossary */}
                <section className="bg-white dark:bg-[#16161C] rounded-lg p-6 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-none">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span>📖</span> Glossary of Key Terms
                    </h2>

                    {/* Search */}
                    <input
                        type="text"
                        placeholder="Search terms..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 mb-4 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {filteredGlossary.map((item, index) => (
                            <div key={index} className="pb-3 border-b border-gray-200 dark:border-white/10 last:border-0">
                                <dt className="font-bold text-gray-900 dark:text-white mb-1">{item.term}</dt>
                                <dd className="text-sm text-gray-700 dark:text-gray-300">{item.definition}</dd>
                            </div>
                        ))}
                    </div>

                    {filteredGlossary.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No terms found matching "{searchTerm}"
                        </p>
                    )}
                </section>
            </div>
        </div>
    );
}
