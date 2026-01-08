import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const result = await pool.query(
            'DELETE FROM mindmaps WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Mind map not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Mind map deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting mind map:', error);
        return NextResponse.json({ error: 'Failed to delete mind map' }, { status: 500 });
    }
}
