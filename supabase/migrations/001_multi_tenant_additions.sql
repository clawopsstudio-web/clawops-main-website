-- Migration: Add multi-tenant columns for ClawOps Studio architecture
-- Date: 2026-05-05
-- Purpose: Add workspace-based columns and RLS policies

-- =============================================
-- 1. Add user_id to workspaces if not exists
-- =============================================
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS user_id uuid;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS logo_url text;
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS default_vps_id uuid;

-- =============================================
-- 2. Add workspace columns to vps_instances
-- =============================================
ALTER TABLE vps_instances ADD COLUMN IF NOT EXISTS workspace_id uuid;
ALTER TABLE vps_instances ADD COLUMN IF NOT EXISTS hermes_url text;
ALTER TABLE vps_instances ADD COLUMN IF NOT EXISTS hermes_token text;
ALTER TABLE vps_instances ADD COLUMN IF NOT EXISTS hci_url text;
ALTER TABLE vps_instances ADD COLUMN IF NOT EXISTS last_health_check timestamptz;
ALTER TABLE vps_instances ADD COLUMN IF NOT EXISTS health_error text;

-- =============================================
-- 3. Create workspace_agents table
-- =============================================
CREATE TABLE IF NOT EXISTS workspace_agents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL,
  name text NOT NULL,
  role text NOT NULL,
  model text,
  profile text DEFAULT 'default',
  status text DEFAULT 'inactive',
  system_prompt text,
  description text,
  color text DEFAULT '#6366f1',
  tools text[] DEFAULT '{}',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- =============================================
-- 4. Create activity_logs table
-- =============================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL,
  agent_id uuid,
  task_id uuid,
  type text NOT NULL,
  message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW()
);

-- =============================================
-- 5. Create chat_sessions table
-- =============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL,
  agent_id uuid,
  hermes_session_id text,
  title text,
  last_message text,
  message_count integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- =============================================
-- 6. Create tools table
-- =============================================
CREATE TABLE IF NOT EXISTS tools (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  icon text,
  category text,
  config_schema jsonb DEFAULT '{}',
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT NOW()
);

-- Seed default tools
INSERT INTO tools (name, display_name, description, icon, category) VALUES
  ('gmail', 'Gmail', 'Send and receive emails via Gmail', '📧', 'communication'),
  ('calendar', 'Google Calendar', 'Manage calendar events', '📅', 'productivity'),
  ('github', 'GitHub', 'Manage repositories and issues', '🐙', 'development'),
  ('notion', 'Notion', 'Read and write to Notion', '📝', 'productivity'),
  ('slack', 'Slack', 'Send messages to Slack', '💬', 'communication'),
  ('websearch', 'Web Search', 'Search the web', '🔍', 'information'),
  ('browser', 'Browser', 'Automate web browser actions', '🌐', 'automation'),
  ('terminal', 'Terminal', 'Execute shell commands', '💻', 'development')
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- 7. Create agent_tools table
-- =============================================
CREATE TABLE IF NOT EXISTS agent_tools (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL,
  tool_id uuid NOT NULL,
  config jsonb DEFAULT '{}',
  enabled boolean DEFAULT true,
  UNIQUE(agent_id, tool_id)
);

-- =============================================
-- 8. Create plugins table
-- =============================================
CREATE TABLE IF NOT EXISTS plugins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  icon text,
  category text,
  price integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  config_schema jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT NOW()
);

-- =============================================
-- 9. Create workspace_plugins table
-- =============================================
CREATE TABLE IF NOT EXISTS workspace_plugins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL,
  plugin_id uuid NOT NULL,
  status text DEFAULT 'installed',
  config jsonb DEFAULT '{}',
  installed_at timestamptz DEFAULT NOW(),
  UNIQUE(workspace_id, plugin_id)
);

-- =============================================
-- 10. Create api_keys table
-- =============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id uuid NOT NULL,
  name text NOT NULL,
  key_hash text NOT NULL,
  last_used timestamptz,
  expires_at timestamptz,
  created_at timestamptz DEFAULT NOW()
);

-- =============================================
-- 11. Add workspace_id to tasks
-- =============================================
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS workspace_id uuid;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS agent_id uuid;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority text DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS hermes_session_id text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS result jsonb;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS error text;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- =============================================
-- 12. Enable RLS on new tables
-- =============================================
ALTER TABLE workspace_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 13. Create RLS policies
-- =============================================

-- workspace_agents policies
CREATE POLICY "workspace_agents_select" ON workspace_agents FOR SELECT USING (true);
CREATE POLICY "workspace_agents_all" ON workspace_agents FOR ALL USING (true);

-- activity_logs policies
CREATE POLICY "activity_logs_select" ON activity_logs FOR SELECT USING (true);
CREATE POLICY "activity_logs_insert" ON activity_logs FOR INSERT WITH CHECK (true);

-- chat_sessions policies
CREATE POLICY "chat_sessions_select" ON chat_sessions FOR SELECT USING (true);
CREATE POLICY "chat_sessions_all" ON chat_sessions FOR ALL USING (true);

-- tools policies
CREATE POLICY "tools_select" ON tools FOR SELECT USING (true);

-- agent_tools policies
CREATE POLICY "agent_tools_select" ON agent_tools FOR SELECT USING (true);
CREATE POLICY "agent_tools_all" ON agent_tools FOR ALL USING (true);

-- plugins policies
CREATE POLICY "plugins_select" ON plugins FOR SELECT USING (true);

-- workspace_plugins policies
CREATE POLICY "workspace_plugins_all" ON workspace_plugins FOR ALL USING (true);

-- api_keys policies
CREATE POLICY "api_keys_select" ON api_keys FOR SELECT USING (true);
CREATE POLICY "api_keys_all" ON api_keys FOR ALL USING (true);

-- =============================================
-- 14. Create indexes
-- =============================================
CREATE INDEX IF NOT EXISTS idx_workspace_agents_workspace_id ON workspace_agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_workspace_id ON activity_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(type);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_workspace_id ON chat_sessions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_tasks_workspace_id ON tasks(workspace_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_workspace_id ON api_keys(workspace_id);

-- =============================================
-- 15. Create helper function
-- =============================================
CREATE OR REPLACE FUNCTION log_activity(
  p_workspace_id uuid,
  p_type text,
  p_message text,
  p_agent_id uuid DEFAULT NULL,
  p_task_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO activity_logs (workspace_id, agent_id, task_id, type, message, metadata)
  VALUES (p_workspace_id, p_agent_id, p_task_id, p_type, p_message, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
