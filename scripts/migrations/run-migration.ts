import { Client } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

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

        // Get all migration files in order
        const migrationFiles = readdirSync(__dirname)
            .filter(file => file.endsWith('.sql'))
            .sort();

        console.log(`Found ${migrationFiles.length} migration files`);

        for (const file of migrationFiles) {
            console.log(`\nRunning migration: ${file}`);

            const sql = readFileSync(
                join(__dirname, file),
                'utf-8'
            );

            await client.query(sql);
            console.log(`✅ ${file} completed successfully!`);
        }

        console.log('\n✅ All migrations completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await client.end();
        process.exit(0);
    }
}

runMigration();
