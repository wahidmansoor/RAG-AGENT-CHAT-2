import React from 'react';
import { Loader2 } from 'lucide-react';

export interface UploadProgressProps {
  stage: 'uploading' | 'processing' | 'embedding' | 'storing';
  progress: number;
  fileName: string;
}

export function UploadProgress({ stage, progress, fileName }: UploadProgressProps) {
  const stages = {
    uploading: 'Uploading file...',
    processing: 'Processing content...',
    embedding: 'Generating embeddings...',
    storing: 'Storing in database...'
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{stages[stage]}</span>
        </div>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-xs text-gray-500 truncate">
        {fileName}
      </p>
    </div>
  );
}
