import { parsePDF, PDFParseResult } from './parser';
import { chunkText } from '../text/chunker';
import { storeDocumentChunks, DocumentChunk } from '../storage/vectorStore';

export interface ProcessingProgress {
  stage: 'parsing' | 'chunking' | 'embedding' | 'storing';
  progress: number;
  total: number;
}

export interface ProcessingResult {
  documentId: string;
  chunks: number;
  pages: number;
}

export async function processPDFDocument(
  file: File,
  onProgress?: (progress: ProcessingProgress) => void
): Promise<ProcessingResult> {
  try {
    // Read file
    const buffer = await file.arrayBuffer();
    
    // Parse PDF
    onProgress?.({ stage: 'parsing', progress: 0, total: 100 });
    const parseResult = await parsePDF(buffer);
    onProgress?.({ stage: 'parsing', progress: 100, total: 100 });

    // Chunk text
    onProgress?.({ stage: 'chunking', progress: 0, total: 100 });
    const chunks = chunkText(parseResult.text);
    onProgress?.({ stage: 'chunking', progress: 100, total: 100 });

    // Store chunks with embeddings
    onProgress?.({ stage: 'storing', progress: 0, total: chunks.length });
    
    const documentChunks: DocumentChunk[] = chunks.map(chunk => ({
      content: chunk.content,
      metadata: {
        ...chunk.metadata,
        filename: file.name,
        mimeType: file.type,
        documentMetadata: parseResult.metadata,
        timestamp: new Date().toISOString(),
      },
    }));

    await storeDocumentChunks(documentChunks);
    onProgress?.({ stage: 'storing', progress: chunks.length, total: chunks.length });

    return {
      documentId: file.name, // In production, use UUID
      chunks: chunks.length,
      pages: parseResult.numPages,
    };
  } catch (error) {
    throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
