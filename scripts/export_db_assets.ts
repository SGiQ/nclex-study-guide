
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function extractAssets() {
  const mindmapsDir = path.join(process.cwd(), 'public', 'uploads', 'mindmaps');
  const infographicsDir = path.join(process.cwd(), 'public', 'uploads', 'infographics');

  if (!fs.existsSync(mindmapsDir)) fs.mkdirSync(mindmapsDir, { recursive: true });
  if (!fs.existsSync(infographicsDir)) fs.mkdirSync(infographicsDir, { recursive: true });

  try {
    console.log('Extracting Mind Maps...');
    const mindmaps = await pool.query('SELECT id, file_name, file_data FROM mindmaps WHERE file_data IS NOT NULL');
    for (const mm of mindmaps.rows) {
      const filePath = path.join(mindmapsDir, mm.file_name || `mindmap-${mm.id}.png`);
      fs.writeFileSync(filePath, mm.file_data);
      console.log(`Saved: ${filePath}`);
    }

    console.log('\nExtracting Infographics...');
    const infographics = await pool.query('SELECT id, file_name, file_data FROM infographics WHERE file_data IS NOT NULL');
    for (const info of infographics.rows) {
      const filePath = path.join(infographicsDir, info.file_name || `infographic-${info.id}.png`);
      fs.writeFileSync(filePath, info.file_data);
      console.log(`Saved: ${filePath}`);
    }

    console.log('\nExtraction Complete!');
  } catch (err) {
    console.error('Extraction Error:', err);
  } finally {
    await pool.end();
  }
}

extractAssets();
