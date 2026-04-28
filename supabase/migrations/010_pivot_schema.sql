-- =============================================
-- CLAWOPS STUDIO - NEW SCHEMA (Pivot 2026-04-28)
-- Hermes Control Interface + Composio Integration
-- =============================================

-- =============================================
-- 1. PROFILES (Cleaned up)
-- =============================================

-- Add missing columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending_payment'
  CHECK (status IN ('pending_payment', 'paid', 'provisioning', 'active', 'suspended', 'cancelled', 'abandoned')),
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'personal'
  CHECK (plan IN ('personal', 'team', 'business')),
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS dashboard_slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

-- Clean up old plan values
UPDATE public.profiles SET plan = 'personal' WHERE plan IN ('power', 'enterprise');
UPDATE public.profiles SET plan = 'personal' WHERE plan IS NULL;

-- =============================================
-- 2. SUBSCRIPTIONS (New structure)
-- ==============================================

-- Update existing subscriptions table structure
ALTER TABLE public.subscriptions
  DROP COLUMN IF EXISTS paypal_subscription_id,
  DROP COLUMN IF EXISTS paypal_customer_id,
  ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
  ADD COLUMN IF NOT EXISTS max_agents INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS max_tool_calls_monthly INTEGER DEFAULT 20000,
  ADD COLUMN IF NOT EXISTS max_tokens_monthly INTEGER DEFAULT 0,
  ALTER COLUMN plan TYPE TEXT USING plan::TEXT;

-- =============================================
-- 3. VPS_INSTANCES (Cleaned up)
-- =============================================

ALTER TABLE public.vps_instances
  ADD COLUMN IF NOT EXISTS dashboard_url TEXT,
  ADD COLUMN IF NOT EXISTS provisioning_step TEXT DEFAULT 'provisioning'
  CHECK (provisioning_step IN ('creating', 'installing', 'configuring', 'ready')),
  ADD COLUMN IF NOT EXISTS provisioned_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_heartbeat_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{"ram_gb": 8, "ssd_gb": 100, "vcpus": 2}';

-- =============================================
-- 4. INTEGRATIONS (NEW - Composio connected apps)
-- =============================================

CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Integration
  provider TEXT NOT NULL,  -- 'gmail', 'slack', 'github', etc.
  display_name TEXT,
  
  -- Composio
  composio_connection_id TEXT,
  composio_auth_config_id TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'connected'
  CHECK (status IN ('connected', 'disconnected', 'error', 'pending')),
  
  -- OAuth tokens (encrypted!)
  access_token_encrypted TEXT,
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Usage
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint: one connection per provider per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_integrations_user_provider 
  ON public.integrations(user_id, provider);

-- RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own integrations" ON public.integrations
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- 5. USAGE_LOGS (NEW - Track for billing)
-- =============================================

CREATE TABLE IF NOT EXISTS public.usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Type
  type TEXT NOT NULL CHECK (type IN ('tool_call', 'token', 'api_request')),
  
  -- Details
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  
  -- Quantity
  quantity INTEGER NOT NULL DEFAULT 1,
  cost_usd NUMERIC(10, 6) DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Billing period
  billing_period_start TIMESTAMPTZ NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast monthly aggregation
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_period 
  ON public.usage_logs(user_id, billing_period_start);

-- RLS
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own usage" ON public.usage_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert usage" ON public.usage_logs
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 6. AGENT_CONFIGS (Renamed from agent_instances)
-- =============================================

-- Rename agent_instances to agent_configs
-- If agent_instances exists, rename it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'agent_instances'
  ) THEN
    -- Copy data to new structure
    INSERT INTO public.agent_configs (id, user_id, name, role, config, created_at, updated_at)
    SELECT 
      id,
      COALESCE(user_id::UUID, '00000000-0000-0000-0000-000000000000'::UUID),
      agent_name,
      agent_role,
      COALESCE(config, '{}'::JSONB),
      created_at,
      updated_at
    FROM public.agent_instances
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- Make agent_configs the main table
ALTER TABLE public.agent_configs
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS hci_profile_name TEXT,
  ADD COLUMN IF NOT EXISTS system_prompt TEXT;

