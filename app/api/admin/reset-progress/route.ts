import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * POST /api/admin/reset-progress
 * Reset user's quiz progress (admin only)
 */
export async function POST(request: Request) {
    try {
        const { userId, quizId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        if (quizId) {
            // Reset specific quiz
            await pool.query(
                'DELETE FROM quiz_attempts WHERE user_id = $1 AND quiz_id = $2',
                [userId, quizId]
            );

            await pool.query(
                `DELETE FROM user_progress 
         WHERE user_id = $1 AND content_type = 'quiz' AND content_id = $2`,
                [userId, quizId.toString()]
            );

            return NextResponse.json({
                success: true,
                message: `Reset quiz ${quizId} for user ${userId}`
            });
        } else {
            // Reset all quizzes for user
            await pool.query(
                'DELETE FROM quiz_attempts WHERE user_id = $1',
                [userId]
            );

            await pool.query(
                `DELETE FROM user_progress 
         WHERE user_id = $1 AND content_type = 'quiz'`,
                [userId]
            );

            return NextResponse.json({
                success: true,
                message: `Reset all quizzes for user ${userId}`
            });
        }
    } catch (error: any) {
        console.error('Reset progress error:', error);
        return NextResponse.json(
            { error: 'Failed to reset progress' },
            { status: 500 }
        );
    }
}
