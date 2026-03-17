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

// GET /api/groups/[id]/challenges — all challenges for the group
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const groupId = parseInt(id);
    if (!await assertMember(groupId, payload.userId)) {
        return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const result = await pool.query(
        `SELECT gc.*, u.name as created_by_name,
                COUNT(cr.id) as result_count
         FROM group_challenges gc
         LEFT JOIN users u ON u.id = gc.created_by
         LEFT JOIN challenge_results cr ON cr.challenge_id = gc.id
         WHERE gc.group_id = $1
         GROUP BY gc.id, u.name
         ORDER BY gc.created_at DESC`,
        [groupId]
    );
    return NextResponse.json(result.rows);
}

// POST /api/groups/[id]/challenges — create a new challenge
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: cId } = await params;
    const groupId = parseInt(cId);
    if (!await assertMember(groupId, payload.userId)) {
        return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const { quiz_id, quiz_title, ends_at } = await request.json();
    if (!quiz_id) return NextResponse.json({ error: 'quiz_id is required' }, { status: 400 });

    const result = await pool.query(
        `INSERT INTO group_challenges (group_id, created_by, quiz_id, quiz_title, ends_at)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [groupId, payload.userId, quiz_id, quiz_title || null, ends_at || null]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
}
