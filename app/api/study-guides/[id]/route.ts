import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const result = await pool.query(
            'SELECT * FROM study_guides WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Study guide not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching study guide:', error);
        return NextResponse.json({ error: 'Failed to fetch study guide' }, { status: 500 });
    }
}
