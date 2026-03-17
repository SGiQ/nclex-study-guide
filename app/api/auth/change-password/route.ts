import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { comparePassword, hashPassword, extractTokenFromHeader, verifyToken } from '@/lib/auth';

/**
 * PUT /api/auth/change-password
 * Change the authenticated user's password
 */
export async function PUT(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return NextResponse.json({ error: 'No token provided' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current password and new password are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            return NextResponse.json(
                { error: 'New password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Fetch current password hash
        const result = await pool.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [payload.userId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isValid = await comparePassword(currentPassword, result.rows[0].password_hash);
        if (!isValid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
        }

        // Hash and save new password
        const newHash = await hashPassword(newPassword);
        await pool.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2',
            [newHash, payload.userId]
        );

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('Change password error:', error);
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
    }
}
