'use client';

import { useState } from 'react';
import { useNotes } from '@/app/context/NotesContext';

export default function NotesOverlay() {
    const { isOpen, toggleNotes, notes, addNote, isLoading } = useNotes();
    const [view, setView] = useState<'list' | 'create'>('list');

    // Form State
    const [newNoteContent, setNewNoteContent] = useState('');
    const [selectedLabel, setSelectedLabel] = useState('General');

    const labels = ["General", "Pharmacology", "Prioritization", "Labs", "Ethics"];

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!newNoteContent.trim()) return;
        await addNote(selectedLabel, newNoteContent);
        setNewNoteContent('');
        setView('list');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity"
                onClick={toggleNotes}
            ></div>

            {/* Sheet */}
            <div className="w-full max-w-md bg-card border-t border-card-border rounded-t-3xl shadow-2xl pointer-events-auto h-[85vh] flex flex-col transition-transform duration-300 transform translate-y-0">

                {/* Header */}
                <div className="p-4 border-b border-card-border flex items-center justify-between">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-foreground">
                        <span className="text-emerald-400">📝</span> Notes
                    </h2>
                    <div className="flex items-center gap-2">
                        {view === 'list' ? (
                            <button
                                onClick={() => setView('create')}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold"
                            >
                                + New Note
                            </button>
                        ) : (
                            <button
                                onClick={() => setView('list')}
                                className="text-foreground/50 hover:text-foreground px-3 py-1 text-xs"
                            >
                                Cancel
                            </button>
                        )}
                        <button onClick={toggleNotes} className="p-2 hover:bg-surface/10 rounded-full text-foreground/50">✖</button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">

                    {view === 'create' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-foreground/40 mb-2">Label</label>
                                <div className="flex flex-wrap gap-2">
                                    {labels.map(label => (
                                        <button
                                            key={label}
                                            onClick={() => setSelectedLabel(label)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${selectedLabel === label
                                                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600'
                                                : 'bg-surface/5 border-card-border text-foreground/50 hover:border-card-border/70'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase text-foreground/40 mb-2">Note Content</label>
                                <textarea
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                    rows={10}
                                    className="w-full bg-surface/5 rounded-xl border border-card-border p-4 text-foreground text-base focus:border-emerald-500 outline-none resize-none"
                                    placeholder="Type your notes here..."
                                    autoFocus
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={isLoading || !newNoteContent.trim()}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors"
                            >
                                {isLoading ? 'Saving...' : 'Save Note'}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in slide-in-from-left-4">
                            {notes.length === 0 ? (
                                <div className="text-center py-12 text-foreground/30">
                                    <p className="text-4xl mb-2">🗒️</p>
                                    <p>No notes yet.</p>
                                    <p className="text-xs mt-1">Tap "+ New Note" to start.</p>
                                </div>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} className="bg-surface/5 rounded-xl p-4 border border-card-border hover:border-card-border/50 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="bg-surface/10 text-foreground/60 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                                                {note.label}
                                            </span>
                                            <span className="text-[10px] text-foreground/30">
                                                {new Date(note.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-foreground/90 text-sm whitespace-pre-wrap leading-relaxed">{note.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
