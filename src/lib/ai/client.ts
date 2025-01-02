import { GeminiClient } from './gemini';
import { AIClient } from './types';

const client: AIClient = new GeminiClient();

export const {
  checkConnection: checkBackendConnection,
  getEmbedding,
  generateAnswer
} = client;
