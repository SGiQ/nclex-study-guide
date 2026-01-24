import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';
import { Pool } from 'pg';
dotenv.config({ path: '.env.local' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Running promo code migration via custom pool (SSL: false)...');
        await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS promo_code VARCHAR(50);
      CREATE INDEX IF NOT EXISTS idx_users_promo_code ON users(promo_code);
    `);
        console.log('✅ Migration applied successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
        writeFileSync('migration.log', `Migration failed: ${err}\n${JSON.stringify(err, null, 2)}`);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

run();
