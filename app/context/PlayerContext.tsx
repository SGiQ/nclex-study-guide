'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Episode {
    id: number;
    title: string;
    description: string;
    duration: number;
    audioUrl: string;
    order: number;
}

interface PlayerContextType {
    currentEpisode: Episode | null;
    isPlaying: boolean;
    playEpisode: (episode: Episode) => void;
    loadEpisode: (episode: Episode) => void;
    togglePlay: () => void;
    setIsPlaying: (playing: boolean) => void;
    closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const playEpisode = (episode: Episode) => {
        if (currentEpisode?.id === episode.id) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentEpisode(episode);
            setIsPlaying(true);
        }
    };

    const loadEpisode = (episode: Episode) => {
        setCurrentEpisode(episode);
        setIsPlaying(false);
    };

    const togglePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const closePlayer = () => {
        setCurrentEpisode(null);
        setIsPlaying(false);
    };

    return (
        <PlayerContext.Provider value={{ currentEpisode, isPlaying, playEpisode, loadEpisode, togglePlay, setIsPlaying, closePlayer }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}
