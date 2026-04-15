-- Chat messages table for persisting AI chat history per user per agent
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own chat messages" ON chat_messages
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read their own chat messages" ON chat_messages
  FOR SELECT USING (auth.uid() = user_id);

-- Index for fast per-agent message loading
CREATE INDEX IF NOT EXISTS chat_messages_user_agent_idx
  ON chat_messages (user_id, agent_id, created_at ASC);

-- Function to get chat history for a user + agent
CREATE OR REPLACE FUNCTION get_chat_history(
  p_user_id UUID,
  p_agent_id TEXT,
  p_limit INTEGER DEFAULT 100
) RETURNS TABLE (
  id UUID,
  agent_id TEXT,
  role TEXT,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cm.id,
    cm.agent_id,
    cm.role,
    cm.content,
    cm.metadata,
    cm.created_at
  FROM chat_messages cm
  WHERE cm.user_id = p_user_id AND cm.agent_id = p_agent_id
  ORDER BY cm.created_at ASC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
