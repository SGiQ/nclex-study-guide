// Transcript data for episodes
// Generated from AssemblyAI transcription with speaker detection

export interface TranscriptSegment {
    start: number;      // Start time in seconds
    end: number;        // End time in seconds
    text: string;       // Transcript text
    speaker?: string;   // Optional speaker label
}

// Episode 2: Coordinated Care
import episode2Data from './episode-2-transcript.json';

// Episode 3: Safety & Infection Control
import episode3Data from './episode-3-transcript.json';

// Episode 4: Health Promotion & Maintenance Part 1
import episode4Data from './episode-4-transcript.json';

// Episode 5: Psychosocial Integrity
import episode5Data from './episode-5-transcript.json';

// Episode 6: Basic Care & Comfort
import episode6Data from './episode-6-transcript.json';

// Episode 7: Pharmacological & Parenteral Therapies
import episode7Data from './episode-7-transcript.json';

// Episode 10: Respiratory, Neurological & Endocrine
import episode10Data from './episode-10-transcript.json';

// Transcript lookup by episode ID
export const transcripts: Record<number, TranscriptSegment[]> = {
    2: episode2Data as TranscriptSegment[],
    3: episode3Data as TranscriptSegment[],
    4: episode4Data as TranscriptSegment[],
    5: episode5Data as TranscriptSegment[],
    6: episode6Data as TranscriptSegment[],
    7: episode7Data as TranscriptSegment[],
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
