import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import fs from 'fs';
import path from 'path';

/**
 * API endpoint to migrate existing JSON data to PostgreSQL database
 * This should be called once after deploying the new database schema
 */
export async function POST() {
    try {
        const dataDir = path.join(process.cwd(), 'app', 'data');
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

        // Migrate slides (has 1 existing slide)
        const slidesPath = path.join(dataDir, 'slides.json');
        if (fs.existsSync(slidesPath)) {
            const slidesData = JSON.parse(fs.readFileSync(slidesPath, 'utf8'));

            for (const slide of slidesData) {
                const filePath = path.join(uploadsDir, 'slides', slide.fileName);
                if (fs.existsSync(filePath)) {
                    const fileBuffer = fs.readFileSync(filePath);

                    await pool.query(
                        `INSERT INTO slides (id, episode_id, title, file_name, file_data, file_type, created_at) 
                         VALUES ($1, $2, $3, $4, $5, $6, $7)
                         ON CONFLICT (id) DO NOTHING`,
                        [
                            slide.id,
                            slide.episodeId || null,
                            slide.title,
                            slide.fileName,
                            fileBuffer,
                            'application/pdf',
                            slide.uploadedAt
                        ]
                    );
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Data migration completed successfully'
        });

    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({
            error: 'Failed to migrate data',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
