import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'app', 'data', 'flashcards.json');

// Helper to read data
function getFlashcards() {
    if (!fs.existsSync(filePath)) return [];
    const fileData = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileData);
}

// GET: Fetch all flashcards
export async function GET() {
    return NextResponse.json(getFlashcards());
}

// POST: Save/Update a flashcard set
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { episodeId, title, cards } = body;

        const allFlashcards = getFlashcards();
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

        fs.writeFileSync(filePath, JSON.stringify(allFlashcards, null, 2));
        return NextResponse.json({ success: true, message: 'Flashcards saved successfully' });

    } catch (error) {
        console.error('Error saving flashcards:', error);
        return NextResponse.json({ error: 'Failed to save flashcards' }, { status: 500 });
    }
}
