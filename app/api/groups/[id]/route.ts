import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

// GET /api/groups/[id] — group details + members list
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const groupId = parseInt(params.id);

    // Verify user is a member
    const memberCheck = await pool.query(
        'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, payload.userId]
    );
    if (memberCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const [groupResult, membersResult] = await Promise.all([
        pool.query('SELECT * FROM study_groups WHERE id = $1', [groupId]),
        pool.query(
            `SELECT gm.user_id, gm.role, gm.joined_at,
                    u.name, u.email
             FROM group_members gm
             JOIN users u ON u.id = gm.user_id
             WHERE gm.group_id = $1
             ORDER BY gm.role DESC, gm.joined_at ASC`,
            [groupId]
        )
    ]);

    if (groupResult.rows.length === 0) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({
        ...groupResult.rows[0],
        members: membersResult.rows
    });
}
