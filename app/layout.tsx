import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Player from "./components/Player";
import GlobalNavigation from "./components/GlobalNavigation";
import NotesOverlay from "./components/NotesOverlay";
import TutorChat from "./components/TutorChat";

import { PlayerProvider } from "./context/PlayerContext";
import { NotesProvider } from "./context/NotesContext";
import { ProgressProvider } from './context/ProgressContext';
import { ThemeProvider } from "./context/ThemeContext";
import { StreakProvider } from '@/app/context/StreakContext';
import { LibraryProvider } from '@/app/context/LibraryContext';
import { AuthProvider } from '@/app/context/AuthContext';
import { SRSProvider } from '@/app/context/SRSContext';
import { OnboardingProvider } from '@/app/context/OnboardingContext';
import { AchievementProvider } from '@/app/context/AchievementContext';
import QuickActionsFAB from '@/app/components/QuickActionsFAB';
import AchievementNotificationWrapper from '@/app/components/AchievementNotificationWrapper';
import { TutorProvider } from '@/app/context/TutorContext';
import { ProgramProvider } from '@/app/context/ProgramContext';
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NCLEX Study Guide",
  description: "Audio lessons and quizzes for NCLEX prep",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NCLEX Guide",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-25..0&display=block" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <SRSProvider>
              <OnboardingProvider>
                <StreakProvider>
                  <LibraryProvider>
                    <PlayerProvider>
                      <NotesProvider>
                        <ProgressProvider>
                          <AchievementProvider>
                            <TutorProvider>
                              <ProgramProvider>
                                <AchievementNotificationWrapper />
                                {children}
                                <Player />
                                <TutorChat />
                                <NotesOverlay />
                                <GlobalNavigation />
                                <QuickActionsFAB />
                              </ProgramProvider>
                            </TutorProvider>
                          </AchievementProvider>
                        </ProgressProvider>
                      </NotesProvider>
                    </PlayerProvider>
                  </LibraryProvider>
                </StreakProvider>
              </OnboardingProvider>
            </SRSProvider>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
