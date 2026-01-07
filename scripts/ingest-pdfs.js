/**
 * PDF Ingestion Script (JavaScript version)
 * Run with: node scripts/ingest-pdfs.js
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const { Pool } = require('pg');
const OpenAI = require('openai').default;

const BOOK_DIR = path.join(process.cwd(), 'public', 'uploads', 'Book');
const CHUNK_SIZE = 500;
const OVERLAP = 50;

// Database connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Railway requires SSL
    connectionTimeoutMillis: 10000,
});

// OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Chunk text into smaller pieces
function chunkText(text, chunkSize = 500, overlap = 50) {
    const words = text.split(/\s+/);
    const chunks = [];

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        if (chunk.trim().length > 0) {
            chunks.push(chunk);
        }
    }

    return chunks;
}

// Generate embeddings
async function generateEmbeddings(texts) {
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: texts,
    });

    return response.data.map(item => item.embedding);
}

// Store chunk in database
async function storeChunk(content, embedding, metadata) {
    const query = `
    INSERT INTO nclex_documents (content, embedding, metadata)
    VALUES ($1, $2, $3)
    RETURNING id
  `;

    const result = await pool.query(query, [content, JSON.stringify(embedding), metadata]);
    return result.rows[0].id;
}

// Process a single PDF
async function processPDF(filePath, fileName) {
    console.log(`\n📄 Processing: ${fileName}`);

    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        const text = data.text;

        console.log(`  ✓ Extracted ${text.length} characters`);

        const chunks = chunkText(text, CHUNK_SIZE, OVERLAP);
        console.log(`  ✓ Created ${chunks.length} chunks`);

        const batchSize = 10;
        let storedCount = 0;

        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const embeddings = await generateEmbeddings(batch);

            for (let j = 0; j < batch.length; j++) {
                await storeChunk(batch[j], embeddings[j], {
                    source: fileName,
                    chunkIndex: i + j,
                    totalChunks: chunks.length,
                });
                storedCount++;
            }

            console.log(`  ✓ Stored ${storedCount}/${chunks.length} chunks`);
        }

        return chunks.length;
    } catch (error) {
        console.error(`  ✗ Error processing ${fileName}:`, error.message);
        return 0;
    }
}

// Initialize database
async function initializeDatabase() {
    const createTable = `
    CREATE TABLE IF NOT EXISTS nclex_documents (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      metadata JSONB,
      embedding TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

    await pool.query(createTable);
    console.log('✅ Database initialized');
}

// Main function
async function main() {
    console.log('🚀 Starting PDF ingestion...\n');

    try {
        // Check environment variables
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL not set in .env.local');
        }
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY not set in .env.local');
        }

        // Initialize database
        console.log('📊 Initializing database...');
        await initializeDatabase();

        // Clear existing documents
        console.log('🗑️  Clearing existing documents...');
        await pool.query('DELETE FROM nclex_documents');

        // Get PDF files
        const files = fs.readdirSync(BOOK_DIR).filter(f => f.endsWith('.pdf'));
        console.log(`\n📚 Found ${files.length} PDF files\n`);

        // Process each PDF
        let totalChunks = 0;
        for (const file of files) {
            const filePath = path.join(BOOK_DIR, file);
            const chunks = await processPDF(filePath, file);
            totalChunks += chunks;
        }

        // Summary
        const result = await pool.query('SELECT COUNT(*) FROM nclex_documents');
        const finalCount = parseInt(result.rows[0].count);

        console.log(`\n✅ Ingestion complete!`);
        console.log(`   Total PDFs: ${files.length}`);
        console.log(`   Total chunks: ${finalCount}`);
        console.log(`\n🎉 Ready to use RAG-powered AI tutor!`);

        await pool.end();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Ingestion failed:', error.message);
        await pool.end();
        process.exit(1);
    }
}

main();
