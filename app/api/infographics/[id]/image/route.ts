import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const result = await pool.query(
            'SELECT file_data, file_type, file_name FROM infographics WHERE id = $1',
            [params.id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Infographic not found' }, { status: 404 });
        }

        const { file_data, file_type, file_name } = result.rows[0];

        return new NextResponse(file_data, {
            headers: {
                'Content-Type': file_type || 'image/png',
                'Content-Disposition': `inline; filename="${file_name}"`,
            },
        });
    } catch (error) {
        console.error('Error fetching infographic image:', error);
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }
}
