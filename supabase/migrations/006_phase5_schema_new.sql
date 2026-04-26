-- PHASE 5 SCHEMA: New tables for ClawOps control plane
-- Creates NEW Phase 5 tables (existing tables kept with their original schema)
-- Created: 2026-04-26

-- ============================================================
-- 1. WORKSPACES
-- ============================================================
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. PLAN_CONFIG (static limits)
-- ============================================================
CREATE TABLE IF NOT EXISTS plan_config (
  plan TEXT PRIMARY KEY,
  max_agents INT,
  max_tools INT,
  max_channels INT,
  max_missions INT
);

INSERT INTO plan_config (plan, max_agents, max_tools, max_channels, max_missions)
VALUES
  ('personal', 1, 5, 2, 5),
  ('team', 3, 15, 5, 20),
  ('business', 8, 50, 10, -1)
ON CONFLICT (plan) DO UPDATE SET
  max_agents = EXCLUDED.max_agents,
  max_tools = EXCLUDED.max_tools,
  max_channels = EXCLUDED.max_channels,
  max_missions = EXCLUDED.max_missions;

-- ============================================================
-- 3. PHASE5_AGENTS (Phase 5 agents with workspace support)
-- Note: Existing `agents` table kept with original schema (user_id based)
-- This table provides workspace-based agent management
-- ============================================================
CREATE TABLE IF NOT EXISTS phase5_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT,
  provider TEXT DEFAULT 'custom-api-codemax-pro',
  model_id TEXT DEFAULT 'claude-sonnet-4-6',
  temperature FLOAT DEFAULT 0.7,
  max_tokens INT DEFAULT 8192,
  sync_status TEXT DEFAULT 'not_synced',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. CHAT_THREADS (Phase 5 version with workspace support)
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES phase5_agents(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 5. PHASE5_CHAT_MESSAGES (Phase 5 version with workspace support)
-- Note: Existing `chat_messages` table kept with original schema
-- ============================================================
CREATE TABLE IF NOT EXISTS phase5_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES phase5_agents(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 6. WORKSPACE_TOOLS
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,
  app_name TEXT NOT NULL,
  connected_account_id TEXT,
  connected BOOLEAN DEFAULT false,
  connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. WORKSPACE_CHANNEL_CREDENTIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS workspace_channel_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL CHECK (channel_type IN ('telegram', 'whatsapp', 'slack', 'discord')),
  label TEXT NOT NULL,
  token_encrypted TEXT,
  extra_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 8. AGENT_CHANNEL_ASSIGNMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_channel_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES phase5_agents(id) ON DELETE CASCADE,
  credential_id UUID REFERENCES workspace_channel_credentials(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 9. PHASE5_MISSIONS (Phase 5 version with workspace support)
-- Note: Existing `missions` table kept with original schema
-- ============================================================
CREATE TABLE IF NOT EXISTS phase5_missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES phase5_agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  parameters JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 10. MISSION_RUNS
-- ============================================================
CREATE TABLE IF NOT EXISTS mission_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission_id UUID REFERENCES phase5_missions(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES phase5_agents(id) ON DELETE CASCADE,
  status TEXT,
  output TEXT,
  error TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- 11. RUNTIME_NODES
-- ============================================================
CREATE TABLE IF NOT EXISTS runtime_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES phase5_agents(id) ON DELETE CASCADE,
  status TEXT,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 12. RUNTIME_SYNC_EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS runtime_sync_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  sync_type TEXT,
  status TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 13. Update subscriptions table with missing columns
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'plan') THEN
    ALTER TABLE subscriptions ADD COLUMN plan TEXT DEFAULT 'personal';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'status') THEN
    ALTER TABLE subscriptions ADD COLUMN status TEXT DEFAULT 'active';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'billing_cycle') THEN
    ALTER TABLE subscriptions ADD COLUMN billing_cycle TEXT DEFAULT 'monthly';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'agent_limit') THEN
    ALTER TABLE subscriptions ADD COLUMN agent_limit INT DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'tool_limit') THEN
    ALTER TABLE subscriptions ADD COLUMN tool_limit INT DEFAULT 5;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'channel_limit') THEN
    ALTER TABLE subscriptions ADD COLUMN channel_limit INT DEFAULT 2;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'mission_limit') THEN
    ALTER TABLE subscriptions ADD COLUMN mission_limit INT DEFAULT 5;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'next_billing_date') THEN
    ALTER TABLE subscriptions ADD COLUMN next_billing_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_workspaces_user ON workspaces(workspace_user_id);
