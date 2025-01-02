import React from 'react';
import { AI_PROVIDERS } from '../lib/ai/providers';
import { AIBackend } from '../config/types';
import { getCurrentBackend, setAIBackend, checkBackendConnection } from '../lib/ai/client';
import { AlertCircle } from 'lucide-react';

export function AIBackendSelector() {
  const [selectedBackend, setSelectedBackend] = React.useState<AIBackend>(getCurrentBackend());
  const [isChecking, setIsChecking] = React.useState(false);
  const [status, setStatus] = React.useState<Record<AIBackend, boolean>>({
    ollama: false,
    lmStudio: false
  });

  const checkConnections = React.useCallback(async () => {
    setIsChecking(true);
    const results = await Promise.all(
      Object.keys(AI_PROVIDERS).map(async (backend) => {
        const isAvailable = await checkBackendConnection(backend as AIBackend);
        return [backend, isAvailable];
      })
    );
    
    setStatus(Object.fromEntries(results) as Record<AIBackend, boolean>);
    setIsChecking(false);
  }, []);

  React.useEffect(() => {
    checkConnections();
  }, [checkConnections]);

  const handleBackendChange = (backend: AIBackend) => {
    setSelectedBackend(backend);
    setAIBackend(backend);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">AI Backend</h2>
        <button
          onClick={checkConnections}
          disabled={isChecking}
          className="text-sm text-blue-500 hover:text-blue-600 disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Check Connection'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(Object.keys(AI_PROVIDERS) as AIBackend[]).map((backend) => {
          const provider = AI_PROVIDERS[backend];
          const isAvailable = status[backend];

          return (
            <div
              key={backend}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${selectedBackend === backend ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                hover:border-blue-300
              `}
              onClick={() => handleBackendChange(backend)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{provider.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              
              {!isAvailable && selectedBackend === backend && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-700">
                      <p className="font-medium mb-1">Setup Required:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {provider.setupInstructions.map((instruction, i) => (
                          <li key={i}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
