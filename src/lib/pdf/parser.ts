import { pdfService } from './service';
import type { PDFDocumentProxy } from 'pdfjs-dist';

export interface PDFParseResult {
  text: string;
  numPages: number;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
    creationDate?: Date;
    modificationDate?: Date;
  };
}

export async function parsePDF(buffer: ArrayBuffer): Promise<PDFParseResult> {
  try {
    // Load the PDF document
    const pdf: PDFDocumentProxy = await pdfService.getDocument({ data: buffer }).promise;
    
    // Get document metadata
    const metadata = await pdf.getMetadata();

    // Extract text from all pages
    const textContent: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items
        .map(item => 'str' in item ? item.str : '')
        .join(' ');
      textContent.push(pageText);
    }

    return {
      text: textContent.join('\n'),
      numPages: pdf.numPages,
      metadata: {
        title: metadata.info?.Title,
        author: metadata.info?.Author,
        subject: metadata.info?.Subject,
        keywords: metadata.info?.Keywords,
        creationDate: metadata.info?.CreationDate ? new Date(metadata.info.CreationDate) : undefined,
        modificationDate: metadata.info?.ModDate ? new Date(metadata.info.ModDate) : undefined,
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
