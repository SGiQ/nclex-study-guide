import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * POST /api/admin/migrate-quiz-enhancements
 * Add quiz_attempts table and update user_progress
 */
export async function POST() {
    try {
        // Create quiz_attempts table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        quiz_id INTEGER NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        percentage INTEGER NOT NULL,
        completed_at TIMESTAMP DEFAULT NOW()
      )
    `);

        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id)
    `);

        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id)
    `);

        // Add new columns to user_progress if they don't exist
        await pool.query(`
      ALTER TABLE user_progress 
      ADD COLUMN IF NOT EXISTS best_score INTEGER,
      ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 1
    `);

        return NextResponse.json({
            success: true,
            message: 'Quiz enhancements migration completed successfully'
        });
    } catch (error: any) {
        console.error('Quiz migration error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
