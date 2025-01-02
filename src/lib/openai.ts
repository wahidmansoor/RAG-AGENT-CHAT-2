import OpenAI from 'openai';
import { configManager } from '../config/env';

const config = configManager.getConfig();
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
  dangerouslyAllowBrowser: true
});

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  
  return response.data[0].embedding;
}

export async function generateAnswer(
  query: string,
  context: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a helpful AI assistant that answers questions based on the provided context. Only use the information from the context to answer questions. If you cannot find the answer in the context, say so."
      },
      {
        role: "user",
        content: `Context: ${context}\n\nQuestion: ${query}`
      }
    ],
    temperature: 0.5,
    max_tokens: 500
  });

  return response.choices[0].message.content || "Sorry, I couldn't generate an answer.";
}
