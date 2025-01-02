export interface UploadProgress {
  stage: 'uploading' | 'processing' | 'embedding' | 'storing';
  progress: number;
  fileName: string;
}

export interface UploadResult {
  success: boolean;
  error?: string;
  documentId?: string;
}

export interface FileProcessor {
  process(file: File, onProgress: (progress: UploadProgress) => void): Promise<UploadResult>;
}
