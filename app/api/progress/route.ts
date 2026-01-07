import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

/**
 * POST /api/progress
 * Save user progress for quiz, flashcard, lesson, etc.
 */
export async function POST(request: Request) {
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

        const { contentType, contentId, completed, score, total } = await request.json();

        // Validate input
        if (!contentType || !contentId) {
            return NextResponse.json(
                { error: 'contentType and contentId are required' },
                { status: 400 }
            );
        }

        // Upsert progress
        const result = await pool.query(
            `INSERT INTO user_progress (user_id, content_type, content_id, completed, score, total, completed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id, content_type, content_id)
       DO UPDATE SET
         completed = $4,
         score = $5,
         total = $6,
         completed_at = $7
       RETURNING *`,
            [
                payload.userId,
                contentType,
                contentId,
                completed || false,
                score || null,
                total || null,
                completed ? new Date() : null
            ]
        );

        // Update streak if completed
        if (completed) {
            await updateStreak(payload.userId);
        }

        return NextResponse.json({
            success: true,
            progress: result.rows[0]
        });
    } catch (error: any) {
        console.error('Progress save error:', error);
        return NextResponse.json(
            { error: 'Failed to save progress' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/progress
 * Get user's progress
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

        // Fetch all progress
        const result = await pool.query(
            'SELECT * FROM user_progress WHERE user_id = $1 ORDER BY completed_at DESC',
            [payload.userId]
        );

        // Fetch streak data
        const streakResult = await pool.query(
            'SELECT * FROM user_streaks WHERE user_id = $1',
            [payload.userId]
        );

        return NextResponse.json({
            success: true,
            progress: result.rows,
            streak: streakResult.rows[0] || null
        });
    } catch (error: any) {
        console.error('Progress fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch progress' },
            { status: 500 }
        );
    }
}

/**
 * Update user streak
 */
async function updateStreak(userId: number) {
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
        'SELECT * FROM user_streaks WHERE user_id = $1',
        [userId]
    );

    if (result.rows.length === 0) {
        // Create streak record
        await pool.query(
            'INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_study_date) VALUES ($1, 1, 1, $2)',
            [userId, today]
        );
        return;
    }

    const streak = result.rows[0];
    const lastDate = streak.last_study_date ? new Date(streak.last_study_date).toISOString().split('T')[0] : null;

    if (lastDate === today) {
        // Already studied today
        return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    if (lastDate === yesterdayStr) {
        // Consecutive day
        newStreak = streak.current_streak + 1;
    }

    const newLongest = Math.max(newStreak, streak.longest_streak);

    await pool.query(
        'UPDATE user_streaks SET current_streak = $1, longest_streak = $2, last_study_date = $3, updated_at = NOW() WHERE user_id = $4',
        [newStreak, newLongest, today, userId]
    );
}
