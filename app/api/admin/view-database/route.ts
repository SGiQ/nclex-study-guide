import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/admin/view-database
 * View all documents in the database with metadata
 */
export async function GET() {
    try {
        const query = `
      SELECT 
        id,
        LEFT(content, 200) as content_preview,
        metadata,
        created_at
      FROM nclex_documents
      ORDER BY created_at DESC
    `;

        const result = await pool.query(query);

        return NextResponse.json({
            success: true,
            totalDocuments: result.rows.length,
            documents: result.rows.map(row => ({
                id: row.id,
                contentPreview: row.content_preview + '...',
                source: row.metadata?.source || 'Unknown',
                chunkIndex: row.metadata?.chunkIndex,
                totalChunks: row.metadata?.totalChunks,
                uploadedAt: row.metadata?.uploadedAt || row.created_at,
                createdAt: row.created_at
            }))
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
