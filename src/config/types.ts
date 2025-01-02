export interface EnvConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  gemini: {
    apiKey: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  missingVars: string[];
}

export interface AIProvider {
  name: string;
  setupInstructions: string[];
}
