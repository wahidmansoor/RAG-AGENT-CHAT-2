export interface AIResponse {
  text: string;
}

export interface EmbeddingResponse {
  embedding: number[];
}

export interface AIClient {
  checkConnection(): Promise<boolean>;
  getEmbedding(text: string): Promise<number[]>;
  generateAnswer(query: string, context: string): Promise<string>;
}
