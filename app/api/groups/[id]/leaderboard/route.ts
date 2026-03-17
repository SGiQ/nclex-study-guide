import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

// GET /api/groups/[id]/leaderboard — members ranked by readiness score, streak, quizzes completed
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const groupId = parseInt(id);

    const memberCheck = await pool.query(
        'SELECT id FROM group_members WHERE group_id = $1 AND user_id = $2',
        [groupId, payload.userId]
    );
    if (memberCheck.rows.length === 0) {
        return NextResponse.json({ error: 'Not a member of this group' }, { status: 403 });
    }

    const result = await pool.query(
        `SELECT 
            gm.user_id,
            gm.role,
            u.name,
            COALESCE(up.readiness_score, 0) AS readiness_score,
            COALESCE(us.current_streak, 0) AS current_streak,
            COALESCE(us.last_study_date, NULL) AS last_study_date,
            COALESCE(
                (SELECT COUNT(*) FROM user_progress up2 
                 WHERE up2.user_id = gm.user_id AND up2.type = 'quiz' AND up2.completed = true), 0
            ) AS quizzes_completed
         FROM group_members gm
         JOIN users u ON u.id = gm.user_id
         LEFT JOIN user_progress up ON up.user_id = gm.user_id AND up.type = 'overall'
         LEFT JOIN user_streaks us ON us.user_id = gm.user_id
         WHERE gm.group_id = $1
         ORDER BY readiness_score DESC, current_streak DESC, quizzes_completed DESC`,
        [groupId]
    );

    return NextResponse.json(result.rows);
}
