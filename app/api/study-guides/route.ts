import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        const result = await pool.query(
            'SELECT * FROM study_guides ORDER BY episode_id ASC'
        );

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching study guides:', error);
        return NextResponse.json({ error: 'Failed to fetch study guides' }, { status: 500 });
    }
}
