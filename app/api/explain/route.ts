import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
// Note: If apiKey is undefined, the SDK will throw an error when called.
// We should check it, but for this scratch environment we assume it's set or will be set.

export async function POST(req: NextRequest) {
    if (!apiKey) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is not set' }, { status: 500 });
    }

    try {
        const { front, back } = await req.json();

        if (!front || !back) {
            return NextResponse.json({ error: 'Missing front or back content' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' }); // Or 'gemini-pro'

        const prompt = `
            You are an expert nursing tutor helping a student study for the NCLEX-PN.
            
            Here is a flashcard:
            Question: "${front}"
            Answer: "${back}"

            Please provide a simple, concise explanation of why this answer is correct. 
            Focus on the "why" and any key memory aids (mnemonics) that might help.
            Keep it under 3 sentences if possible, conversational but professional.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const explanation = response.text();

        return NextResponse.json({ explanation });
    } catch (error) {
        console.error('AI Error:', error);
        return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
    }
}
