import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

// GET /api/groups/[id]/challenges/[challengeId]/results
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string; challengeId: string } }
) {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const groupId = parseInt(params.id);
    const challengeId = parseInt(params.challengeId);

    // Verify member
    const memberCheck = await pool.query(
        'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, payload.userId]
    );
    if (memberCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const result = await pool.query(
        `SELECT cr.user_id, cr.score, cr.total, cr.completed_at, u.name as user_name
         FROM challenge_results cr
         JOIN users u ON u.id = cr.user_id
         WHERE cr.challenge_id = $1
         ORDER BY (cr.score::float / NULLIF(cr.total, 0)) DESC NULLS LAST`,
        [challengeId]
    );

    return NextResponse.json(result.rows);
}

// POST /api/groups/[id]/challenges/[challengeId]/results — submit a result
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string; challengeId: string } }
) {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const groupId = parseInt(params.id);
    const challengeId = parseInt(params.challengeId);

    const memberCheck = await pool.query(
        'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, payload.userId]
    );
    if (memberCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const { score, total } = await request.json();
    if (score === undefined || !total) {
        return NextResponse.json({ error: 'score and total are required' }, { status: 400 });
    }

    const result = await pool.query(
        `INSERT INTO challenge_results (challenge_id, user_id, score, total)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (challenge_id, user_id) DO UPDATE
         SET score = EXCLUDED.score, total = EXCLUDED.total, completed_at = NOW()
         RETURNING *`,
        [challengeId, payload.userId, score, total]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
}
