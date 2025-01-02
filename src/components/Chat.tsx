import React, { useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getEmbedding, generateAnswer } from '../lib/ai/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Get embedding for the query
      const queryEmbedding = await getEmbedding(userMessage);

      // Search for relevant documents
      const { data: relevantDocs } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 3
      });

      // Combine relevant documents into context
      const context = relevantDocs
        ?.map(doc => doc.content)
        .join('\n\n');

      // Generate answer using AI
      const answer = await generateAnswer(userMessage, context || '');

      // Save to chat history
      await supabase.from('chat_history').insert({
        user_query: userMessage,
        ai_response: answer,
        relevant_docs: relevantDocs?.map(doc => doc.id) || []
      });

      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
    } catch (error) {
      console.error('Error processing query:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
