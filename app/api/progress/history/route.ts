import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

/**
 * GET /api/progress/history?quizId=1
 * Get quiz attempt history for current user
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

        const { searchParams } = new URL(request.url);
        const quizId = searchParams.get('quizId');

        if (!quizId) {
            return NextResponse.json(
                { error: 'quizId is required' },
                { status: 400 }
            );
        }

        // Fetch all attempts for this quiz
        const result = await pool.query(
            `SELECT id, score, total, percentage, completed_at 
       FROM quiz_attempts 
       WHERE user_id = $1 AND quiz_id = $2 
       ORDER BY completed_at DESC`,
            [payload.userId, quizId]
        );

        // Get best score and attempt count from user_progress
        const progressResult = await pool.query(
            `SELECT best_score, attempt_count 
       FROM user_progress 
       WHERE user_id = $1 AND content_type = 'quiz' AND content_id = $2`,
            [payload.userId, quizId]
        );

        const stats = progressResult.rows[0] || { best_score: null, attempt_count: 0 };

        return NextResponse.json({
            success: true,
            attempts: result.rows,
            bestScore: stats.best_score,
            totalAttempts: stats.attempt_count || result.rows.length
        });
    } catch (error: any) {
        console.error('History fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch history' },
            { status: 500 }
        );
    }
}
