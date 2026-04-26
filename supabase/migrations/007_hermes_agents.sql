-- HERMES AGENTS: Per-workspace Hermes gateway agent configurations
-- Each workspace can have up to 3 agents (Ryan, Arjun, Tyler) with isolated Telegram bots
-- Created: 2026-04-27

-- ============================================================
-- HERMES_AGENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS hermes_agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (name IN ('Ryan', 'Arjun', 'Tyler')),
  role TEXT NOT NULL CHECK (role IN ('Sales', 'Research', 'Marketing')),
  telegram_bot_token_encrypted TEXT,
  provider TEXT DEFAULT 'groq' CHECK (provider IN ('groq', 'codemax')),
  model_id TEXT DEFAULT 'llama-3.3-70b-versatile',
  system_prompt TEXT,
  tool_permissions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  deployed_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'not_deployed' CHECK (sync_status IN ('not_deployed', 'pending', 'deployed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, name)
);

-- ============================================================
-- HERMES_DEPLOYMENT_HISTORY (audit log)
-- ============================================================
CREATE TABLE IF NOT EXISTS hermes_deployment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES hermes_agents(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('deploy', 'update', 'rollback', 'restart', 'delete')),
  status TEXT NOT NULL CHECK (status IN ('started', 'success', 'failed')),
  details JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_hermes_agents_workspace ON hermes_agents(workspace_id);
CREATE INDEX IF NOT EXISTS idx_hermes_agents_sync_status ON hermes_agents(sync_status);
CREATE INDEX IF NOT EXISTS idx_hermes_agents_active ON hermes_agents(workspace_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_deployment_history_workspace ON hermes_deployment_history(workspace_id);
CREATE INDEX IF NOT EXISTS idx_deployment_history_created ON hermes_deployment_history(created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE hermes_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE hermes_deployment_history ENABLE ROW LEVEL SECURITY;

-- hermes_agents: Users can only access agents in their own workspaces
CREATE POLICY "Users can view agents in own workspace" ON hermes_agents FOR SELECT USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can insert agents in own workspace" ON hermes_agents FOR INSERT WITH CHECK (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can update agents in own workspace" ON hermes_agents FOR UPDATE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can delete agents in own workspace" ON hermes_agents FOR DELETE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);

-- hermes_deployment_history: Same workspace-based access
CREATE POLICY "Users can view deployment history in own workspace" ON hermes_deployment_history FOR SELECT USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can insert deployment history in own workspace" ON hermes_deployment_history FOR INSERT WITH CHECK (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);
CREATE POLICY "Users can update deployment history in own workspace" ON hermes_deployment_history FOR UPDATE USING (
  workspace_id IN (SELECT id FROM workspaces WHERE workspace_user_id = auth.uid())
);

-- Service role can do everything (for backend operations)
CREATE POLICY "Service role can manage hermes agents" ON hermes_agents FOR ALL TO service_role USING (true);
CREATE POLICY "Service role can manage deployment history" ON hermes_deployment_history FOR ALL TO service_role USING (true);

-- ============================================================
-- HELPER FUNCTION: Default system prompts per role
-- ============================================================
CREATE OR REPLACE FUNCTION get_default_system_prompt(agent_role TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE agent_role
    WHEN 'Sales' THEN 'You are Ryan, an expert sales AI agent. You help businesses close deals, nurture leads, and drive revenue growth. Be proactive, persistent, and results-oriented. Always focus on value creation and next steps.'
    WHEN 'Research' THEN 'You are Arjun, a meticulous research AI agent. You gather, analyze, and synthesize information to provide actionable insights. Be thorough, cite sources, and present findings clearly. Always verify information before presenting it.'
    WHEN 'Marketing' THEN 'You are Tyler, a creative marketing AI agent. You develop content strategies, craft compelling copy, and analyze campaign performance. Be creative yet strategic. Focus on brand voice, audience engagement, and measurable outcomes.'
    ELSE 'You are a helpful AI assistant.'
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- TRIGGER: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_hermes_agents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER tr_hermes_agents_updated_at
  BEFORE UPDATE ON hermes_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_hermes_agents_updated_at();

SELECT 'Hermes agents migration complete' AS status;