CREATE INDEX IF NOT EXISTS idx_phase5_agents_workspace ON phase5_agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_phase5_agents_sync ON phase5_agents(sync_status);
CREATE INDEX IF NOT EXISTS idx_chat_threads_workspace ON chat_threads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_chat_threads_agent ON chat_threads(agent_id);
CREATE INDEX IF NOT EXISTS idx_phase5_chat_messages_thread ON phase5_chat_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_phase5_chat_messages_workspace ON phase5_chat_messages(workspace_id);
CREATE INDEX IF NOT EXISTS idx_phase5_chat_messages_created ON phase5_chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_workspace_tools_workspace ON workspace_tools(workspace_id);
CREATE INDEX IF NOT EXISTS idx_channel_credentials_workspace ON workspace_channel_credentials(workspace_id);
CREATE INDEX IF NOT EXISTS idx_channel_credentials_type ON workspace_channel_credentials(channel_type);
CREATE INDEX IF NOT EXISTS idx_agent_channel_assignments_agent ON agent_channel_assignments(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_channel_assignments_credential ON agent_channel_assignments(credential_id);
CREATE INDEX IF NOT EXISTS idx_phase5_missions_workspace ON phase5_missions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_phase5_missions_agent ON phase5_missions(agent_id);
CREATE INDEX IF NOT EXISTS idx_phase5_missions_status ON phase5_missions(status);
CREATE INDEX IF NOT EXISTS idx_mission_runs_mission ON mission_runs(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_runs_agent ON mission_runs(agent_id);
CREATE INDEX IF NOT EXISTS idx_runtime_nodes_workspace ON runtime_nodes(workspace_id);
CREATE INDEX IF NOT EXISTS idx_runtime_nodes_agent ON runtime_nodes(agent_id);
CREATE INDEX IF NOT EXISTS idx_runtime_sync_events_workspace ON runtime_sync_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_runtime_sync_events_created ON runtime_sync_events(created_at);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase5_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase5_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_channel_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_channel_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase5_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE runtime_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE runtime_sync_events ENABLE ROW LEVEL SECURITY;

-- Workspaces policies
CREATE POLICY "Users can view own workspaces" ON workspaces FOR SELECT USING (workspace_user_id = auth.uid());
CREATE POLICY "Users can insert own workspaces" ON workspaces FOR INSERT WITH CHECK (workspace_user_id = auth.uid());
CREATE POLICY "Users can update own workspaces" ON workspaces FOR UPDATE USING (workspace_user_id = auth.uid());
CREATE POLICY "Users can delete own workspaces" ON workspaces FOR DELETE USING (workspace_user_id = auth.uid());

-- Phase5_agents policies
CREATE POLICY "Users can view phase5_agents in own workspace" ON phase5_agents FOR SELECT USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can insert phase5_agents in own workspace" ON phase5_agents FOR INSERT WITH CHECK (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can update phase5_agents in own workspace" ON phase5_agents FOR UPDATE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can delete phase5_agents in own workspace" ON phase5_agents FOR DELETE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);

-- Chat_threads policies
CREATE POLICY "Users can view threads in own workspace" ON chat_threads FOR SELECT USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can insert threads in own workspace" ON chat_threads FOR INSERT WITH CHECK (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can update threads in own workspace" ON chat_threads FOR UPDATE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can delete threads in own workspace" ON chat_threads FOR DELETE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);

-- Phase5_chat_messages policies
CREATE POLICY "Users can view messages in own workspace" ON phase5_chat_messages FOR SELECT USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can insert messages in own workspace" ON phase5_chat_messages FOR INSERT WITH CHECK (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can update messages in own workspace" ON phase5_chat_messages FOR UPDATE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can delete messages in own workspace" ON phase5_chat_messages FOR DELETE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);

-- Workspace_tools policies
CREATE POLICY "Users can view tools in own workspace" ON workspace_tools FOR SELECT USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can insert tools in own workspace" ON workspace_tools FOR INSERT WITH CHECK (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can update tools in own workspace" ON workspace_tools FOR UPDATE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can delete tools in own workspace" ON workspace_tools FOR DELETE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);

-- Workspace_channel_credentials policies
CREATE POLICY "Users can view channels in own workspace" ON workspace_channel_credentials FOR SELECT USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can insert channels in own workspace" ON workspace_channel_credentials FOR INSERT WITH CHECK (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can update channels in own workspace" ON workspace_channel_credentials FOR UPDATE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can delete channels in own workspace" ON workspace_channel_credentials FOR DELETE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);

-- Agent_channel_assignments policies
CREATE POLICY "Users can view channel assignments in own workspace" ON agent_channel_assignments FOR SELECT USING (
  agent_id IN (SELECT id FROM phase5_agents WHERE workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid()))
);
CREATE POLICY "Users can insert channel assignments in own workspace" ON agent_channel_assignments FOR INSERT WITH CHECK (
  agent_id IN (SELECT id FROM phase5_agents WHERE workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid()))
);
CREATE POLICY "Users can update channel assignments in own workspace" ON agent_channel_assignments FOR UPDATE USING (
  agent_id IN (SELECT id FROM phase5_agents WHERE workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid()))
);
CREATE POLICY "Users can delete channel assignments in own workspace" ON agent_channel_assignments FOR DELETE USING (
  agent_id IN (SELECT id FROM phase5_agents WHERE workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid()))
);

