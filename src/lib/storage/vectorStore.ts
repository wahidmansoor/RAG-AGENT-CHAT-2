import { supabase } from '../supabase';
import { getEmbedding } from '../ai/client';

export interface DocumentChunk {
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface SearchResult {
  content: string;
  metadata: Record<string, any>;
  similarity: number;
}

function formatEmbeddingForPostgres(embedding: number[]): string {
  return `[${embedding.join(',')}]`;
}

export async function storeDocumentChunks(
  chunks: DocumentChunk[],
  onProgress?: (chunkIndex: number) => void
): Promise<void> {
  const batchSize = 5;
  const batches = chunks.reduce((acc, chunk, i) => {
    const batchIndex = Math.floor(i / batchSize);
    if (!acc[batchIndex]) acc[batchIndex] = [];
    acc[batchIndex].push(chunk);
    return acc;
  }, [] as DocumentChunk[][]);

  let processedChunks = 0;
  
  for (const batch of batches) {
    const chunksWithEmbeddings = await Promise.all(
      batch.map(async (chunk) => {
        const embedding = await getEmbedding(chunk.content);
        processedChunks++;
        onProgress?.(processedChunks);
        
        return {
          content: chunk.content,
          metadata: chunk.metadata,
          embedding: formatEmbeddingForPostgres(embedding)
        };
      })
    );

    const { error } = await supabase
      .from('documents')
      .insert(chunksWithEmbeddings);

    if (error) {
      console.error('Storage error:', error);
      throw new Error('Failed to store document chunks');
    }
  }
}

export async function searchSimilarChunks(
  query: string,
  limit: number = 3,
  threshold: number = 0.7
): Promise<SearchResult[]> {
  const queryEmbedding = await getEmbedding(query);

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: formatEmbeddingForPostgres(queryEmbedding),
    match_threshold: threshold,
    match_count: limit,
  });

  if (error) {
    console.error('Search error:', error);
    throw new Error('Failed to search documents');
  }

  return data.map(result => ({
    content: result.content,
    metadata: result.metadata,
    similarity: result.similarity,
  }));
}
