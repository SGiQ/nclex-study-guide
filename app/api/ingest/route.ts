import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { chunkText, generateEmbeddings } from '@/utils/embeddings';
import { storeChunk, initializeDatabase, deleteAllDocuments, getDocumentCount } from '@/utils/vector-store';

const pdf = require('pdf-parse');

/**
 * PDF Ingestion API Endpoint
 * GET /api/ingest
 * 
 * This endpoint processes PDFs and stores them in the database
 * Run this from your deployed Railway app
 */
export async function GET(req: NextRequest) {
    const BOOK_DIR = path.join(process.cwd(), 'public', 'uploads', 'Book');
    const CHUNK_SIZE = 500;
    const OVERLAP = 50;

    try {
        console.log('🚀 Starting PDF ingestion...');

        // Initialize database
        await initializeDatabase();

        // Clear existing documents
        await deleteAllDocuments();

        // Get PDF files
        const files = fs.readdirSync(BOOK_DIR).filter(f => f.endsWith('.pdf'));
        console.log(`Found ${files.length} PDF files`);

        let totalChunks = 0;
        const results = [];

        // Process each PDF
        for (const file of files) {
            try {
                const filePath = path.join(BOOK_DIR, file);
                const dataBuffer = fs.readFileSync(filePath);
                const data = await pdf(dataBuffer);
                const text = data.text;

                const chunks = chunkText(text, CHUNK_SIZE, OVERLAP);

                // Process in batches
                const batchSize = 10;
                for (let i = 0; i < chunks.length; i += batchSize) {
                    const batch = chunks.slice(i, i + batchSize);
                    const embeddings = await generateEmbeddings(batch);

                    for (let j = 0; j < batch.length; j++) {
                        await storeChunk(batch[j], embeddings[j], {
                            source: file,
                            chunkIndex: i + j,
                            totalChunks: chunks.length,
                        });
                    }
                }

                totalChunks += chunks.length;
                results.push({ file, chunks: chunks.length, status: 'success' });

            } catch (error: any) {
                results.push({ file, error: error.message, status: 'failed' });
            }
        }

        const finalCount = await getDocumentCount();

        return NextResponse.json({
            success: true,
            message: 'PDF ingestion complete!',
            totalPDFs: files.length,
            totalChunks: finalCount,
            results
        });

    } catch (error: any) {
        console.error('Ingestion error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
