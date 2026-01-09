'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useNotes } from '@/app/context/NotesContext';
import { useTheme } from '@/app/context/ThemeContext';

export default function GlobalNavigation() {
    const pathname = usePathname();
    const { toggleNotes } = useNotes();
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { label: "Home", icon: "⌂", href: "/" },
        { label: "Notes", icon: "📝", action: toggleNotes },
        { label: "Library", icon: "▤", href: "/library" }, // Placeholder
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-nav-border bg-nav/90 backdrop-blur-md safe-area-pb transition-colors duration-300">
            <div className="mx-auto max-w-md px-2 py-2">
                <div className="grid grid-cols-4">
                    {navItems.map((item) => {
                        const isActive = item.href === pathname;

                        // Render Button if Action (Notes)
                        if (item.action) {
                            return (
                                <button
                                    key={item.label}
                                    onClick={item.action}
                                    className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-foreground/50 hover:bg-surface/10 hover:text-foreground transition-colors"
                                >
                                    <span className="text-xl leading-none">{item.icon}</span>
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </button>
                            );
                        }

                        // Render Link otherwise
                        return (
                            <Link
                                key={item.label}
                                href={item.href || '#'}
                                className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 transition-colors ${isActive ? 'text-foreground bg-surface/10' : 'text-foreground/50 hover:bg-surface/10 hover:text-foreground'
                                    }`}
                            >
                                <span className="text-xl leading-none">{item.icon}</span>
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-foreground/50 hover:bg-surface/10 hover:text-foreground transition-colors"
                    >
                        <span className="text-xl leading-none">
                            {theme === 'dark' ? '☀' : '☾'}
                        </span>
                        <span className="text-[10px] font-medium">Theme</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}
