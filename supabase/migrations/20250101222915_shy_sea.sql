/*
  # Update vector dimensions for Gemini embeddings

  1. Changes
    - Update documents table embedding column to use 768 dimensions (Gemini's embedding size)
    - Recreate match_documents function with new dimensions
  
  2. Notes
    - This is a non-destructive change that preserves existing data
    - The function is recreated to match the new dimension size
*/

-- Update the documents table embedding column
ALTER TABLE documents 
ALTER COLUMN embedding TYPE vector(768);

-- Recreate the match_documents function with new dimensions
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
