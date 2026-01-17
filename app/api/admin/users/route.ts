import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * GET /api/admin/users
 * Fetch all users with progress statistics
 */
export async function GET() {
    try {
        // Fetch all users with progress stats
        const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.name,
        u.plan,
        u.exam_date,

        u.created_at,
        u.promo_code,
        COUNT(DISTINCT CASE WHEN up.content_type = 'quiz' AND up.completed = true THEN up.id END) as quizzes_completed,
        COUNT(DISTINCT CASE WHEN up.content_type = 'flashcard' AND up.completed = true THEN up.id END) as flashcards_completed,
        COUNT(DISTINCT CASE WHEN up.content_type = 'lesson' AND up.completed = true THEN up.id END) as lessons_completed,
        COUNT(DISTINCT CASE WHEN up.content_type = 'episode' AND up.completed = true THEN up.id END) as episodes_listened,
        COALESCE(s.current_streak, 0) as current_streak,
        COALESCE(s.longest_streak, 0) as longest_streak,
        s.last_study_date
      FROM users u
      LEFT JOIN user_progress up ON u.id = up.user_id
      LEFT JOIN user_streaks s ON u.id = s.user_id
      GROUP BY u.id, u.email, u.name, u.plan, u.exam_date, u.created_at, u.promo_code, s.current_streak, s.longest_streak, s.last_study_date
      ORDER BY u.created_at DESC
    `);

        const users = result.rows.map(row => ({
            id: row.id,
            email: row.email,
            name: row.name,
            plan: row.plan,
            examDate: row.exam_date,
            createdAt: row.created_at,
            promoCode: row.promo_code,
            quizzesCompleted: parseInt(row.quizzes_completed) || 0,
            flashcardsCompleted: parseInt(row.flashcards_completed) || 0,
            lessonsCompleted: parseInt(row.lessons_completed) || 0,
            episodesListened: parseInt(row.episodes_listened) || 0,
            currentStreak: row.current_streak,
            longestStreak: row.longest_streak,
            lastActive: row.last_study_date || row.created_at
        }));

        // Calculate summary stats
        const totalUsers = users.length;
        const premiumUsers = users.filter(u => u.plan === 'premium').length;
        const lifetimeUsers = users.filter(u => u.plan === 'lifetime').length;
        const freeUsers = users.filter(u => u.plan === 'free').length;

        return NextResponse.json({
            success: true,
            users,
            summary: {
                totalUsers,
                premiumUsers,
                lifetimeUsers,
                freeUsers
            }
        });
    } catch (error: any) {
        console.error('Admin users fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}
