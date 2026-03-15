
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const episodesJsonStr = fs.readFileSync('app/data/episodes.json', 'utf8');
  const episodesJson = JSON.parse(episodesJsonStr);

  try {
    console.log('Starting DB sync...');

    // 1. Sync episodes table
    for (const ep of episodesJson) {
      const exists = await pool.query('SELECT id FROM episodes WHERE id = $1', [ep.id]);
      if (exists.rows.length > 0) {
        // Use correct column names: id, episode_number, title, description, duration, audio_url
        await pool.query(
          'UPDATE episodes SET title = $1, description = $2, duration = $3, audio_url = $4, episode_number = $5 WHERE id = $6', 
          [ep.title, ep.description, ep.duration, ep.audioUrl, ep.id, ep.id]
        );
        console.log(`Updated episode ${ep.id} in DB`);
      } else {
        await pool.query(
          'INSERT INTO episodes (id, title, description, duration, audio_url, episode_number) VALUES ($1, $2, $3, $4, $5, $6)', 
          [ep.id, ep.title, ep.description || '', ep.duration || 0, ep.audioUrl || '', ep.id]
        );
        console.log(`Inserted episode ${ep.id} in DB`);
      }
    }

    // 2. Fix Mindmaps mapping
    const ep17 = episodesJson.find(e => e.id === 17);
    await pool.query(
      'UPDATE mindmaps SET episode_id = 17, title = $1, file_name = $2 WHERE id = 23',
      [ep17.title + ' Mind Map', ep17.title + '.png']
    );
    console.log(`Re-mapped Mindmap 23 to Episode 17`);

    // 3. Insert Missing Episode 16 Mindmap in DB
    const ep16 = episodesJson.find(e => e.id === 16);
    // Check if it already exists to avoid duplicates
    const mindmapExists = await pool.query('SELECT id FROM mindmaps WHERE episode_id = 16');
    if (mindmapExists.rows.length === 0) {
        await pool.query(
          'INSERT INTO mindmaps (episode_id, title, file_name, nodes, edges) VALUES (16, $1, $2, \'[]\'::jsonb, \'[]\'::jsonb)',
          [ep16.title + ' Mind Map', ep16.title + '.png']
        );
        console.log(`Inserted Mindmap for Episode 16`);
    } else {
        console.log(`Mindmap for Episode 16 already exists (ID: ${mindmapExists.rows[0].id})`);
    }

    // 4. Update all Mindmap titles in DB to descriptive names
    for (const ep of episodesJson) {
      await pool.query(
        'UPDATE mindmaps SET title = $1, file_name = $2 WHERE episode_id = $3',
        [ep.title + ' Mind Map', ep.title + '.png', ep.id]
      );
    }
    console.log('Updated all mindmap titles in DB');

    // 5. Final Check - Get all mindmaps for JSON update
    const result = await pool.query('SELECT id, episode_id, title FROM mindmaps ORDER BY episode_id');
    const dbMindmaps = result.rows;

    // 6. Update mindmaps.json
    const mindmapsJson = dbMindmaps.map(m => ({
      id: m.id,
      episodeId: m.episode_id,
      title: m.title, // Now is descriptive
      fileName: m.title.replace(' Mind Map', '') + '.png',
      url: `/api/mindmaps/${m.id}/image`,
      uploadedAt: new Date().toISOString()
    }));

    fs.writeFileSync('app/data/mindmaps.json', JSON.stringify(mindmapsJson, null, 4));
    console.log('Updated app/data/mindmaps.json');

  } catch (err) {
    console.error('Sync Error:', err);
  } finally {
    await pool.end();
  }
}

run();
