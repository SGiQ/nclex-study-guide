'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useOnboarding } from '@/app/context/OnboardingContext';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { preferences } = useOnboarding();

  useEffect(() => {
    // If user is logged in
    if (user) {
      // Check if they've completed onboarding
      if (!preferences.hasCompletedOnboarding) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } else {
      // Not logged in, go to landing
      router.push('/landing');
    }
  }, [user, preferences.hasCompletedOnboarding, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground/60">Loading...</div>
    </div>
  );
}
