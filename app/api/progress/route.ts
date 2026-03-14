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

        const { contentType, contentId, completed, score, total, metadata } = await request.json();

        // Validate input
        if (!contentType || !contentId) {
            return NextResponse.json(
                { error: 'contentType and contentId are required' },
                { status: 400 }
            );
        }

        // For quizzes, save to quiz_attempts table and track best score
        if (contentType === 'quiz' && completed && score !== undefined && total !== undefined) {
            const percentage = Math.round((score / total) * 100);
            const contentIdNum = parseInt(contentId);

            // Only save to quiz_attempts if it's a regular quiz (small ID)
            // Exams use timestamp IDs which are very large and don't match the quizzes table
            if (contentIdNum < 1000000) {
                // Save attempt to quiz_attempts table
                try {
                    await pool.query(
                        `INSERT INTO quiz_attempts (user_id, quiz_id, score, total, percentage)
                         VALUES ($1, $2, $3, $4, $5)`,
                        [payload.userId, contentIdNum, score, total, percentage]
                    );
                } catch (err) {
                    // Table might not exist yet or FK violation, continue with regular flow
                    console.warn('quiz_attempts save failed:', err);
                }
            }

            // Get current progress to check best score
            const currentProgress = await pool.query(
                `SELECT best_score, attempt_count FROM user_progress 
                 WHERE user_id = $1 AND content_type = $2 AND content_id = $3`,
                [payload.userId, contentType, contentId]
            );

            const currentBest = currentProgress.rows[0]?.best_score || 0;
            const currentAttempts = currentProgress.rows[0]?.attempt_count || 0;
            const newBest = Math.max(currentBest, score);

            // Upsert progress with best score and attempt count
            const result = await pool.query(
                `INSERT INTO user_progress (user_id, content_type, content_id, completed, score, total, best_score, attempt_count, completed_at, metadata)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 ON CONFLICT (user_id, content_type, content_id)
                 DO UPDATE SET
                   completed = $4,
                   score = $5,
                   total = $6,
                   best_score = GREATEST(COALESCE(user_progress.best_score, 0), $7),
                   attempt_count = COALESCE(user_progress.attempt_count, 0) + 1,
                   completed_at = $9,
                   metadata = COALESCE(user_progress.metadata, '{}'::jsonb) || $10
                 RETURNING *`,
                [
                    payload.userId,
                    contentType,
                    contentId,
                    completed,
                    score,
                    total,
                    newBest,
                    1, // This will be incremented in DO UPDATE
                    new Date(),
                    metadata || {}
                ]
            );

            await updateStreak(payload.userId);

            return NextResponse.json({
                success: true,
                progress: result.rows[0]
            });
        } else {
            // For non-quiz content, use original logic
            const result = await pool.query(
                `INSERT INTO user_progress (user_id, content_type, content_id, completed, score, total, completed_at, metadata)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 ON CONFLICT (user_id, content_type, content_id)
                 DO UPDATE SET
                   completed = $4,
                   score = $5,
                   total = $6,
                   completed_at = $7,
                   metadata = COALESCE(user_progress.metadata, '{}'::jsonb) || $8
                 RETURNING *`,
                [
                    payload.userId,
                    contentType,
                    contentId,
                    completed || false,
                    score || null,
                    total || null,
                    completed ? new Date() : null,
                    metadata || {}
                ]
            );

            if (completed) {
                await updateStreak(payload.userId);
            }

            return NextResponse.json({
                success: true,
                progress: result.rows[0]
            });
        }
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
