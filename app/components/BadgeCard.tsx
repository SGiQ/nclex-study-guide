'use client';

import { Badge } from '@/app/context/AchievementContext';

interface BadgeCardProps {
    badge: Badge;
    size?: 'small' | 'medium' | 'large';
    showDescription?: boolean;
}

const RARITY_STYLES = {
    common: {
        bg: 'from-gray-500/20 to-gray-600/20',
        border: 'border-gray-500/30',
        glow: 'shadow-gray-500/20',
        text: 'text-gray-400',
        label: 'Common'
    },
    rare: {
        bg: 'from-blue-500/20 to-blue-600/20',
        border: 'border-blue-500/30',
        glow: 'shadow-blue-500/20',
        text: 'text-blue-400',
        label: 'Rare'
    },
    epic: {
        bg: 'from-purple-500/20 to-purple-600/20',
        border: 'border-purple-500/30',
        glow: 'shadow-purple-500/20',
        text: 'text-purple-400',
        label: 'Epic'
    },
    legendary: {
        bg: 'from-yellow-500/20 to-orange-500/20',
        border: 'border-yellow-500/30',
        glow: 'shadow-yellow-500/20',
        text: 'text-yellow-400',
        label: 'Legendary'
    }
};

const SIZE_STYLES = {
    small: {
        container: 'p-3',
        icon: 'text-3xl',
        name: 'text-sm',
        description: 'text-xs',
        rarity: 'text-[9px]'
    },
    medium: {
        container: 'p-4',
        icon: 'text-4xl',
        name: 'text-base',
        description: 'text-sm',
        rarity: 'text-[10px]'
    },
    large: {
        container: 'p-6',
        icon: 'text-6xl',
        name: 'text-xl',
        description: 'text-base',
        rarity: 'text-xs'
    }
};

export default function BadgeCard({ badge, size = 'medium', showDescription = true }: BadgeCardProps) {
    const rarityStyle = RARITY_STYLES[badge.rarity];
    const sizeStyle = SIZE_STYLES[size];
    const isLocked = !badge.unlocked;

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div
            className={`
                relative rounded-lg border transition-all duration-300
                ${sizeStyle.container}
                ${isLocked
                    ? 'bg-surface/5 border-surface/10 opacity-50'
                    : `bg-gradient-to-br ${rarityStyle.bg} border ${rarityStyle.border}`
                }
                ${!isLocked && `hover:shadow-lg ${rarityStyle.glow} hover:scale-105`}
            `}
        >
            {/* Rarity Badge */}
            <div className="absolute top-2 right-2">
                <span className={`
                    ${sizeStyle.rarity} font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
                    ${isLocked ? 'bg-surface/20 text-foreground/40' : `${rarityStyle.text} bg-background/30`}
                `}>
                    {rarityStyle.label}
                </span>
            </div>

            {/* Lock Overlay */}
            {isLocked && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl opacity-30">
                    🔒
                </div>
            )}

            {/* Badge Icon */}
            <div className={`text-center mb-2 ${isLocked ? 'grayscale blur-sm' : ''}`}>
                <div className={sizeStyle.icon}>
                    {badge.icon}
                </div>
            </div>

            {/* Badge Name */}
            <div className="text-center">
                <h3 className={`font-bold ${sizeStyle.name} ${isLocked ? 'text-foreground/40' : 'text-foreground'}`}>
                    {badge.name}
                </h3>

                {/* Description */}
                {showDescription && (
                    <p className={`${sizeStyle.description} mt-1 ${isLocked ? 'text-foreground/30' : 'text-foreground/70'}`}>
                        {badge.description}
                    </p>
                )}

                {/* Unlock Date */}
                {!isLocked && badge.unlockedAt && (
                    <p className={`${sizeStyle.rarity} mt-2 ${rarityStyle.text} opacity-70`}>
                        Unlocked {formatDate(badge.unlockedAt)}
                    </p>
                )}
            </div>

            {/* Shimmer Effect for Unlocked Badges */}
            {!isLocked && (
                <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
                    <div className="absolute -inset-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        style={{ animationDuration: '3s' }} />
                </div>
            )}
        </div>
    );
}
