'use client';

import { useState } from 'react';
import initialQuizzes from '@/app/data/quizzes.json';
import Link from 'next/link';

interface Question {
    id: number;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    hint?: string;
}

interface Quiz {
    id: number;
    title: string;
    questions: Question[];
}

export default function AdminQuizPage() {
    const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes as unknown as Quiz[]);
    const [selectedQuizId, setSelectedQuizId] = useState<number>(initialQuizzes[0].id);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<string | null>(null);

    // Derived state for the active quiz
    const activeQuiz = quizzes.find(q => q.id === selectedQuizId) || quizzes[0];
    const [questions, setQuestions] = useState<Question[]>(activeQuiz.questions);

    // --- Handlers ---

    const handleQuizSelect = (id: number) => {
        setSelectedQuizId(id);
        const newQuiz = quizzes.find(q => q.id === id);
        if (newQuiz) {
            setQuestions(newQuiz.questions);
        }
    };

    const handleAddQuestion = () => {
        const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1;
        setQuestions([
            ...questions,
            {
                id: newId,
                text: "New Question Text...",
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: 0,
                explanation: "Rationale goes here..."
            }
        ]);
    };

    const handleDeleteQuestion = (indexToDelete: number) => {
        if (confirm("Are you sure you want to delete this question?")) {
            const updated = questions.filter((_, idx) => idx !== indexToDelete);
            setQuestions(updated);
        }
    };

    const updateQuestionField = (index: number, field: string, value: any) => {
        const updated = [...questions];
        updated[index] = { ...updated[index], [field]: value };
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const updated = [...questions];
        const newOptions = [...updated[qIndex].options];
        newOptions[oIndex] = value;
        updated[qIndex].options = newOptions;
        setQuestions(updated);
    };

    const saveQuiz = async () => {
        setIsSaving(true);
        setSaveStatus(null);
        try {
            const response = await fetch('/api/quizzes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quizId: selectedQuizId,
                    questions: questions
                }),
            });

            if (response.ok) {
                setSaveStatus('success');
                // Update local quizzes state essentially
                const updatedQuizzes = quizzes.map(q =>
                    q.id === selectedQuizId ? { ...q, questions: questions } : q
                );
                setQuizzes(updatedQuizzes);
            } else {
                setSaveStatus('error');
            }
        } catch (e) {
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveStatus(null), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-[#111] text-white font-sans flex flex-col">

            {/* Top Bar */}
            <header className="bg-[#1A1A20] border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/admin" className="text-white/50 hover:text-white">← Back</Link>
                    <h1 className="text-xl font-bold">Quiz Editor</h1>
                </div>
                <div className="flex items-center gap-4">
                    {saveStatus === 'success' && <span className="text-emerald-400 font-bold text-sm">✓ Saved!</span>}
                    {saveStatus === 'error' && <span className="text-red-400 font-bold text-sm">⚠ Error Saving</span>}

                    <button
                        onClick={saveQuiz}
                        disabled={isSaving}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save Quiz'}
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">

                {/* Sidebar - Quiz Selector */}
                <aside className="w-64 bg-[#16161C] border-r border-white/10 flex flex-col overflow-y-auto">
                    <div className="p-4">
                        <label className="text-xs uppercase font-bold text-white/40 mb-2 block">Select Quiz</label>
                        <div className="space-y-1">
                            {quizzes.map(q => (
                                <button
                                    key={q.id}
                                    onClick={() => handleQuizSelect(q.id)}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm truncate transition-colors ${selectedQuizId === q.id ? 'bg-purple-600 text-white' : 'text-white/60 hover:bg-white/5'
                                        }`}
                                >
                                    #{q.id} {q.title}
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Editor Area */}
                <main className="flex-1 overflow-y-auto p-8 bg-[#0A0A0F]">

                    <div className="max-w-3xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-bold mb-1">{activeQuiz.title}</h2>
                                <p className="text-white/50">{questions.length} Questions</p>
                            </div>
                            <button
                                onClick={handleAddQuestion}
                                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
                            >
                                <span>+ Add Question</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            {questions.map((q, qIdx) => (
                                <div key={qIdx} className="bg-[#1A1A20] rounded-xl border border-white/10 p-6 relative group">

                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDeleteQuestion(qIdx)}
                                        className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>

                                    <div className="mb-4">
                                        <label className="block text-xs uppercase font-bold text-white/40 mb-1">Question {qIdx + 1}</label>
                                        <textarea
                                            value={q.text}
                                            onChange={(e) => updateQuestionField(qIdx, 'text', e.target.value)}
                                            rows={2}
                                            className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-colors"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {q.options.map((opt, oIdx) => (
                                            <div key={oIdx} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name={`correct-${qIdx}`}
                                                    checked={q.correctAnswer === oIdx}
                                                    onChange={() => updateQuestionField(qIdx, 'correctAnswer', oIdx)}
                                                    className="accent-emerald-500 h-4 w-4"
                                                />
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                                                    className={`flex-1 bg-[#111] border rounded-lg px-3 py-2 text-sm focus:border-purple-500 outline-none
                                                  ${q.correctAnswer === oIdx ? 'border-emerald-500/50 text-emerald-100' : 'border-white/10 text-white/80'}
                                              `}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <label className="block text-xs uppercase font-bold text-white/40 mb-1">Explanation / Rationale</label>
                                        <textarea
                                            value={q.explanation}
                                            onChange={(e) => updateQuestionField(qIdx, 'explanation', e.target.value)}
                                            rows={2}
                                            className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-white/70 focus:border-purple-500 outline-none"
                                            placeholder="Explain why the correct answer is right..."
                                        />
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-xs uppercase font-bold text-white/40 mb-1">Hint (Optional)</label>
                                        <textarea
                                            value={q.hint || ''}
                                            onChange={(e) => updateQuestionField(qIdx, 'hint', e.target.value)}
                                            rows={1}
                                            className="w-full bg-[#111] border border-white/10 rounded-lg p-3 text-sm text-white/70 focus:border-purple-500 outline-none"
                                            placeholder="A subtle clue to help the student..."
                                        />
                                    </div>
                                </div>


                            ))}
                        </div>
                    </div>
                </main>
            </div >
        </div >
    );
}
