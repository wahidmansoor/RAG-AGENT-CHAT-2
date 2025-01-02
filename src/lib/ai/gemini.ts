import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIClient } from './types';
import { configManager } from '../../config/env';

const config = configManager.getConfig();
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

export class GeminiClient implements AIClient {
  async checkConnection(): Promise<boolean> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      await model.generateContent("test");
      return true;
    } catch (error) {
      return false;
    }
  }

  async getEmbedding(text: string): Promise<number[]> {
    try {
      const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });
      const result = await embeddingModel.embedContent(text);
      const values = result.embedding.values;
      
      if (!Array.isArray(values)) {
        throw new Error('Invalid embedding format received from Gemini');
      }
      
      return values;
    } catch (error) {
      console.error('Embedding error:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  async generateAnswer(query: string, context: string): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Context: ${context}\n\nQuestion: ${query}\n\nAnswer the question based only on the provided context. If you cannot find the answer in the context, say so.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
