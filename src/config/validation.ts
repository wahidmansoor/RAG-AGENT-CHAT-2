import { ValidationResult } from './types';

const REQUIRED_VARS = {
  VITE_SUPABASE_URL: 'Supabase URL',
  VITE_SUPABASE_ANON_KEY: 'Supabase Anonymous Key',
  VITE_GEMINI_API_KEY: 'Google Gemini API Key'
} as const;

export function validateEnvVars(): ValidationResult {
  const missingVars = Object.entries(REQUIRED_VARS)
    .filter(([key]) => !import.meta.env[key])
    .map(([key]) => key);

  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}
