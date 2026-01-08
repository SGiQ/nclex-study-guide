// Sample transcript data structure
// This will be replaced with actual transcripts once generated

export interface TranscriptSegment {
    start: number;      // Start time in seconds
    end: number;        // End time in seconds
    text: string;       // Transcript text
    speaker?: string;   // Optional speaker label
}

// Sample transcript for Episode 10 (placeholder)
export const episode10Transcript: TranscriptSegment[] = [
    {
        start: 0,
        end: 15,
        text: "Welcome to Episode 10: Reduction of Risk Potential. In this episode, we'll cover diagnostic tests, laboratory values, and cardiovascular pathophysiology.",
        speaker: "Speaker 1"
    },
    {
        start: 15,
        end: 30,
        text: "Let's start with understanding common diagnostic procedures and how to interpret lab values in clinical settings.",
        speaker: "Speaker 2"
    },
    // More segments will be added from actual transcription
];

// Transcript lookup by episode ID
export const transcripts: Record<number, TranscriptSegment[]> = {
    10: episode10Transcript,
    // Add more episodes as transcripts become available
};

// Helper to get transcript for an episode
export function getTranscript(episodeId: number): TranscriptSegment[] {
    return transcripts[episodeId] || [];
}
