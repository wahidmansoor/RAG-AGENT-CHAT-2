import { useState, useEffect } from 'react';
import { getConfig } from '../config/env';

export function useConfig() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      getConfig();
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred loading configuration';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { 
    error, 
    isLoading,
    isConfigured: !error 
  };
}
