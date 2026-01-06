import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const episodeId = data.get('episodeId');

        if (!file || !episodeId) {
            return NextResponse.json({ error: 'Missing file or episodeId' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save file to public/uploads
        const filename = `episode-${episodeId}.mp3`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);

        // Update episodes.json
        const episodesPath = path.join(process.cwd(), 'app', 'data', 'episodes.json');
        const episodesData = await readFile(episodesPath, 'utf-8');
        const episodes = JSON.parse(episodesData);

        const updatedEpisodes = episodes.map((ep: any) => {
            if (ep.id === parseInt(episodeId.toString())) {
                return { ...ep, audioUrl: `/uploads/${filename}` };
            }
            return ep;
        });

        await writeFile(episodesPath, JSON.stringify(updatedEpisodes, null, 2));

        return NextResponse.json({ success: true, url: `/uploads/${filename}` });
    } catch (error) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
