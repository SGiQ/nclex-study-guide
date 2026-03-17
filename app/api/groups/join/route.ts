import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

// POST /api/groups/join — join a group by invite code
export async function POST(request: NextRequest) {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { invite_code } = await request.json();
    if (!invite_code?.trim()) return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });

    const groupResult = await pool.query(
        'SELECT * FROM study_groups WHERE invite_code = $1',
        [invite_code.trim().toUpperCase()]
    );
    if (groupResult.rows.length === 0) {
        return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }
    const group = groupResult.rows[0];

    try {
        await pool.query(
            `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'member')
             ON CONFLICT (group_id, user_id) DO NOTHING`,
            [group.id, payload.userId]
        );
        return NextResponse.json({ success: true, group });
    } catch (err) {
        console.error('Error joining group:', err);
        return NextResponse.json({ error: 'Failed to join group' }, { status: 500 });
    }
}
