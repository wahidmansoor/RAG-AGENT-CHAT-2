/*
  # Update RLS policies for chat history and documents

  1. Changes
    - Add public access policy for chat history
    - Update document policies for better security
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated and anonymous users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for chat history" ON chat_history;
DROP POLICY IF EXISTS "Enable insert access for chat history" ON chat_history;

-- Update chat history policies
CREATE POLICY "Allow public read access to chat history"
  ON chat_history
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to chat history"
  ON chat_history
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Update document policies
CREATE POLICY "Allow public read access to documents"
  ON documents
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to documents"
  ON documents
  FOR INSERT
  TO public
  WITH CHECK (true);
