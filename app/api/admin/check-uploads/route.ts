import { NextResponse } from 'next/server';
import { getDocumentCount } from '@/utils/vector-store';

/**
 * GET /api/admin/check-uploads
 * Check how many documents are in the database
 */
export async function GET() {
    try {
        const count = await getDocumentCount();

        return NextResponse.json({
            success: true,
            totalDocuments: count,
            message: `Database contains ${count} document chunks`
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
