'use client';

import { useAchievements } from '@/app/context/AchievementContext';
import BadgeUnlockNotification from '@/app/components/BadgeUnlockNotification';

export default function AchievementNotificationWrapper() {
    const { recentlyUnlocked, dismissNotification } = useAchievements();

    return (
        <BadgeUnlockNotification
            badge={recentlyUnlocked}
            onDismiss={dismissNotification}
        />
    );
}
