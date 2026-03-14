import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = payload.userId;
        console.log(`Starting stats repair for user ${userId}`);

        // 1. Audit Quiz Progress
        const progressRes = await pool.query(
            `SELECT score, total, metadata, content_type, completed_at 
             FROM user_progress 
             WHERE user_id = $1 AND (content_type = 'quiz' OR content_type = 'audio')`,
            [userId]
        );

        const quizAttemptsRes = await pool.query(
            'SELECT score, total FROM quiz_attempts WHERE user_id = $1',
            [userId]
        );

        let totalQuestions = 0;
        let quizzesCompleted = 0;
        let audioCompleted = 0;
        let totalTime = 0;
        let maxScore = 0;

        // Count unique quizzes from progress
        const quizzes = progressRes.rows.filter(r => r.content_type === 'quiz');
        quizzesCompleted = quizzes.length;
        
        quizzes.forEach(q => {
            totalQuestions += (q.total || 0);
            if (q.total > 0) {
                const scorePct = Math.round((q.score / q.total) * 100);
                maxScore = Math.max(maxScore, scorePct);
            }
            
            if (q.metadata && q.metadata.totalStudyTime) {
                if (typeof q.metadata.totalStudyTime === 'number' && q.metadata.totalStudyTime < 36000) {
                   totalTime += q.metadata.totalStudyTime;
                }
            }
        });

        // Add audio
        audioCompleted = progressRes.rows.filter(r => r.content_type === 'audio').length;

        // Reasonable default time if missing (5 mins per quiz, 10 mins per audio)
        if (totalTime === 0) {
            totalTime = (quizzesCompleted * 300) + (audioCompleted * 600);
        }

        const newStats = {
            totalStudyTime: totalTime,
            questionsAnswered: totalQuestions,
            currentStreak: 1, 
            longestStreak: 1,
            bestQuizScore: maxScore,
            quizzesCompleted: quizzesCompleted,
            audioCompleted: audioCompleted,
            lastStudyDate: new Date().toISOString().split('T')[0]
        };

        // 2. Update database
        await pool.query(
            `INSERT INTO user_progress (user_id, content_type, content_id, metadata)
             VALUES ($1, 'achievement_stats', 'global', $2)
             ON CONFLICT (user_id, content_type, content_id)
             DO UPDATE SET metadata = $2`,
            [userId, newStats]
        );

        return NextResponse.json({
            success: true,
            message: 'Stats repaired successfully',
            newStats
        });

    } catch (error) {
        console.error('Repair API error:', error);
        return NextResponse.json({ error: 'Internal server error during repair' }, { status: 500 });
    }
}
