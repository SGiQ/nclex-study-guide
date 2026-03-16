import { pool } from './lib/db';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log("USERS COLUMNS:", res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

main();
