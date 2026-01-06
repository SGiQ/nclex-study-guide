import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream';
import { promisify } from 'util';

const pump = promisify(pipeline);

const dataFilePath = path.join(process.cwd(), 'app', 'data', 'slides.json');
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'slides');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

function getSlides() {
    if (!fs.existsSync(dataFilePath)) return [];
    try {
        const fileData = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(fileData);
    } catch (e) {
        return [];
    }
}

export async function GET() {
    return NextResponse.json(getSlides());
}

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;
        const episodeId = formData.get('episodeId') as string;

        if (!file || !title) {
            return NextResponse.json({ error: 'Missing file or title' }, { status: 400 });
        }

        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const filePath = path.join(uploadDir, fileName);

        // Convert file to buffer and write to disk
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(filePath, buffer);

        // Save metadata
        const slides = getSlides();
        const newSlide = {
            id: Date.now(),
            episodeId: parseInt(episodeId) || 0,
            title,
            fileName,
            uploadedAt: new Date().toISOString()
        };

        slides.unshift(newSlide);
        fs.writeFileSync(dataFilePath, JSON.stringify(slides, null, 2));

        return NextResponse.json({ success: true, slide: newSlide });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload slide' }, { status: 500 });
    }
}
