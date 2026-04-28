-- ClawOps Studio - Dashboard Fixes
-- Run in Supabase SQL Editor

-- =============================================
-- USER TOOLS (connected integrations per user)
-- =============================================
create table if not exists public.user_tools (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  tool_name text not null,
  tool_slug text not null,
  status text default 'connected' check (status in ('connected', 'disconnected', 'error')),
  config jsonb default '{}',
  connected_at timestamptz default now(),
  unique(user_id, tool_slug)
);

alter table public.user_tools enable row level security;

create policy "Users can manage own tools" on public.user_tools 
  for all using (auth.uid() = user_id);

-- =============================================
-- VPS AGENTS (agents synced from VPS)
-- =============================================
create table if not exists public.vps_agents (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  vps_id uuid references public.vps_instances(id) on delete cascade,
  hermes_agent_id text not null,
  agent_name text not null,
  agent_role text,
  status text default 'active' check (status in ('active', 'stopped', 'error')),
  tools jsonb default '[]',
  webhook_url text,
  config jsonb default '{}',
  last_seen timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.vps_agents enable row level security;

create policy "Users can manage own agents" on public.vps_agents 
  for all using (auth.uid() = user_id);

-- =============================================
-- Seed test data for admin user
-- =============================================
-- Only run this for testing, remove in production

-- Insert test VPS for admin
insert into public.vps_instances (id, user_id, instance_id, name, tunnel_url, vps_ip, status, agent_count)
values (
  '5a1f1a65-b620-46dc-879d-c67e69ba0c04',
  '5a1f1a65-b620-46dc-879d-c67e69ba0c04',
  'vps-hermes-test',
  'Hermes Test VPS',
  'https://hermes.clawops.studio',
  '178.238.232.52',
  'online',
  3
)
on conflict (user_id) do update set 
  tunnel_url = 'https://hermes.clawops.studio',
  status = 'online',
  name = 'Hermes Test VPS';

-- Insert test agents
insert into public.vps_agents (user_id, vps_id, hermes_agent_id, agent_name, agent_role, status, tools)
values 
  ('5a1f1a65-b620-46dc-879d-c67e69ba0c04', '5a1f1a65-b620-46dc-879d-c67e69ba0c04', 'agent-ryan', 'Ryan', 'Sales Agent', 'active', '["gmail", "hubspot", "linkedin"]'),
  ('5a1f1a65-b620-46dc-879d-c67e69ba0c04', '5a1f1a65-b620-46dc-879d-c67e69ba0c04', 'agent-arjun', 'Arjun', 'Research Agent', 'active', '["google-search", "firecrawl", "notion"]'),
  ('5a1f1a65-b620-46dc-879d-c67e69ba0c04', '5a1f1a65-b620-46dc-879d-c67e69ba0c04', 'agent-tyler', 'Tyler', 'Marketing Agent', 'active', '["twitter", "youtube", "analytics"]')
on conflict do nothing;

-- Insert test tools
insert into public.user_tools (user_id, tool_name, tool_slug, status)
values 
  ('5a1f1a65-b620-46dc-879d-c67e69ba0c04', 'Gmail', 'gmail', 'connected'),
  ('5a1f1a65-b620-46dc-879d-c67e69ba0c04', 'Telegram', 'telegram', 'connected'),
  ('5a1f1a65-b620-46dc-879d-c67e69ba0c04', 'Notion', 'notion', 'connected')
on conflict do nothing;

-- Insert test missions
insert into public.mission_logs (user_id, mission_type, status, started_at)
values 
  ('5a1f1a65-b620-46dc-879d-c67e69ba0c04', 'Daily Lead Research', 'completed', now() - interval '2 hours'),
  ('5a1f1a65-b620-46dc-879d-c67e69ba0c04', 'Outreach Campaign', 'running', now() - interval '30 minutes'),
  ('5a1f1a65-b620-46dc-879d-c67e69ba0c04', 'Market Analysis', 'completed', now() - interval '1 day'),
  ('5a1f1a65-b620-46dc-879d-c67e69ba0c04', 'Social Media Post', 'completed', now() - interval '3 hours')
on conflict do nothing;
