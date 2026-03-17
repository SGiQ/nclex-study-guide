import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

function randomCode(len = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// GET /api/groups — fetch all groups the current user belongs to
export async function GET(request: NextRequest) {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await pool.query(
        `SELECT sg.id, sg.name, sg.invite_code, sg.created_at, sg.created_by,
                gm.role,
                COUNT(gm2.id) AS member_count
         FROM study_groups sg
         JOIN group_members gm ON gm.group_id = sg.id AND gm.user_id = $1
         LEFT JOIN group_members gm2 ON gm2.group_id = sg.id
         GROUP BY sg.id, gm.role
         ORDER BY sg.created_at DESC`,
        [payload.userId]
    );
    return NextResponse.json(result.rows);
}

// POST /api/groups — create a new group
export async function POST(request: NextRequest) {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    const payload = token ? verifyToken(token) : null;
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    // Generate unique invite code
    let inviteCode = randomCode();
    let attempts = 0;
    while (attempts < 5) {
        const existing = await pool.query('SELECT id FROM study_groups WHERE invite_code = $1', [inviteCode]);
        if (existing.rows.length === 0) break;
        inviteCode = randomCode();
        attempts++;
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const groupResult = await client.query(
            `INSERT INTO study_groups (name, invite_code, created_by) VALUES ($1, $2, $3) RETURNING *`,
            [name.trim(), inviteCode, payload.userId]
        );
        const group = groupResult.rows[0];
        await client.query(
            `INSERT INTO group_members (group_id, user_id, role) VALUES ($1, $2, 'admin')`,
            [group.id, payload.userId]
        );
        await client.query('COMMIT');
        return NextResponse.json(group, { status: 201 });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error creating group:', err);
        return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
    } finally {
        client.release();
    }
}
