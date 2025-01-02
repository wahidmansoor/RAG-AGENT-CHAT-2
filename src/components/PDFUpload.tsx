import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import { processPDFDocument, ProcessingProgress } from '../lib/pdf/processor';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for PDFs

export function PDFUpload() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProcessingProgress | null>(null);

  const processFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are supported');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const result = await processPDFDocument(file, setProgress);
      
      console.log(`Processed PDF: ${result.chunks} chunks across ${result.pages} pages`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(processFile);
  }, [processFile, isProcessing]);

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center 
        transition-colors
        ${isProcessing ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}
        ${error ? 'border-red-300 bg-red-50' : ''}
      `}
    >
      {isProcessing ? (
        <div className="space-y-4">
          <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
          {progress && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-600 capitalize">
                {progress.stage}...
              </p>
              <div className="w-full bg-blue-100 rounded-full h-2.5">
                <div 
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(progress.progress / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Drop your PDF here, or click to select
            <br />
            <span className="text-xs text-gray-500">
              Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB
            </span>
          </p>
        </>
      )}

      {error && (
        <div className="mt-2 flex items-center justify-center text-sm text-red-500">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}

      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept="application/pdf"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          files.forEach(processFile);
        }}
        disabled={isProcessing}
      />
    </div>
  );
}
