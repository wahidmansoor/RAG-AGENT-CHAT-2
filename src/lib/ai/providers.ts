import { AIProvider } from '../../config/types';

export const AI_PROVIDERS: Record<string, AIProvider> = {
  gemini: {
    name: 'Google Gemini',
    setupInstructions: [
      'Get an API key from Google AI Studio',
      'Add VITE_GEMINI_API_KEY to your .env file',
      'Restart the application'
    ]
  }
};
