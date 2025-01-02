import * as PDFJS from 'pdfjs-dist';

// Properly initialize the worker
const workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

PDFJS.GlobalWorkerOptions.workerSrc = workerSrc;

export const pdfService = PDFJS;
