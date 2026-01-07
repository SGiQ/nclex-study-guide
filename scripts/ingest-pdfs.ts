/**
 * PDF Ingestion Script
 * 
 * This script processes all PDFs in /public/uploads/Book and stores them
 * in the PostgreSQL vector database for RAG retrieval.
 * 
 * Usage: npm run ingest-pdfs
 */

import fs from 'fs';
import path from 'path';
import { chunkText, generateEmbeddings } from '../utils/embeddings';
import { storeChunk, initializeDatabase, deleteAllDocuments, getDocumentCount } from '../utils/vector-store';

// Use require for pdf-parse due to CommonJS module
const pdf = require('pdf-parse');

const BOOK_DIR = path.join(process.cwd(), 'public', 'uploads', 'Book');
const CHUNK_SIZE = 500; // words per chunk
const OVERLAP = 50; // word overlap between chunks

async function processPDF(filePath: string, fileName: string) {
    console.log(`\n📄 Processing: ${fileName}`);

    try {
        // Read PDF
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        const text = data.text;

        console.log(`  ✓ Extracted ${text.length} characters`);

        // Split into chunks
        const chunks = chunkText(text, CHUNK_SIZE, OVERLAP);
        console.log(`  ✓ Created ${chunks.length} chunks`);

        // Generate embeddings in batches of 10
        const batchSize = 10;
        let storedCount = 0;

        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);
            const embeddings = await generateEmbeddings(batch);

            // Store each chunk with its embedding
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
        console.error(`  ✗ Error processing ${fileName}:`, error);
        return 0;
    }
}

async function main() {
    console.log('🚀 Starting PDF ingestion...\n');

    try {
        // Initialize database
        console.log('📊 Initializing database...');
        await initializeDatabase();

        // Clear existing documents
        console.log('🗑️  Clearing existing documents...');
        await deleteAllDocuments();

        // Get all PDF files
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
        const finalCount = await getDocumentCount();
        console.log(`\n✅ Ingestion complete!`);
        console.log(`   Total PDFs: ${files.length}`);
        console.log(`   Total chunks: ${finalCount}`);
        console.log(`\n🎉 Ready to use RAG-powered AI tutor!`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ Ingestion failed:', error);
        process.exit(1);
    }
}

main();
