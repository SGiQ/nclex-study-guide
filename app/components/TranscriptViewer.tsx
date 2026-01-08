'use client';

import { useState, useEffect, useRef } from 'react';

interface TranscriptSegment {
    start: number;
    end: number;
    text: string;
    speaker?: string; // Optional speaker label (e.g., "Speaker 1", "Speaker 2")
}

interface TranscriptViewerProps {
    segments: TranscriptSegment[];
    currentTime: number;
    onSeek: (time: number) => void;
}

export default function TranscriptViewer({ segments, currentTime, onSeek }: TranscriptViewerProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const activeSegmentRef = useRef<HTMLDivElement>(null);

    // Find current active segment
    const activeSegmentIndex = segments.findIndex(
        seg => currentTime >= seg.start && currentTime <= seg.end
    );

    // Auto-scroll to active segment
    useEffect(() => {
        if (activeSegmentRef.current && isExpanded) {
            activeSegmentRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [activeSegmentIndex, isExpanded]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get speaker color
    const getSpeakerColor = (speaker?: string) => {
        if (!speaker) return 'text-foreground/70';
        if (speaker.includes('1')) return 'text-blue-400';
        if (speaker.includes('2')) return 'text-purple-400';
        return 'text-green-400';
    };

    return (
        <div className="w-full bg-card border-t border-card-border">
            {/* Dropdown Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">📝</span>
                    <div className="text-left">
                        <h3 className="font-bold text-foreground">Transcript</h3>
                        <p className="text-xs text-foreground/50">
                            {segments.length} segments
                            {segments.some(s => s.speaker) && ' • Multiple speakers detected'}
                        </p>
                    </div>
                </div>
                <svg
                    className={`w-5 h-5 text-foreground/50 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Transcript Content */}
            {isExpanded && (
                <div className="max-h-[400px] overflow-y-auto px-6 pb-6">
                    <div className="space-y-3">
                        {segments.map((segment, index) => {
                            const isActive = index === activeSegmentIndex;

                            return (
                                <div
                                    key={index}
                                    ref={isActive ? activeSegmentRef : null}
                                    onClick={() => onSeek(segment.start)}
                                    className={`p-4 rounded-lg cursor-pointer transition-all ${isActive
                                        ? 'bg-indigo-500/20 border border-indigo-500/30'
                                        : 'bg-surface/5 hover:bg-surface/10 border border-transparent'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Timestamp */}
                                        <span className="text-xs font-mono text-foreground/40 mt-0.5 shrink-0">
                                            {formatTime(segment.start)}
                                        </span>

                                        {/* Content */}
                                        <div className="flex-1">
                                            {/* Speaker Label */}
                                            {segment.speaker && (
                                                <div className={`text-xs font-bold mb-1 ${getSpeakerColor(segment.speaker)}`}>
                                                    {segment.speaker}
                                                </div>
                                            )}

                                            {/* Text */}
                                            <p className={`text-sm leading-relaxed ${isActive ? 'text-foreground font-medium' : 'text-foreground/70'
                                                }`}>
                                                {segment.text}
                                            </p>
                                        </div>

                                        {/* Active Indicator */}
                                        {isActive && (
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {segments.length === 0 && (
                        <div className="text-center py-12 text-foreground/40">
                            <p className="text-sm">No transcript available yet</p>
                            <p className="text-xs mt-2">Transcript will be added soon</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
