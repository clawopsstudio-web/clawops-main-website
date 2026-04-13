-- VPS Instances table for multi-tenant dashboard
CREATE TABLE IF NOT EXISTS public.vps_instances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tunnel_url TEXT NOT NULL,
  status TEXT DEFAULT 'online' CHECK (status IN ('online','offline','provisioning')),
  last_heartbeat TIMESTAMPTZ,
  vps_ip TEXT,
  specs JSONB DEFAULT '{"cpu":"","ram_mb":0,"disk_gb":0}'::jsonb,
  openclaw_version TEXT,
  agent_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.vps_instances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own VPS instances" ON public.vps_instances
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own VPS instances" ON public.vps_instances
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own VPS instances" ON public.vps_instances
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own VPS instances" ON public.vps_instances
  FOR DELETE USING (auth.uid() = user_id);

-- Heartbeat function to update last_seen and status
CREATE OR REPLACE FUNCTION public.update_vps_heartbeat(
  p_id UUID,
  p_status TEXT DEFAULT 'online',
  p_openclaw_version TEXT DEFAULT NULL,
  p_agent_count INTEGER DEFAULT NULL,
  p_specs JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE public.vps_instances SET
    last_heartbeat = now(),
    status = p_status,
    openclaw_version = COALESCE(p_openclaw_version, openclaw_version),
    agent_count = COALESCE(p_agent_count, agent_count),
    specs = COALESCE(p_specs, specs),
    updated_at = now()
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
