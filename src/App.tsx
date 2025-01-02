import React from 'react';
import { FileUpload } from './components/FileUpload';
import { Chat } from './components/Chat';
import { ErrorDisplay } from './components/ErrorDisplay';
import { AIBackendSelector } from './components/AIBackendSelector';
import { useConfig } from './hooks/useConfig';

export default function App() {
  const { error, isLoading } = useConfig();

  if (isLoading) {
    return null;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-4">Document Upload</h1>
          <FileUpload />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 h-[600px]">
          <h1 className="text-2xl font-bold mb-4">Chat with Your Documents</h1>
          <Chat />
        </div>
      </div>
    </div>
  );
}
