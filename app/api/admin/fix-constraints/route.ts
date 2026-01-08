import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

/**
 * Fix foreign key constraints - make episode_id nullable
 */
export async function GET() {
    try {
        // Drop and recreate foreign key constraints to allow NULL episode_id
        await pool.query(`
            -- Drop existing foreign key constraints
            ALTER TABLE mindmaps DROP CONSTRAINT IF EXISTS mindmaps_episode_id_fkey;
            ALTER TABLE infographics DROP CONSTRAINT IF EXISTS infographics_episode_id_fkey;
            ALTER TABLE slides DROP CONSTRAINT IF EXISTS slides_episode_id_fkey;
            ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_episode_id_fkey;
            ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_episode_id_fkey;

            -- Recreate with ON DELETE SET NULL to allow orphaned content
            ALTER TABLE mindmaps 
                ADD CONSTRAINT mindmaps_episode_id_fkey 
                FOREIGN KEY (episode_id) REFERENCES episodes(episode_number) 
                ON DELETE SET NULL;

            ALTER TABLE infographics 
                ADD CONSTRAINT infographics_episode_id_fkey 
                FOREIGN KEY (episode_id) REFERENCES episodes(episode_number) 
                ON DELETE SET NULL;

            ALTER TABLE slides 
                ADD CONSTRAINT slides_episode_id_fkey 
                FOREIGN KEY (episode_id) REFERENCES episodes(episode_number) 
                ON DELETE SET NULL;

            ALTER TABLE quizzes 
                ADD CONSTRAINT quizzes_episode_id_fkey 
                FOREIGN KEY (episode_id) REFERENCES episodes(episode_number) 
                ON DELETE SET NULL;

            ALTER TABLE flashcards 
                ADD CONSTRAINT flashcards_episode_id_fkey 
                FOREIGN KEY (episode_id) REFERENCES episodes(episode_number) 
                ON DELETE SET NULL;
        `);

        return NextResponse.json({
            success: true,
            message: 'Foreign key constraints fixed! You can now upload content without episode IDs.'
        });

    } catch (error) {
        console.error('Fix error:', error);
        return NextResponse.json({
            error: 'Failed to fix constraints',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
