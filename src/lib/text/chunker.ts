interface Chunk {
  content: string;
  metadata: {
    startIndex: number;
    endIndex: number;
    pageNumber?: number;
    section?: string;
  };
}

const CHUNK_SIZE = 750; // Target size in tokens (approximately)
const OVERLAP = 100; // Overlap between chunks

export function chunkText(text: string, pageBreaks: number[] = []): Chunk[] {
  const chunks: Chunk[] = [];
  let currentIndex = 0;

  // Split into paragraphs
  const paragraphs = text.split(/\n\s*\n/);
  let currentChunk = '';
  let chunkStartIndex = 0;

  for (const paragraph of paragraphs) {
    // Estimate tokens (rough approximation: 4 chars = 1 token)
    const estimatedTokens = (currentChunk.length + paragraph.length) / 4;

    if (estimatedTokens > CHUNK_SIZE && currentChunk) {
      // Find page number based on character index
      const pageNumber = findPageNumber(chunkStartIndex, pageBreaks);
      
      chunks.push({
        content: currentChunk.trim(),
        metadata: {
          startIndex: chunkStartIndex,
          endIndex: currentIndex,
          pageNumber,
          section: detectSection(currentChunk),
        },
      });

      // Start new chunk with overlap
      const words = currentChunk.split(' ');
      currentChunk = words.slice(-OVERLAP).join(' ') + ' ' + paragraph;
      chunkStartIndex = currentIndex - currentChunk.length;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + paragraph;
    }

    currentIndex += paragraph.length + 2; // +2 for paragraph break
  }

  // Add final chunk
  if (currentChunk) {
    const pageNumber = findPageNumber(chunkStartIndex, pageBreaks);
    chunks.push({
      content: currentChunk.trim(),
      metadata: {
        startIndex: chunkStartIndex,
        endIndex: currentIndex,
        pageNumber,
        section: detectSection(currentChunk),
      },
    });
  }

  return chunks;
}

function findPageNumber(charIndex: number, pageBreaks: number[]): number {
  return pageBreaks.findIndex(breakPoint => charIndex < breakPoint) + 1;
}

function detectSection(text: string): string | undefined {
  // Simple section detection based on common patterns
  const lines = text.split('\n');
  for (const line of lines) {
    // Check for common header patterns (e.g., "1. Introduction", "Chapter 1:", etc.)
    if (/^(?:\d+\.|Chapter|Section)\s+\w+/i.test(line.trim())) {
      return line.trim();
    }
  }
  return undefined;
}
