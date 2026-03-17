import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

// POST /api/groups/[id]/nudge — log a nudge_received for a target user
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const groupId = parseInt(id);
    const { target_user_id } = await request.json();
    if (!target_user_id) return NextResponse.json({ error: 'target_user_id is required' }, { status: 400 });

    // Verify sender is a member
    const senderCheck = await pool.query(
        'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, payload.userId]
    );
    if (senderCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    // Get sender name
    const senderResult = await pool.query('SELECT name FROM users WHERE id = $1', [payload.userId]);
    const senderName = senderResult.rows[0]?.name || 'Someone';

    // Find all shared groups between sender and target
    const sharedGroups = await pool.query(
        `SELECT DISTINCT gm.group_id FROM group_members gm
         WHERE gm.user_id = $1
         AND gm.group_id IN (
             SELECT group_id FROM group_members WHERE user_id = $2
         )`,
        [payload.userId, target_user_id]
    );

    // Log nudge_received activity in all shared groups
    for (const row of sharedGroups.rows) {
        await pool.query(
            `INSERT INTO group_activity (group_id, user_id, activity_type, metadata)
             VALUES ($1, $2, 'nudge_received', $3)`,
            [
                row.group_id,
                target_user_id,
                JSON.stringify({ from_user_id: payload.userId, from_name: senderName })
            ]
        );
    }

    return NextResponse.json({ success: true });
}
