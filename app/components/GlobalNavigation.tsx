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
        { label: "Home", icon: "home", href: "/" },
        { label: "Library", icon: "menu_book", href: "/library" },
        { label: "Notes", icon: "edit_note", action: toggleNotes },
        { label: "Exam", icon: "timer", href: "/exam/setup" },
    ];

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md glass rounded-full px-2 py-2 flex items-center justify-between z-[100] shadow-2xl transition-all duration-300">
            {navItems.map((item) => {
                const isActive = item.href === pathname;

                if (item.action) {
                    return (
                        <button
                            key={item.label}
                            onClick={item.action}
                            className="flex flex-col items-center justify-center size-12 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all font-display"
                        >
                            <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                        </button>
                    );
                }

                return (
                    <Link
                        key={item.label}
                        href={item.href || '#'}
                        className={`flex flex-col items-center justify-center size-12 rounded-full transition-all font-display ${
                            isActive 
                                ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                                : 'text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                        <span className={`material-symbols-outlined text-2xl ${isActive ? 'fill-1' : ''}`}>
                            {item.icon}
                        </span>
                    </Link>
                );
            })}

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="flex flex-col items-center justify-center size-12 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all font-display"
                title="Toggle Theme"
            >
                <span className="material-symbols-outlined text-2xl">
                    {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                </span>
            </button>
        </nav>
    );
}
