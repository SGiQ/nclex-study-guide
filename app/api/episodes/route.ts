import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import episodesRN from '@/app/data/episodes-rn.json';
import episodesATITEAS from '@/app/data/episodes-ati-teas.json';
import episodesHESIA2 from '@/app/data/episodes-hesi-a2.json';

const R2_BASE_URL = 'https://pub-2b82d106a2e24d02864c89dc4b308d5c.r2.dev/uploads';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const program = searchParams.get('program') || 'nclex-pn';

    // Future programs still served from JSON until built out in DB
    if (program === 'nclex-rn') return NextResponse.json(episodesRN);
    if (program === 'ati-teas') return NextResponse.json(episodesATITEAS);
    if (program === 'hesi-a2') return NextResponse.json(episodesHESIA2);

    // NCLEX-PN served from Railway DB
    try {
        const result = await pool.query(
            `SELECT 
                e.id,
                e.title,
                e.description,
                e.duration,
                e.episode_number as "order",
                e.audio_url as "audioUrl"
             FROM episodes e
             JOIN programs p ON e.program_id = p.id
             WHERE p.slug = 'nclex-pn'
             ORDER BY e.episode_number ASC`
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching episodes:', error);
        return NextResponse.json({ error: 'Failed to fetch episodes' }, { status: 500 });
    }
}
