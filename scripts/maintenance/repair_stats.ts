import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function repairStats(userEmail: string) {
    console.log(`Repairing stats for ${userEmail}...`);

    try {
        // 1. Get User ID
        const userRes = await pool.query('SELECT id FROM users WHERE email = $1', [userEmail]);
        if (userRes.rows.length === 0) {
            console.error('User not found');
            return;
        }
        const userId = userRes.rows[0].id;

        // 2. Audit Quiz Progress
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
        
        // Count questions from unique quizzes
        quizzes.forEach(q => {
            totalQuestions += (q.total || 0);
            const scorePct = Math.round((q.score / q.total) * 100);
            maxScore = Math.max(maxScore, scorePct);
            
            // Try to extract time from metadata
            if (q.metadata && q.metadata.totalStudyTime) {
                // If it looks reasonable (not millions)
                if (q.metadata.totalStudyTime < 36000) {
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
            currentStreak: 1, // Reset to 1 to be safe, or fetch from streaks
            longestStreak: 1,
            bestQuizScore: maxScore,
            quizzesCompleted: quizzesCompleted,
            audioCompleted: audioCompleted,
            lastStudyDate: new Date().toISOString().split('T')[0]
        };

        console.log('Computed stats:', newStats);

        // 3. Update database
        await pool.query(
            `INSERT INTO user_progress (user_id, content_type, content_id, metadata)
             VALUES ($1, 'achievement_stats', 'global', $2)
             ON CONFLICT (user_id, content_type, content_id)
             DO UPDATE SET metadata = $2`,
            [userId, newStats]
        );

        console.log('Successfully repaired stats in cloud.');

    } catch (error) {
        console.error('Repair failed:', error);
    } finally {
        await pool.end();
    }
}

// Run for 'wiz'
repairStats('wiz');
