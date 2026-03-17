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

// GET /api/groups/[id]/messages — last 50 messages
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const groupId = parseInt(params.id);
    if (!await assertMember(groupId, payload.userId)) {
        return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const result = await pool.query(
        `SELECT gm.id, gm.message, gm.created_at, gm.user_id, u.name as user_name
         FROM group_messages gm
         JOIN users u ON u.id = gm.user_id
         WHERE gm.group_id = $1
         ORDER BY gm.created_at DESC
         LIMIT 50`,
        [groupId]
    );
    return NextResponse.json(result.rows.reverse());
}

// POST /api/groups/[id]/messages — send a message
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const groupId = parseInt(params.id);
    if (!await assertMember(groupId, payload.userId)) {
        return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const { message } = await request.json();
    if (!message?.trim()) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    const result = await pool.query(
        `INSERT INTO group_messages (group_id, user_id, message) VALUES ($1, $2, $3)
         RETURNING id, message, created_at, user_id`,
        [groupId, payload.userId, message.trim()]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
}
