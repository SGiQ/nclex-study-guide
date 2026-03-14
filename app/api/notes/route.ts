import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function getUserId(request: Request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        return decoded.userId;
    } catch (e) {
        return null;
    }
}

export async function GET(request: Request) {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const result = await pool.query(
            'SELECT id, label, content, context, created_at as timestamp FROM notes WHERE user_id = $1 ORDER BY created_at DESC',
            [userId]
        );
        return NextResponse.json(result.rows);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const userId = await getUserId(request);
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { label, content, context } = await request.json();
        const result = await pool.query(
            'INSERT INTO notes (user_id, label, content, context) VALUES ($1, $2, $3, $4) RETURNING id, label, content, context, created_at as timestamp',
            [userId, label || 'General', content, context || 'General']
        );
        return NextResponse.json({ success: true, note: result.rows[0] });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
    }
}
