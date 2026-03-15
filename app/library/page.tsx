'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import episodesData from '@/app/data/episodes.json';
import quizzesData from '@/app/data/quizzes.json';
import flashcardsData from '@/app/data/flashcards.json';
import { usePlayer } from '@/app/context/PlayerContext';
import { useLibrary } from '@/app/context/LibraryContext';
import { useProgress } from '@/app/context/ProgressContext';

export default function LibraryPage() {
    const router = useRouter();
    const { loadEpisode } = usePlayer();
    const { isSaved, saveItem, removeItem } = useLibrary();
    const { audioProgress } = useProgress();

    // Calculate progression stats
    const totalEpisodes = episodesData.length;
    let completedAudioCount = 0;
    
    // For now we'll mock the completion logic of these missing features
    // based on user audio progress to show the UI
    const audioProgressEntries = Object.entries(audioProgress);
    audioProgressEntries.forEach(([_, p]) => {
        if (p.completed) completedAudioCount++;
    });
    
    const audioPerc = totalEpisodes > 0 ? Math.round((completedAudioCount / totalEpisodes) * 100) : 0;
    
    // Quick mocked stats for visual parity with template
    const stats = {
        audio: { completed: completedAudioCount, total: totalEpisodes, perc: audioPerc },
        maps: { completed: 18, total: 24, perc: 78 },
        info: { completed: 2, total: 18, perc: 12 },
        slides: { completed: 36, total: 40, perc: 92 }
    };

    // Find the most recent episode to continue
    let recentAudio = null;
    let recentKey = '';
    
    if (audioProgressEntries.length > 0) {
        // Sort by completedAt descending
        const sorted = [...audioProgressEntries].sort((a, b) => {
            const dateA = a[1].completedAt ? new Date(a[1].completedAt).getTime() : 0;
            const dateB = b[1].completedAt ? new Date(b[1].completedAt).getTime() : 0;
            return dateB - dateA;
        });
        
        // Find the actual episode data for the most recent progress
        for (const [epIdStr, prog] of sorted) {
            const epId = parseInt(epIdStr, 10);
            const ep = episodesData.find(e => e.id === epId);
            if (ep) {
                recentAudio = ep;
                recentKey = epIdStr;
                break;
            }
        }
    }

    if (!recentAudio && episodesData.length > 0) {
        recentAudio = episodesData[0];
    }

    const handlePlayEpisode = (episode: any) => {
        loadEpisode({
            id: episode.id,
            title: episode.title,
            description: episode.description,
            audioUrl: `/uploads/episode-${episode.id}.mp3`,
            duration: episode.duration || 0,
            order: episode.id
        });
        router.push('/audio');
    };

    const toggleSaveEpisode = (e: React.MouseEvent, episode: any) => {
        e.stopPropagation();
        if (isSaved(episode.id, 'episode')) {
            removeItem(episode.id, 'episode');
        } else {
            saveItem({
                id: episode.id,
                type: 'episode',
                title: episode.title,
                description: episode.description
            });
        }
    };

    return (
        <div className="min-h-dvh bg-background text-foreground transition-colors duration-500 pb-[100px]">
            {/* Sticky Glass Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5 animate-in">
                <div className="flex items-center justify-between max-w-2xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/20 p-2 rounded-2xl border border-primary/20">
                            <span className="material-symbols-outlined text-primary text-2xl">medical_services</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tight text-slate-100">EliteNCLEX</h1>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-black mt-0.5">Study Library Hub</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="text-slate-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="w-10 h-10 rounded-full border-2 border-primary/30 p-0.5 overflow-hidden">
                            <img alt="User Profile" className="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxjv_WPstSnW5oz2WyESp9d1QwBEvirzyj9dg4Lon-rvh8SHbduoXlKaXj1vn0ullz1mQ3uMCo_nXT_tpP51-poQ5FmsVyxpCmhcaTJo_F0SGIQDrJSO3r-pmo1wY0A8juJB3HzM3QcdHm899ZZ9LJvXnSEAYol5dFwTc65tpKB6WgChvidHJKerW4zvGb2iZAQlNWE_w5eHycChDUonq7TBXeV3nzEP8-sUeMcj1TARKqCkjZtGSUXnJaHFF6GbhaxQcb9SkyPxc"/>
                        </div>
                    </div>
                </div>

                {/* Search Bar Integrated in Header */}
                <div className="mt-4 max-w-2xl mx-auto px-6 pb-4 cursor-not-allowed opacity-60">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="material-symbols-outlined text-slate-400 group-focus-within:text-primary transition-colors">search</span>
                        </div>
                        <input disabled className="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-slate-100 placeholder-slate-500 transition-all outline-none font-bold text-sm tracking-wide" placeholder="Search high-yield materials, labs, pharmacology..." type="text"/>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                            <span className="material-symbols-outlined text-slate-500 text-sm cursor-pointer">tune</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-8 animate-in slide-in-from-bottom-5 fade-in duration-500">
                {/* Tabs Navigation */}
                <div className="flex border-b border-white/5 mb-8 overflow-x-auto no-scrollbar pb-2">
                    <a className="px-6 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-primary text-primary whitespace-nowrap" href="#">Core Library</a>
                    <a className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-200 border-b-2 border-transparent whitespace-nowrap transition-colors" href="/flashcards">Flashcards</a>
                    <a className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-200 border-b-2 border-transparent whitespace-nowrap transition-colors" href="/">Practice Tests</a>
                </div>

                {/* Section Title */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-100">Study Categories</h2>
                    <a className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline" href="/">View Progress</a>
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Audio Lessons Card */}
                    <div 
                        onClick={() => router.push('/audio')}
                        className="bg-gradient-to-br from-[#257bf4]/20 to-[#257bf4]/5 border border-[#257bf4]/20 rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:scale-[1.01] hover:border-[#257bf4]/40 transition-all"
                    >
                        <div className="flex justify-between items-start mb-10">
                            <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">headphones</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">{stats.audio.total} Lessons</p>
                                <p className="text-primary font-black text-xs uppercase tracking-wider">{stats.audio.perc}% Completed</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Audio Lessons</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-6">Master pharmacology & labs on the go with expert-led audio guides.</p>
                            <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden border border-white/5">
                                <div className="bg-primary h-full rounded-full w-full origin-left transition-transform duration-1000" style={{ transform: `scaleX(${stats.audio.perc / 100})` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Mind Maps Card */}
                    <div 
                        onClick={() => router.push('/mindmaps')}
                        className="bg-gradient-to-br from-[#8b5cf6]/20 to-[#8b5cf6]/5 border border-[#8b5cf6]/20 rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:scale-[1.01] hover:border-[#8b5cf6]/40 transition-all"
                    >
                        <div className="flex justify-between items-start mb-10">
                            <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/20">
                                <span className="material-symbols-outlined text-purple-400 text-3xl group-hover:scale-110 transition-transform">account_tree</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">{stats.maps.total} Maps</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Mind Maps</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-6">Visualize complex disease processes and systemic interventions.</p>
                        </div>
                    </div>

                    {/* Infographics Card */}
                    <div 
                        onClick={() => router.push('/infographics')}
                        className="bg-gradient-to-br from-[#ec4899]/20 to-[#ec4899]/5 border border-[#ec4899]/20 rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:scale-[1.01] hover:border-[#ec4899]/40 transition-all"
                    >
                        <div className="flex justify-between items-start mb-10">
                            <div className="p-3 bg-pink-500/20 rounded-2xl border border-pink-500/20">
                                <span className="material-symbols-outlined text-pink-400 text-3xl group-hover:scale-110 transition-transform">monitoring</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">{stats.info.total} Sheets</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Infographics</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-6">High-yield cheat sheets for vital signs, lab values, and EKG patterns.</p>
                        </div>
                    </div>

                    {/* Slide Decks Card */}
                    <div 
                        onClick={() => router.push('/slides')}
                        className="bg-gradient-to-br from-[#10b981]/20 to-[#10b981]/5 border border-[#10b981]/20 rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:scale-[1.01] hover:border-[#10b981]/40 transition-all"
                    >
                        <div className="flex justify-between items-start mb-10">
                            <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/20 max-w-[50px] overflow-hidden flex items-center justify-center">
                                <span className="material-symbols-outlined text-emerald-400 text-3xl group-hover:scale-110 transition-transform">drive_presentation</span>
                            </div>
                            <div className="text-right">
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">{stats.slides.total} Decks</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Slide Decks</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-6">Comprehensive lecture slides covering all NCLEX test plan areas.</p>
                        </div>
                    </div>
                </div>

                {/* Episodes List Section */}
                <div className="mt-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black uppercase tracking-tight text-slate-100">Daily Lessons</h2>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{episodesData.length} Total</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {episodesData.map((ep) => {
                            const epProgress = audioProgress[ep.id];
                            const isEpCompleted = epProgress?.completed;
                            
                            return (
                                <Link 
                                    key={ep.id}
                                    href={`/library/episodes/${ep.id}`}
                                    className="glass hover:bg-white/10 border border-white/5 p-5 rounded-3xl flex items-center justify-between group transition-all"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                                            isEpCompleted 
                                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                            : 'bg-primary/10 border-primary/20 text-primary group-hover:bg-primary/20'
                                        }`}>
                                            <span className="text-[10px] font-black">{ep.id}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-black text-sm uppercase tracking-tight text-slate-100 group-hover:text-primary transition-colors">
                                                {ep.title}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                                    {ep.category} • {Math.floor(ep.duration / 60)}m
                                                </p>
                                                {isEpCompleted && (
                                                    <span className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-tighter">
                                                        <span className="material-symbols-outlined text-[10px] fill-1">check_circle</span>
                                                        Done
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-slate-500 group-hover:translate-x-1 transition-all">
                                        <span className="material-symbols-outlined text-xl">chevron_right</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-16">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 font-primary">Continue Studying</h2>
                    <div className="space-y-4">
                        
                        {recentAudio && (
                            <div 
                                onClick={() => handlePlayEpisode(recentAudio)}
                                className="glass hover:bg-white/10 cursor-pointer border border-white/5 p-4 rounded-3xl flex items-center justify-between group transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/20 text-primary border border-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined">play_arrow</span>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm uppercase tracking-tight text-slate-100 line-clamp-1">{recentAudio.title}</h4>
                                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">Quick Resume • Ep {recentAudio.id}</p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-slate-500 group-hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-xl">fast_forward</span>
                                </div>
                            </div>
                        )}

                        {/* Recent Flashcard Deck */}
                        <div 
                            onClick={() => router.push('/flashcards')}
                            className="glass hover:bg-white/10 cursor-pointer border border-white/5 p-4 rounded-3xl flex items-center justify-between group transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-pink-500/20 text-pink-500 border border-pink-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">style</span>
                                </div>
                                <div>
                                    <h4 className="font-black text-sm uppercase tracking-tight text-slate-100">Daily Flashcards</h4>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">Spaced Repetition Review</p>
                                </div>
                            </div>
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-slate-500 group-hover:text-pink-500 transition-colors">
                                <span className="material-symbols-outlined text-xl">chevron_right</span>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
