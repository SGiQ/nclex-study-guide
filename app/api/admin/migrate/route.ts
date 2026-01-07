import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * POST /api/admin/migrate
 * Run database migrations
 */
export async function POST() {
    try {
        // Create users table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'premium', 'lifetime')),
        exam_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);

        // Create user_progress table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('quiz', 'flashcard', 'lesson', 'infographic', 'mindmap', 'slide')),
        content_id VARCHAR(100) NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        score INTEGER,
        total INTEGER,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, content_type, content_id)
      )
    `);

        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)
    `);

        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_progress_content ON user_progress(content_type, content_id)
    `);

        // Create user_streaks table
        await pool.query(`
      CREATE TABLE IF NOT EXISTS user_streaks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_study_date DATE,
        total_study_time INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id)
    `);

        return NextResponse.json({
            success: true,
            message: 'Database migration completed successfully'
        });
    } catch (error: any) {
        console.error('Migration error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
