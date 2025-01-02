import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';

interface ErrorDisplayProps {
  title?: string;
  message: string;
}

export function ErrorDisplay({ 
  title = 'Configuration Required',
  message 
}: ErrorDisplayProps) {
  const isGeminiError = message.includes('VITE_GEMINI_API_KEY');

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>

          {isGeminiError ? (
            <div className="space-y-4">
              <p className="text-gray-600">To get started, you'll need to:</p>
              
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>
                  <a 
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 inline-flex items-center gap-1"
                  >
                    Get a Gemini API key from Google AI Studio
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </li>
                <li>Create a <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file in your project root</li>
                <li>Add your API key to the .env file:
                  <pre className="mt-2 bg-gray-100 p-3 rounded-md text-sm">
                    VITE_GEMINI_API_KEY=your_api_key_here
                  </pre>
                </li>
                <li>Restart the development server</li>
              </ol>

              <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-sm text-blue-700">
                  Need help? Check out the{' '}
                  <a 
                    href="https://ai.google.dev/tutorials/setup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-800"
                  >
                    Google AI documentation
                  </a>
                  {' '}for detailed setup instructions.
                </p>
              </div>
            </div>
          ) : (
            <pre className="text-gray-600 whitespace-pre-wrap">{message}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
