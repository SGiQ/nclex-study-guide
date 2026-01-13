import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listAndKill() {
    console.log('Connecting to DB (New Client)...');
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT pid, state, age(clock_timestamp(), query_start) as duration, query 
            FROM pg_stat_activity 
            WHERE state != 'idle' AND pid <> pg_backend_pid()
            ORDER BY duration DESC;
        `);

        if (res.rows.length === 0) {
            console.log('No active queries found.');
        } else {
            console.log('Active queries:');
            for (const r of res.rows) {
                console.log(`[${r.pid}] ${r.duration} - ${r.query}`);
                if (r.query.includes('ALTER TABLE') || r.query.includes('mindmaps')) {
                    console.log(`!!! KILLING PID ${r.pid} !!!`);
                    await client.query('SELECT pg_terminate_backend($1)', [r.pid]);
                }
            }
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await client.end();
    }
}

listAndKill();
