
import { pool } from '../lib/db';

console.log('Successfully imported pool');
console.log('Database URL exists:', !!process.env.DATABASE_URL);

// Attempt a simple query (optional, but good to test connectivity)
// We won't await it to avoid hanging, just want to ensure init doesn't crash.
// Actually, let's try to close it immediately.
pool.end().then(() => console.log('Pool closed'));
