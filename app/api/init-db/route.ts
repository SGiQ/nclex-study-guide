import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/utils/vector-store';

/**
 * Database initialization endpoint
 * GET /api/init-db
 * 
 * This endpoint creates the necessary tables and extensions for RAG
 */
export async function GET(req: NextRequest) {
    try {
        console.log('Initializing database...');
        await initializeDatabase();

        return NextResponse.json({
            success: true,
            message: 'Database initialized successfully! Table "nclex_documents" created with pgvector extension.'
        });
    } catch (error: any) {
        console.error('Database initialization error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            details: 'Make sure DATABASE_URL is set correctly in Railway'
        }, { status: 500 });
    }
}
