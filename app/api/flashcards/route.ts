import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper to get filepath based on program
function getFlashcardsFilePath(program: string | null) {
    if (program && program !== 'nclex-pn') {
        return path.join(process.cwd(), 'app', 'data', `flashcards-${program}.json`);
    }
    return path.join(process.cwd(), 'app', 'data', 'flashcards.json');
}

// Helper to read data
function getFlashcards(program: string | null) {
    const filePath = getFlashcardsFilePath(program);
    if (!fs.existsSync(filePath)) return [];

    // Create file if it doesn't exist for new programs? Or just return empty.
    // Return empty is safer.

    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData);
}

// GET: Fetch all flashcards
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const program = searchParams.get('program');
    return NextResponse.json(getFlashcards(program));
}

// POST: Save/Update a flashcard set
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { episodeId, title, cards, program } = body;

        const allFlashcards = getFlashcards(program);
        const existingIndex = allFlashcards.findIndex((f: any) => f.episodeId === parseInt(episodeId));

        const newSet = {
            episodeId: parseInt(episodeId),
            title: title || `Episode ${episodeId} Flashcards`,
            description: `Flashcards for Episode ${episodeId}`,
            cards: cards.map((c: any, idx: number) => ({
                id: idx + 1,
                front: c.front,
                back: c.back
            }))
        };

        if (existingIndex > -1) {
            allFlashcards[existingIndex] = newSet;
        } else {
            allFlashcards.push(newSet);
        }

        const filePath = getFlashcardsFilePath(program);

        // Ensure directory exists (it should)
        // Write file
        fs.writeFileSync(filePath, JSON.stringify(allFlashcards, null, 2));
        return NextResponse.json({ success: true, message: 'Flashcards saved successfully' });

    } catch (error) {
        console.error('Error saving flashcards:', error);
        return NextResponse.json({ error: 'Failed to save flashcards' }, { status: 500 });
    }
}
