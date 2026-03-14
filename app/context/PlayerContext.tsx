'use client';

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

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
    isDismissed: boolean;
    currentTime: number;
    analyser: AnalyserNode | null;
    episodeEndedSignal: number; // increments every time an episode ends
    playEpisode: (episode: Episode) => void;
    loadEpisode: (episode: Episode) => void;
    playNextEpisode: (episodes: Episode[]) => void;
    togglePlay: () => void;
    setIsPlaying: (playing: boolean) => void;
    setCurrentTime: (time: number) => void;
    setAnalyser: (analyser: AnalyserNode | null) => void;
    closePlayer: () => void;
    signalEpisodeEnded: () => void;
}

const LAST_EPISODE_KEY = 'nclex_last_episode';

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [currentEpisode, setCurrentEpisodeState] = useState<Episode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
    const [episodeEndedSignal, setEpisodeEndedSignal] = useState(0);

    useEffect(() => {
        try {
            const saved = localStorage.getItem(LAST_EPISODE_KEY);
            if (saved) {
                setCurrentEpisodeState(JSON.parse(saved));
                setIsDismissed(true);
            }
        } catch { /* ignore */ }
    }, []);

    const setCurrentEpisode = (episode: Episode | null) => {
        setCurrentEpisodeState(episode);
        try {
            if (episode) localStorage.setItem(LAST_EPISODE_KEY, JSON.stringify(episode));
        } catch { /* ignore */ }
    };

    const playEpisode = (episode: Episode) => {
        setIsDismissed(false);
        if (currentEpisode?.id === episode.id) {
            setIsPlaying(!isPlaying);
        } else {
            setCurrentEpisode(episode);
            setIsPlaying(true);
            setCurrentTime(0);
        }
    };

    const loadEpisode = (episode: Episode) => {
        setIsDismissed(false);
        setCurrentEpisode(episode);
        setIsPlaying(false);
        setCurrentTime(0);
    };

    const playNextEpisode = (episodes: Episode[]) => {
        if (!currentEpisode) return;
        const next = episodes.find(e => e.order === currentEpisode.order + 1);
        if (next) {
            setCurrentEpisode(next);
            setIsPlaying(true);
            setCurrentTime(0);
            setIsDismissed(false);
        }
    };

    const togglePlay = () => {
        setIsDismissed(false);
        setIsPlaying(!isPlaying);
    };

    const closePlayer = () => {
        setIsPlaying(false);
        setIsDismissed(true);
    };

    const signalEpisodeEnded = () => {
        setEpisodeEndedSignal(prev => prev + 1);
    };

    return (
        <PlayerContext.Provider value={{
            currentEpisode, isPlaying, isDismissed, currentTime, setCurrentTime,
            playEpisode, loadEpisode, playNextEpisode, togglePlay, setIsPlaying,
            closePlayer, analyser, setAnalyser, episodeEndedSignal, signalEpisodeEnded
        }}>
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
