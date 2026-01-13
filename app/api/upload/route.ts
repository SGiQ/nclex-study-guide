import { NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const episodeId = data.get('episodeId');
        const program = data.get('program') as string || 'nclex-pn';

        if (!file || !episodeId) {
            return NextResponse.json({ error: 'Missing file or episodeId' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save file to public/uploads
        const filename = `episode-${episodeId}-${program}.mp3`; // Make filename program-specific too? Or just episode-id if IDs are unique?
        // IDs are currently overlapping (101 in PN, 201 in HESI).
        // Safest to just keep it simple, maybe append program or just rely on unique IDs.
        // For now, I'll keep the simple filename but maybe careful about overwrites if IDs clash.
        // Actually, IDs are 101, 102... 201... so unique enough for now.

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        await writeFile(filePath, buffer);

        // Update correct episodes.json based on program
        let episodesFilename = 'episodes.json';
        if (program && program !== 'nclex-pn') {
            episodesFilename = `episodes-${program}.json`;
        }

        const episodesPath = path.join(process.cwd(), 'app', 'data', episodesFilename);

        if (!fs.existsSync(episodesPath)) {
            // New file? Create empty array? Or error?
            // If we are uploading to a program that has no episodes file, we might be in trouble.
            // But we executed the "Create Placeholders" step, so it should exist.
            return NextResponse.json({ error: 'Episodes data file not found' }, { status: 404 });
        }

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
