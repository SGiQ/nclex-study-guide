import { NextRequest, NextResponse } from 'next/server';
import mammoth from 'mammoth';
import { generateEmbedding } from '@/utils/embeddings';
import { storeChunk, getDocumentCount } from '@/utils/vector-store';

/**
 * DOCX Upload and Processing Endpoint
 * POST /api/admin/upload-docx
 * 
 * Accepts DOCX files, extracts text, chunks it, generates embeddings, and stores in database
 */
export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.name.endsWith('.docx')) {
            return NextResponse.json({ error: 'Only DOCX files are supported' }, { status: 400 });
        }

        console.log(`Processing DOCX file: ${file.name}`);

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text from DOCX
        const result = await mammoth.extractRawText({ buffer });
        const text = result.value;

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: 'No text found in document' }, { status: 400 });
        }

        console.log(`Extracted ${text.length} characters from ${file.name}`);

        // Chunk the text (500 words per chunk, 50 word overlap)
        const chunks = chunkText(text, 500, 50);
        console.log(`Created ${chunks.length} chunks`);

        // Process chunks in batches
        const batchSize = 10;
        let storedCount = 0;

        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);

            // Generate embeddings and store each chunk
            for (let j = 0; j < batch.length; j++) {
                const chunkText = batch[j];
                const embedding = await generateEmbedding(chunkText);

                await storeChunk(chunkText, embedding, {
                    source: file.name,
                    chunkIndex: i + j,
                    totalChunks: chunks.length,
                    uploadedAt: new Date().toISOString(),
                });

                storedCount++;
            }

            console.log(`Stored ${storedCount}/${chunks.length} chunks`);
        }

        const totalDocs = await getDocumentCount();

        return NextResponse.json({
            success: true,
            message: `Successfully processed ${file.name}`,
            fileName: file.name,
            charactersExtracted: text.length,
            chunksCreated: chunks.length,
            chunksStored: storedCount,
            totalDocuments: totalDocs,
        });

    } catch (error: any) {
        console.error('DOCX processing error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to process DOCX file'
        }, { status: 500 });
    }
}

/**
 * Chunk text into smaller pieces with overlap
 */
function chunkText(text: string, chunkSize: number = 500, overlap: number = 50): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += chunkSize - overlap) {
        const chunk = words.slice(i, i + chunkSize).join(' ');
        if (chunk.trim().length > 0) {
            chunks.push(chunk);
        }
    }

    return chunks;
}
