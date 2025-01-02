import { FileProcessor, UploadProgress, UploadResult } from '../types';
import { parsePDF } from '../../pdf/parser';
import { chunkText } from '../../text/chunker';
import { storeDocumentChunks } from '../../storage/vectorStore';

export class PDFProcessor implements FileProcessor {
  async process(
    file: File,
    onProgress: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Reading file
      onProgress({ stage: 'uploading', progress: 0, fileName: file.name });
      const buffer = await file.arrayBuffer();
      onProgress({ stage: 'uploading', progress: 100, fileName: file.name });

      // Parsing PDF
      onProgress({ stage: 'processing', progress: 0, fileName: file.name });
      const parseResult = await parsePDF(buffer);
      onProgress({ stage: 'processing', progress: 100, fileName: file.name });

      // Chunking text
      onProgress({ stage: 'embedding', progress: 0, fileName: file.name });
      const chunks = chunkText(parseResult.text);
      
      // Storing chunks with progress tracking
      onProgress({ stage: 'storing', progress: 0, fileName: file.name });
      let processedChunks = 0;
      
      await storeDocumentChunks(chunks, () => {
        processedChunks++;
        const progress = (processedChunks / chunks.length) * 100;
        onProgress({ stage: 'storing', progress, fileName: file.name });
      });

      return { 
        success: true,
        documentId: file.name // In production, use a proper UUID
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process PDF'
      };
    }
  }
}
