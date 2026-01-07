import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

/**
 * GET /api/auth/me
 * Get current user from JWT token
 */
export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return NextResponse.json(
                { error: 'No token provided' },
                { status: 401 }
            );
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        // Fetch user data
        const result = await pool.query(
            'SELECT id, email, name, plan, exam_date, created_at FROM users WHERE id = $1',
            [payload.userId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const user = result.rows[0];

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                plan: user.plan,
                examDate: user.exam_date,
                createdAt: user.created_at
            }
        });
    } catch (error: any) {
        console.error('Auth me error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}
