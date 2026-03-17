import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

async function assertMember(groupId: number, userId: number) {
    const r = await pool.query(
        'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, userId]
    );
    return r.rows.length > 0;
}

// GET /api/groups/[id]/activity — last 20 activity events
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const groupId = parseInt(params.id);
    if (!await assertMember(groupId, payload.userId)) {
        return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const result = await pool.query(
        `SELECT ga.id, ga.activity_type, ga.metadata, ga.created_at, ga.user_id, u.name as user_name
         FROM group_activity ga
         JOIN users u ON u.id = ga.user_id
         WHERE ga.group_id = $1
         ORDER BY ga.created_at DESC
         LIMIT 20`,
        [groupId]
    );
    return NextResponse.json(result.rows);
}

// POST /api/groups/[id]/activity — log an activity event
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const groupId = parseInt(params.id);
    if (!await assertMember(groupId, payload.userId)) {
        return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const { activity_type, metadata } = await request.json();
    if (!activity_type) return NextResponse.json({ error: 'activity_type is required' }, { status: 400 });

    const result = await pool.query(
        `INSERT INTO group_activity (group_id, user_id, activity_type, metadata)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [groupId, payload.userId, activity_type, JSON.stringify(metadata || {})]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
}
