import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import quizzesPN from '@/app/data/quizzes.json';
import quizzesRN from '@/app/data/quizzes-rn.json';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const program = searchParams.get('program');

    if (program === 'nclex-rn') {
        return NextResponse.json(quizzesRN);
    }

    // Default to PN
    return NextResponse.json(quizzesPN);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { quizId, questions } = body;

        // Path to the quizzes.json file
        const filePath = path.join(process.cwd(), 'app', 'data', 'quizzes.json');

        // Read existing data
        const fileData = fs.readFileSync(filePath, 'utf8');
        const quizzes = JSON.parse(fileData);

        // Find and update the specific quiz
        const quizIndex = quizzes.findIndex((q: any) => q.id === parseInt(quizId));

        if (quizIndex === -1) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        // Update questions and count
        quizzes[quizIndex].questions = questions;
        quizzes[quizIndex].questionCount = questions.length;

        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(quizzes, null, 2));

        return NextResponse.json({ success: true, message: 'Quiz updated successfully' });

    } catch (error) {
        console.error('Error saving quiz:', error);
        return NextResponse.json({ error: 'Failed to save quiz' }, { status: 500 });
    }
}
