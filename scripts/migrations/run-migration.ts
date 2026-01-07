import { Client } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
    // Use Railway database URL
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Connecting to database...');
        await client.connect();

        console.log('Running migration: 001_create_users_tables.sql');

        const sql = readFileSync(
            join(__dirname, '001_create_users_tables.sql'),
            'utf-8'
        );

        await client.query(sql);

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
        process.exit(0);
    }
}

runMigration();
