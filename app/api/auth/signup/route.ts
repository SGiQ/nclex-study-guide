import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

/**
 * POST /api/auth/signup
 * Create a new user account
 */
export async function POST(request: Request) {
    try {
        const { email, password, name, plan = 'free', examDate } = await request.json();

        // Validate input
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Email, password, and name are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(password);

        // Create user
        const result = await pool.query(
            `INSERT INTO users (email, password_hash, name, plan, exam_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, plan, exam_date, created_at`,
            [email, passwordHash, name, plan, examDate || null]
        );

        const user = result.rows[0];

        // Create initial streak record
        await pool.query(
            'INSERT INTO user_streaks (user_id) VALUES ($1)',
            [user.id]
        );

        // Generate JWT token
        const token = generateToken({ userId: user.id, email: user.email });

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                plan: user.plan,
                examDate: user.exam_date,
                createdAt: user.created_at
            },
            token
        });
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { error: 'Failed to create account' },
            { status: 500 }
        );
    }
}
