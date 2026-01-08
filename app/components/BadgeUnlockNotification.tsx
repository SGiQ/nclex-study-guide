'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/app/context/AchievementContext';

interface BadgeUnlockNotificationProps {
    badge: Badge | null;
    onDismiss: () => void;
}

const RARITY_COLORS = {
    common: 'from-gray-500 to-gray-600',
    rare: 'from-blue-500 to-blue-600',
    epic: 'from-purple-500 to-purple-600',
    legendary: 'from-yellow-500 to-orange-500'
};

export default function BadgeUnlockNotification({ badge, onDismiss }: BadgeUnlockNotificationProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (badge) {
            // Trigger entrance animation
            setTimeout(() => setIsVisible(true), 100);

            // Auto-dismiss after 5 seconds
            const timer = setTimeout(() => {
                handleDismiss();
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [badge]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onDismiss();
        }, 300);
    };

    if (!badge) return null;

    const gradientColor = RARITY_COLORS[badge.rarity];

    return (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity duration-300 pointer-events-auto
                    ${isVisible && !isExiting ? 'opacity-100' : 'opacity-0'}
                `}
                onClick={handleDismiss}
            />

            {/* Notification Card */}
            <div
                className={`
                    relative pointer-events-auto max-w-sm w-full
                    bg-background rounded-3xl border-2 border-white/20 shadow-2xl
                    transition-all duration-500 transform
                    ${isVisible && !isExiting
                        ? 'scale-100 opacity-100 translate-y-0'
                        : 'scale-75 opacity-0 translate-y-8'
                    }
                `}
            >
                {/* Confetti Background */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10%',
                                animationDelay: `${Math.random() * 0.5}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="relative p-8 text-center">
                    {/* Header */}
                    <div className="mb-4">
                        <h2 className="text-2xl font-black text-foreground mb-1">
                            🎉 Achievement Unlocked!
                        </h2>
                        <p className={`text-xs font-bold uppercase tracking-wider bg-gradient-to-r ${gradientColor} bg-clip-text text-transparent`}>
                            {badge.rarity}
                        </p>
                    </div>

                    {/* Badge Icon */}
                    <div className="mb-4">
                        <div className={`
                            inline-block p-6 rounded-full 
                            bg-gradient-to-br ${gradientColor}
                            shadow-lg animate-bounce-slow
                        `}>
                            <span className="text-6xl">{badge.icon}</span>
                        </div>
                    </div>

                    {/* Badge Details */}
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                            {badge.name}
                        </h3>
                        <p className="text-sm text-foreground/70">
                            {badge.description}
                        </p>
                    </div>

                    {/* Dismiss Button */}
                    <button
                        onClick={handleDismiss}
                        className={`
                            px-6 py-3 rounded-xl font-bold text-white
                            bg-gradient-to-r ${gradientColor}
                            hover:shadow-lg hover:scale-105
                            active:scale-95 transition-all duration-200
                        `}
                    >
                        Awesome! 🎊
                    </button>
                </div>

                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${gradientColor} opacity-20 blur-2xl -z-10`} />
            </div>
        </div>
    );
}
