
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const titles = [
    'Test-Taking Strategies & Study Foundation',
    'Coordinated Care',
    'Safety & Infection Control',
    'Health Promotion & Maintenance',
    'Psychosocial Integrity',
    'Basic Care & Comfort',
    'Pharmacological & Parenteral Therapies',
    'Pharmacological Therapies Part 2',
    'Reduction of Risk: Cardiovascular & Diagnostics',
    'Reduction of Risk Potential Part 1',
    'Physiological Adaptation: Hematology & GI',
    'Physiological Adaptation: Renal & Musculoskeletal',
    'Physiological Adaptation: Metabolic & Integumentary',
    'Complex Care & Emergencies',
    'Practice Test Strategy',
    'Biological Mechanics of Pregnancy and Birth',
    'Final Readiness & Mental Strategy'
  ];

  try {
    console.log('Starting DB updates...');

    // 1. Update Ep 1-15 titles (IDs 8-22)
    for (let i = 0; i < 15; i++) {
        const episode_id = i + 1;
        const title = titles[i];
        const fileName = title + '.png';
        await pool.query(
            'UPDATE mindmaps SET title = $1, file_name = $2 WHERE episode_id = $3',
            [title, fileName, episode_id]
        );
        console.log(`Updated Episode ${episode_id}: ${title}`);
    }

    // 2. Fix Ep 17 (move from current ep_id 16, which is ID 23)
    const title17 = titles[16];
    const fileName17 = title17 + '.png';
    await pool.query(
        'UPDATE mindmaps SET episode_id = 17, title = $1, file_name = $2 WHERE id = 23',
        [title17, fileName17]
    );
    console.log(`Updated ID 23 to Episode 17: ${title17}`);

    // 3. Insert new Ep 16
    const title16 = titles[15];
    const fileName16 = title16 + '.png';
    await pool.query(
        'INSERT INTO mindmaps (episode_id, title, file_name, nodes, edges) VALUES (16, $1, $2, $3, $4)',
        [title16, fileName16, JSON.stringify([]), JSON.stringify([])]
    );
    console.log(`Inserted new Episode 16: ${title16}`);

    console.log('All updates completed successfully.');
  } catch (err) {
    console.error('Error during DB updates:', err);
  } finally {
    await pool.end();
  }
}

run();
