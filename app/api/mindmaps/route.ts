import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        // Try to select with new columns
        const result = await pool.query(
            'SELECT id, episode_id, title, file_name, file_type, created_at, nodes, edges FROM mindmaps ORDER BY created_at DESC'
        );
        return NextResponse.json(result.rows);
    } catch (error: any) {
        console.warn('Using fallback query for mindmaps:', error.message);
        try {
            const result = await pool.query(
                'SELECT id, episode_id, title, file_name, file_type, created_at FROM mindmaps ORDER BY created_at DESC'
            );
            const rows = result.rows.map(row => ({ ...row, nodes: [], edges: [] }));
            return NextResponse.json(rows);
        } catch (fallbackError) {
            console.error('Fallback failed:', fallbackError);
            return NextResponse.json([], { status: 200 }); // Return empty array even on critical failure
        }
    }
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

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Insert into database
        const result = await pool.query(
            `INSERT INTO mindmaps (episode_id, title, file_name, file_data, file_type, created_at) 
             VALUES ($1, $2, $3, $4, $5, NOW()) 
             RETURNING id, episode_id, title, file_name, file_type, created_at`,
            [
                episodeId ? parseInt(episodeId) : null,
                title,
                file.name,
                buffer,
                file.type
            ]
        );

        return NextResponse.json({ success: true, mindmap: result.rows[0] });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Failed to upload mind map' }, { status: 500 });
    }
}