-- =============================================
-- 7. PROVISIONING_LOGS (Enhanced)
-- =============================================

ALTER TABLE public.provisioning_logs
  ADD COLUMN IF NOT EXISTS step TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('success', 'failed', 'pending')),
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- =============================================
-- 8. CLEAN UP OLD TABLES
-- =============================================

-- Mark these for deletion after migration
-- Don't drop yet - might need data

-- user_skills (replaced by Composio)
-- mission_logs (replaced by simpler tracking)
-- onboarding_submissions (integrate into profiles)
-- logs (minimal logging)
-- user_model_config (move to agent_configs)
-- installed_mcp_servers (replaced by integrations)

-- =============================================
-- 9. HELPER FUNCTIONS
-- =============================================

-- Function to get current billing period start
CREATE OR REPLACE FUNCTION public.get_billing_period_start()
RETURNS TIMESTAMPTZ AS $$
BEGIN
  RETURN date_trunc('month', NOW());
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if user is within plan limits
CREATE OR REPLACE FUNCTION public.check_usage_limit(
  p_user_id UUID,
  p_usage_type TEXT,
  p_quantity INTEGER DEFAULT 1
)
RETURNS JSONB AS $$
DECLARE
  v_plan TEXT;
  v_max_calls INTEGER;
  v_used_calls INTEGER;
  v_result JSONB;
BEGIN
  -- Get user's plan
  SELECT plan INTO v_plan FROM public.profiles WHERE id = p_user_id;
  
  -- Get limits based on plan
  v_max_calls := CASE v_plan
    WHEN 'personal' THEN 20000
    WHEN 'team' THEN 200000
    WHEN 'business' THEN 200000
    ELSE 20000
  END;
  
  -- Get current usage
  SELECT COALESCE(SUM(quantity), 0) INTO v_used_calls
  FROM public.usage_logs
  WHERE user_id = p_user_id
    AND type = p_usage_type
    AND billing_period_start = public.get_billing_period_start();
  
  -- Check if within limit
  IF v_used_calls + p_quantity > v_max_calls AND v_max_calls > 0 THEN
    v_result := jsonb_build_object(
      'allowed', false,
      'used', v_used_calls,
      'limit', v_max_calls,
      'remaining', GREATEST(0, v_max_calls - v_used_calls)
    );
  ELSE
    v_result := jsonb_build_object(
      'allowed', true,
      'used', v_used_calls,
      'limit', v_max_calls,
      'remaining', CASE WHEN v_max_calls > 0 THEN v_max_calls - v_used_calls ELSE -1 END
    );
  END IF;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 10. AUTO-UPDATE TIMESTAMPS
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS subscriptions_updated_at ON public.subscriptions;
CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS vps_instances_updated_at ON public.vps_instances;
CREATE TRIGGER vps_instances_updated_at
  BEFORE UPDATE ON public.vps_instances
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS integrations_updated_at ON public.integrations;
CREATE TRIGGER integrations_updated_at
  BEFORE UPDATE ON public.integrations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- 11. INDEXES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_vps_instances_user_id ON public.vps_instances(user_id);
CREATE INDEX IF NOT EXISTS idx_vps_instances_status ON public.vps_instances(status);
CREATE INDEX IF NOT EXISTS idx_integrations_user_id ON public.integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_configs_user_id ON public.agent_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_provisioning_logs_user_id ON public.provisioning_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_provisioning_logs_created ON public.provisioning_logs(created_at DESC);

-- =============================================
-- 12. GRANT PERMISSIONS
-- =============================================

-- Ensure service role can do everything
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.subscriptions TO service_role;
GRANT ALL ON public.vps_instances TO service_role;
GRANT ALL ON public.integrations TO service_role;
GRANT ALL ON public.usage_logs TO service_role;
GRANT ALL ON public.agent_configs TO service_role;
GRANT ALL ON public.provisioning_logs TO service_role;

-- =============================================
-- DONE
-- =============================================
