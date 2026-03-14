'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotes } from '@/app/context/NotesContext';
import { useTheme } from '@/app/context/ThemeContext';

export default function GlobalNavigation() {
    const pathname = usePathname();
    const { toggleNotes } = useNotes();
    const { theme, toggleTheme } = useTheme();

    if (pathname === '/landing' || pathname === '/exam') return null;

    const navItems = [
        { label: 'Home', path: '/dashboard', icon: 'home' },
        { label: 'Library', path: '/library', icon: 'library_books' },
        { label: 'Notes', path: '/notes', icon: 'description' },
        { label: 'Exam', path: '/quizzes', icon: 'quiz' },
        { label: 'Profile', path: '/profile', icon: 'person' },
    ];

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg glass rounded-2xl px-2 py-2 flex items-center justify-around z-[100] shadow-2xl transition-all duration-300 border border-white/10 backdrop-blur-xl">
            {navItems.map((item) => {
                const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
                return (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`flex flex-col items-center justify-center size-12 rounded-xl transition-all duration-300 ${isActive ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <span className={`material-symbols-outlined ${isActive ? 'fill-1' : ''}`} style={{ fontSize: '24px' }}>
                            {item.icon}
                        </span>
                    </Link>
                );
            })}

            <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="flex flex-col items-center justify-center size-12 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                title="Toggle Theme"
            >
                <span className="material-symbols-outlined text-2xl">
                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
            </button>
        </nav>
    );
}
