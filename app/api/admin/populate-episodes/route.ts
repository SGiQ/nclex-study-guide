import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import fs from 'fs';
import path from 'path';

/**
 * Populate episodes table from episodes.json
 */
export async function GET() {
    try {
        const episodesPath = path.join(process.cwd(), 'app', 'data', 'episodes.json');

        if (!fs.existsSync(episodesPath)) {
            return NextResponse.json({
                error: 'episodes.json not found'
            }, { status: 404 });
        }

        const episodesData = JSON.parse(fs.readFileSync(episodesPath, 'utf8'));

        let inserted = 0;
        for (const episode of episodesData) {
            await pool.query(
                `INSERT INTO episodes (episode_number, title, description, duration, audio_url, created_at) 
                 VALUES ($1, $2, $3, $4, $5, NOW())
                 ON CONFLICT (episode_number) DO NOTHING`,
                [
                    episode.id,
                    episode.title,
                    episode.description || '',
                    episode.duration || '',
                    episode.audioUrl || ''
                ]
            );
            inserted++;
        }

        return NextResponse.json({
            success: true,
            message: `Successfully populated ${inserted} episodes!`,
            episodes: episodesData.length
        });

    } catch (error) {
        console.error('Population error:', error);
        return NextResponse.json({
            error: 'Failed to populate episodes',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
