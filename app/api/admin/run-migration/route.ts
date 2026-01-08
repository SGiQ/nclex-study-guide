import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import fs from 'fs';
import path from 'path';

/**
 * API endpoint to run database migrations
 * Visit this URL to create all database tables
 */
export async function GET() {
    try {
        // Read the migration SQL file
        const migrationPath = path.join(process.cwd(), 'scripts', 'migrations', '002_create_content_tables.sql');

        if (!fs.existsSync(migrationPath)) {
            return NextResponse.json({
                error: 'Migration file not found',
                path: migrationPath
            }, { status: 404 });
        }

        const sql = fs.readFileSync(migrationPath, 'utf8');

        // Execute the migration
        await pool.query(sql);

        return NextResponse.json({
            success: true,
            message: 'Database migration completed successfully! Tables created: episodes, quizzes, flashcards, mindmaps, infographics, slides'
        });

    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({
            error: 'Failed to run migration',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