-- Phase5_missions policies
CREATE POLICY "Users can view missions in own workspace" ON phase5_missions FOR SELECT USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can insert missions in own workspace" ON phase5_missions FOR INSERT WITH CHECK (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can update missions in own workspace" ON phase5_missions FOR UPDATE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can delete missions in own workspace" ON phase5_missions FOR DELETE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);

-- Mission_runs policies
CREATE POLICY "Users can view runs in own workspace" ON mission_runs FOR SELECT USING (
  agent_id IN (SELECT id FROM phase5_agents WHERE workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid()))
);
CREATE POLICY "Users can insert runs in own workspace" ON mission_runs FOR INSERT WITH CHECK (
  agent_id IN (SELECT id FROM phase5_agents WHERE workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid()))
);
CREATE POLICY "Users can update runs in own workspace" ON mission_runs FOR UPDATE USING (
  agent_id IN (SELECT id FROM phase5_agents WHERE workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid()))
);
CREATE POLICY "Users can delete runs in own workspace" ON mission_runs FOR DELETE USING (
  agent_id IN (SELECT id FROM phase5_agents WHERE workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid()))
);

-- Runtime_nodes policies
CREATE POLICY "Users can view nodes in own workspace" ON runtime_nodes FOR SELECT USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can insert nodes in own workspace" ON runtime_nodes FOR INSERT WITH CHECK (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can update nodes in own workspace" ON runtime_nodes FOR UPDATE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can delete nodes in own workspace" ON runtime_nodes FOR DELETE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);

-- Runtime_sync_events policies
CREATE POLICY "Users can view sync events in own workspace" ON runtime_sync_events FOR SELECT USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can insert sync events in own workspace" ON runtime_sync_events FOR INSERT WITH CHECK (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can update sync events in own workspace" ON runtime_sync_events FOR UPDATE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can delete sync events in own workspace" ON runtime_sync_events FOR DELETE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);

-- Plan_config policies (public read)
CREATE POLICY "Anyone can view plan config" ON plan_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage plan config" ON plan_config FOR ALL TO service_role USING (true);

SELECT 'Phase 5 schema complete' AS status;
