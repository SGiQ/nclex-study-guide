import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const result = await pool.query(
            'DELETE FROM slides WHERE id = $1 RETURNING id',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Slide deck not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Slide deck deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting slide deck:', error);
        return NextResponse.json({ error: 'Failed to delete slide deck' }, { status: 500 });
    }
}
