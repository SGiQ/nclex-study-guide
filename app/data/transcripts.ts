// Transcript data for episodes
// Generated from AssemblyAI transcription with speaker detection

export interface TranscriptSegment {
    start: number;      // Start time in seconds
    end: number;        // End time in seconds
    text: string;       // Transcript text
    speaker?: string;   // Optional speaker label
}

// Episode 10: Respiratory, Neurological & Endocrine
import episode10Data from './episode-10-transcript.json';

// Transcript lookup by episode ID
export const transcripts: Record<number, TranscriptSegment[]> = {
    10: episode10Data as TranscriptSegment[],
    // Add more episodes as transcripts become available
};

// Helper to get transcript for an episode
export function getTranscript(episodeId: number): TranscriptSegment[] {
    return transcripts[episodeId] || [];
}

// Helper to check if transcript exists
export function hasTranscript(episodeId: number): boolean {
    return episodeId in transcripts && transcripts[episodeId].length > 0;
}
