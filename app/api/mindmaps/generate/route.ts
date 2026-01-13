
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const { episodeId } = await request.json();

        if (!episodeId) {
            return NextResponse.json({ error: 'Missing episodeId' }, { status: 400 });
        }

        // Try to find the transcript file
        // Pattern: episode-X-transcript.txt or episode-X-transcript.json
        // files are in root
        const transcriptPath = path.join(process.cwd(), `episode-${episodeId}-transcript.txt`);
        const jsonPath = path.join(process.cwd(), `episode-${episodeId}-transcript.json`);

        // Check API Key
        const apiKey = process.env.OPENAI_API_KEY;
        console.log('--- Generation Debug (OpenAI) ---');
        console.log('CWD:', process.cwd());
        console.log('Transcript Path:', transcriptPath);
        console.log('API Key Present:', !!apiKey);

        if (!apiKey) {
            console.error('Missing OPENAI_API_KEY');
            return NextResponse.json({ error: 'Server configuration error: Missing OpenAI API Key' }, { status: 500 });
        }

        let transcript = '';
        try {
            transcript = await fs.readFile(transcriptPath, 'utf-8');
            console.log('Transcript read success. Length:', transcript.length);
        } catch (e) {
            try {
                const jsonData = await fs.readFile(jsonPath, 'utf-8');
                const jsonObj = JSON.parse(jsonData);
                transcript = jsonObj.content || jsonObj.transcript || JSON.stringify(jsonObj);
                console.log('JSON Transcript read success. Length:', transcript.length);
            } catch (jsonErr) {
                console.error('Failed to read transcript file:', transcriptPath);
                return NextResponse.json({ error: `Transcript not found for episode ${episodeId}` }, { status: 404 });
            }
        }

        const prompt = `
        You are an educational expert creating a mind map for a nursing student.
        Based on the following transcript, create a hierarchical mind map structure.
        
        Transcript:
        ${transcript.substring(0, 30000)} ... (truncated)
        
        Return STRICT JSON format with no markdown formatting.
        Structure:
        {
            "nodes": [
                { "id": "root", "data": { "label": "Main Topic" }, "position": { "x": 0, "y": 0 }, "type": "input" },
                { "id": "1", "data": { "label": "Subtopic" }, "position": { "x": 100, "y": 100 } }
            ],
            "edges": [
                { "id": "e1-root", "source": "root", "target": "1" }
            ]
        }
        `;

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini", // Faster model for interactive generation
                messages: [
                    { "role": "system", "content": "You are a helpful assistant that generates JSON mind maps." },
                    { "role": "user", "content": prompt }
                ],
                response_format: { type: "json_object" }
            });

            const text = completion.choices[0].message.content || '{}';
            console.log('OpenAI Response received. Length:', text.length);

            const data = JSON.parse(text);
            return NextResponse.json(data);

        } catch (aiError: any) {
            console.error('OpenAI Generation Failed:', aiError);
            return NextResponse.json({
                error: 'OpenAI Generation Failed',
                details: aiError.message
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Mind Map Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate mind map' }, { status: 500 });
    }
}
