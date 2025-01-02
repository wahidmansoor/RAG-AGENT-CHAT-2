/*
  # RAG AI Agent Schema Setup

  1. New Tables
    - `documents`
      - `id` (uuid, primary key)
      - `content` (text, document content)
      - `metadata` (jsonb, document metadata)
      - `embedding` (vector(1536), OpenAI embedding)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `chat_history`
      - `id` (uuid, primary key)
      - `user_query` (text, user's question)
      - `ai_response` (text, AI's response)
      - `created_at` (timestamp)
      - `relevant_docs` (jsonb, list of relevant document IDs)

  2. Extensions
    - Enable vector extension for similarity search
    - Create function for vector similarity search

  3. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Enable the vector extension
create extension if not exists vector;

-- Create documents table
create table if not exists documents (
    id uuid primary key default gen_random_uuid(),
    content text not null,
    metadata jsonb default '{}'::jsonb,
    embedding vector(1536),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create chat history table
create table if not exists chat_history (
    id uuid primary key default gen_random_uuid(),
    user_query text not null,
    ai_response text not null,
    relevant_docs jsonb default '[]'::jsonb,
    created_at timestamptz default now()
);

-- Create function to search documents by embedding similarity
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- Enable RLS
alter table documents enable row level security;
alter table chat_history enable row level security;

-- Create policies
create policy "Enable read access for authenticated users"
  on documents for select
  to authenticated
  using (true);

create policy "Enable insert access for authenticated users"
  on documents for insert
  to authenticated
  with check (true);

create policy "Enable read access for chat history"
  on chat_history for select
  to authenticated
  using (true);

create policy "Enable insert access for chat history"
  on chat_history for insert
  to authenticated
  with check (true);
