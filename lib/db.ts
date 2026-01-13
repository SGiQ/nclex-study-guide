import { Pool } from 'pg';

// Create PostgreSQL connection pool
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // Increased from 2s to 30s
});

// Test connection
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
});

export default pool;
