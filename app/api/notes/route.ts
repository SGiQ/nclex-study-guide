import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'app', 'data', 'notes.json');

function getNotes() {
    if (!fs.existsSync(filePath)) return [];
    try {
        const fileData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileData);
    } catch (e) {
        return [];
    }
}

export async function GET() {
    return NextResponse.json(getNotes());
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { label, content, context } = body;

        const notes = getNotes();
        const newNote = {
            id: Date.now(),
            label: label || 'General',
            content,
            context: context || 'General',
            timestamp: new Date().toISOString()
        };

        notes.unshift(newNote); // Add to top

        fs.writeFileSync(filePath, JSON.stringify(notes, null, 2));
        return NextResponse.json({ success: true, note: newNote });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
    }
}
