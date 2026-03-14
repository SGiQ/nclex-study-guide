'use client';

import React, { useState } from 'react';
import { useNotes } from '@/app/context/NotesContext';
import { useAuth } from '@/app/context/AuthContext';
import Link from 'next/link';

export default function NotesPage() {
    const { notes, addNote, isLoading } = useNotes();
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'create'>('list');

    // Form State
    const [newNoteContent, setNewNoteContent] = useState('');
    const [selectedLabel, setSelectedLabel] = useState('General');

    const labels = ["General", "Pharmacology", "Prioritization", "Labs", "Ethics"];

    const handleSave = async () => {
        if (!newNoteContent.trim()) return;
        await addNote(selectedLabel, newNoteContent);
        setNewNoteContent('');
        setView('list');
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-32 flex flex-col items-center">
            {/* Header */}
            <header className="w-full max-w-2xl px-6 pt-12 pb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Study Notes</h1>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-[0.2em] mt-1">Your Personal Nursing Knowledge Base</p>
                </div>
                <button 
                    onClick={() => setView(view === 'list' ? 'create' : 'list')}
                    className="h-12 px-6 rounded-[9px] glass border border-white/5 flex items-center justify-center text-primary font-bold uppercase text-[10px] tracking-widest hover:bg-primary/10 transition-colors"
                >
                    {view === 'list' ? '+ New Note' : 'Cancel'}
                </button>
            </header>

            <main className="w-full max-w-2xl px-6 space-y-6">
                {view === 'create' ? (
                    <div className="glass-card rounded-[9px] p-6 border border-white/5 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Label</label>
                            <div className="flex flex-wrap gap-2">
                                {labels.map(label => (
                                    <button
                                        key={label}
                                        onClick={() => setSelectedLabel(label)}
                                        className={`px-4 py-2 rounded-[9px] text-[10px] uppercase font-bold tracking-widest border transition-all ${selectedLabel === label
                                            ? 'bg-primary/20 border-primary text-primary'
                                            : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                                            }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-3">Content</label>
                            <textarea
                                value={newNoteContent}
                                onChange={(e) => setNewNoteContent(e.target.value)}
                                rows={12}
                                className="w-full bg-white/5 rounded-[9px] border border-white/5 p-4 text-slate-200 text-sm focus:border-primary outline-none resize-none transition-all placeholder:text-slate-700"
                                placeholder="Start typing your study notes here..."
                                autoFocus
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isLoading || !newNoteContent.trim()}
                            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-[9px] transition-all shadow-lg shadow-primary/20"
                        >
                            {isLoading ? 'Saving Knowledge...' : 'Store Note'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        {notes.length === 0 ? (
                            <div className="glass-card rounded-[9px] border border-white/5 p-20 text-center flex flex-col items-center justify-center opacity-40">
                                <span className="material-symbols-outlined text-6xl mb-4">description</span>
                                <p className="text-[10px] font-black uppercase tracking-widest">No saved notes yet</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest mt-2">Your library is waiting for knowledge</p>
                            </div>
                        ) : (
                            notes.map(note => (
                                <div key={note.id} className="glass-card rounded-[9px] p-6 border border-white/5 hover:border-white/10 transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-[6px] text-[9px] uppercase font-black tracking-widest">
                                            {note.label}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                            {new Date(note.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                                        {note.content}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-2">
                                        <button className="text-[10px] font-bold text-slate-500 hover:text-primary transition-colors uppercase tracking-widest">Edit</button>
                                        <button className="text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest">Delete</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
