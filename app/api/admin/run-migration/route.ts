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
        const migrationsDir = path.join(process.cwd(), 'scripts', 'migrations');

        // Get all SQL migration files and sort them
        const migrationFiles = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // This will sort them: 001, 002, 003, etc.

        if (migrationFiles.length === 0) {
            return NextResponse.json({
                error: 'No migration files found',
                path: migrationsDir
            }, { status: 404 });
        }

        const results: string[] = [];

        // Run each migration file in order
        for (const file of migrationFiles) {
            const migrationPath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(migrationPath, 'utf8');

            await pool.query(sql);
            results.push(file);
        }

        return NextResponse.json({
            success: true,
            message: `Database migration completed successfully! Ran ${results.length} migration files.`,
            migrations: results
        });

    } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json({
            error: 'Failed to run migration',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
