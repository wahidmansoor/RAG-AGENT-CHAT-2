import { EnvConfig } from './types';
import { validateEnvVars } from './validation';

class ConfigManager {
  private static instance: ConfigManager;
  private config: EnvConfig | null = null;

  private constructor() {}

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  getConfig(): EnvConfig {
    if (this.config) {
      return this.config;
    }

    const validation = validateEnvVars();
    
    if (!validation.isValid) {
      throw new Error(
        `Missing environment variables: ${validation.missingVars.join(', ')}\n` +
        'Please create a .env file with these variables. See .env.example for reference.'
      );
    }

    this.config = {
      supabase: {
        url: import.meta.env.VITE_SUPABASE_URL,
        anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      gemini: {
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
      }
    };

    return this.config;
  }
}

export const configManager = ConfigManager.getInstance();
export const getConfig = () => configManager.getConfig();
