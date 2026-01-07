import pool from '@/lib/db';

export interface DocumentChunk {
    id: number;
    content: string;
    metadata: any;
    similarity?: number;
}

/**
 * Store a document chunk with its embedding
 */
export async function storeChunk(
    content: string,
    embedding: number[],
    metadata: any = {}
): Promise<number> {
    const query = `
    INSERT INTO nclex_documents (content, embedding, metadata)
    VALUES ($1, $2, $3)
    RETURNING id
  `;

    const result = await pool.query(query, [content, JSON.stringify(embedding), metadata]);
    return result.rows[0].id;
}

/**
 * Search for similar document chunks using cosine similarity
 */
export async function searchSimilar(
    queryEmbedding: number[],
    limit: number = 5
): Promise<DocumentChunk[]> {
    const query = `
    SELECT 
      id,
      content,
      metadata,
      1 - (embedding <=> $1::vector) as similarity
    FROM nclex_documents
    ORDER BY embedding <=> $1::vector
    LIMIT $2
  `;

    const result = await pool.query(query, [JSON.stringify(queryEmbedding), limit]);

    return result.rows.map(row => ({
        id: row.id,
        content: row.content,
        metadata: row.metadata,
        similarity: row.similarity,
    }));
}

/**
 * Delete all documents (for re-ingestion)
 */
export async function deleteAllDocuments(): Promise<void> {
    await pool.query('DELETE FROM nclex_documents');
}

/**
 * Get total document count
 */
export async function getDocumentCount(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) FROM nclex_documents');
    return parseInt(result.rows[0].count);
}

/**
 * Initialize database (create table if not exists)
 */
export async function initializeDatabase(): Promise<void> {
    const createExtension = `CREATE EXTENSION IF NOT EXISTS vector;`;

    const createTable = `
    CREATE TABLE IF NOT EXISTS nclex_documents (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      metadata JSONB,
      embedding vector(1536),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

    const createIndex = `
    CREATE INDEX IF NOT EXISTS nclex_documents_embedding_idx 
    ON nclex_documents 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
  `;

    await pool.query(createExtension);
    await pool.query(createTable);
    await pool.query(createIndex);

    console.log('✅ Database initialized successfully');
}
