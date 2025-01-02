import React, { useCallback, useRef, useState } from 'react';
import { Upload, AlertCircle, File } from 'lucide-react';
import { checkBackendConnection } from '../lib/ai/client';
import { UploadProgress } from './UploadProgress';
import { PDFProcessor } from '../lib/upload/processors/pdfProcessor';
import type { UploadProgress as UploadProgressType } from '../lib/upload/types';

const ACCEPTED_FILE_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
  'text/csv'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgressType | null>(null);
  const [isAIAvailable, setIsAIAvailable] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    checkBackendConnection()
      .then(setIsAIAvailable)
      .catch(() => setIsAIAvailable(false));
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      setError('Invalid file type. Please upload a supported file type.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const processor = new PDFProcessor();
      await processor.process(file, (progress) => {
        setUploadProgress(progress);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    files.forEach(handleFileUpload);
  }, [isUploading, handleFileUpload]);

  if (!isAIAvailable) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
          <div>
            <p className="text-sm text-yellow-700">
              AI service is not available. Please check your configuration and try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`
          relative border-2 border-dashed rounded-lg p-8
          transition-colors
          ${isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-500 cursor-pointer'}
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        {uploadProgress ? (
          <UploadProgress {...uploadProgress} />
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drop your files here, or click to select
              <br />
              <span className="text-xs text-gray-500">
                Supported formats: PDF, TXT, MD, JSON, CSV (max {MAX_FILE_SIZE / 1024 / 1024}MB)
              </span>
            </p>
          </div>
        )}

        {error && (
          <div className="mt-2 flex items-center justify-center text-sm text-red-500">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={ACCEPTED_FILE_TYPES.join(',')}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            files.forEach(handleFileUpload);
          }}
          disabled={isUploading}
        />
      </div>
    </div>
  );
}
