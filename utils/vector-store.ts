import pool from '@/lib/db';

export interface DocumentChunk {
  id: number;
  content: string;
  metadata: any;
  similarity?: number;
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
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
 * Note: Without pgvector, we fetch all and calculate similarity in-app
 * This works fine for small datasets (< 10k chunks)
 */
export async function searchSimilar(
  queryEmbedding: number[],
  limit: number = 5
): Promise<DocumentChunk[]> {
  // Fetch all documents
  const query = `SELECT id, content, metadata, embedding FROM nclex_documents`;
  const result = await pool.query(query);

  // Calculate similarity for each document
  const withSimilarity = result.rows.map(row => {
    const embedding = JSON.parse(row.embedding);
    const similarity = cosineSimilarity(queryEmbedding, embedding);

    return {
      id: row.id,
      content: row.content,
      metadata: row.metadata,
      similarity: similarity,
    };
  });

  // Sort by similarity (highest first) and return top N
  return withSimilarity
    .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
    .slice(0, limit);
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
 * Updated to work WITHOUT pgvector extension
 */
export async function initializeDatabase(): Promise<void> {
  const createTable = `
    CREATE TABLE IF NOT EXISTS nclex_documents (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      metadata JSONB,
      embedding TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;

  const createIndex = `
    CREATE INDEX IF NOT EXISTS nclex_documents_created_idx 
    ON nclex_documents (created_at);
  `;

  await pool.query(createTable);
  await pool.query(createIndex);

  console.log('✅ Database initialized successfully (using JSON embeddings)');
}
