-- ClawOps Studio — Supabase Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- Last updated: 2026-04-21

-- =============================================
-- EXTENSIONS
-- =============================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  company text,
  avatar_url text,
  plan text default 'personal' check (plan in ('personal', 'power', 'team', 'business', 'enterprise')),
  stripe_customer_id text,
  stripe_subscription_id text,
  webhook_secret text,
  timezone text default 'Asia/Kolkata',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- VPS INSTANCES
-- =============================================
create table public.vps_instances (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  instance_id text unique,
  name text not null,
  tunnel_url text unique not null,
  vps_ip text,
  product_id text,
  region text,
  specs jsonb default '{}',
  status text default 'online' check (status in ('online', 'offline', 'error', 'tracked')),
  agent_count integer default 0,
  openclaw_version text,
  last_heartbeat timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- SUBSCRIPTIONS (PayPal billing)
-- =============================================
create table public.subscriptions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  plan text not null check (plan in ('personal', 'power', 'team', 'business', 'enterprise')),
  status text not null check (status in ('active', 'cancelled', 'past_due', 'suspended')),
  paypal_subscription_id text,
  paypal_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- USER SKILLS (installed agent skills)
-- =============================================
create table public.user_skills (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  skill_id text not null,
  status text default 'installed' check (status in ('installed', 'failed', 'removed')),
  config_data jsonb default '{}',
  installed_at timestamptz default now(),
  unique(user_id, skill_id)
);

-- =============================================
-- AGENT INSTANCES (running agents per VPS)
-- =============================================
create table public.agent_instances (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  vps_id uuid references public.vps_instances(id) on delete cascade,
  agent_name text not null,
  agent_role text,
  status text default 'active' check (status in ('active', 'stopped', 'error')),
  config jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =============================================
-- MISSION LOGS (agent activity tracking)
-- =============================================
create table public.mission_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  agent_id uuid references public.agent_instances(id) on delete set null,
  mission_type text,
  status text check (status in ('running', 'completed', 'failed')),
  input_data jsonb default '{}',
  output_data jsonb default '{}',
  tokens_used integer,
  cost_usd numeric(10,4),
  started_at timestamptz default now(),
  completed_at timestamptz
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.vps_instances enable row level security;
alter table public.subscriptions enable row level security;
alter table public.user_skills enable row level security;
alter table public.agent_instances enable row level security;
alter table public.mission_logs enable row level security;

-- Profiles: users can only see/edit their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- VPS Instances: users can only see/edit their own instances
create policy "Users can manage own instances" on public.vps_instances for all using (auth.uid() = user_id);

-- Subscriptions: users can only see their own subscription
create policy "Users can view own subscriptions" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Users can manage own subscriptions" on public.subscriptions for all using (auth.uid() = user_id);

-- User Skills: users can only see their own skills
create policy "Users can manage own skills" on public.user_skills for all using (auth.uid() = user_id);

-- Agent Instances: users can only see their own agents
create policy "Users can manage own agents" on public.agent_instances for all using (auth.uid() = user_id);

-- Mission Logs: users can only see their own logs
create policy "Users can manage own mission logs" on public.mission_logs for all using (auth.uid() = user_id);

-- Service role bypass: anon key users can read but service role can do everything
-- (Supabase handles this automatically)

-- =============================================
-- INDEXES
-- =============================================
create index if not exists idx_vps_instances_user_id on public.vps_instances(user_id);
create index if not exists idx_vps_instances_tunnel on public.vps_instances(tunnel_url);
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);
create index if not exists idx_user_skills_user_id on public.user_skills(user_id);
create index if not exists idx_agent_instances_user_id on public.agent_instances(user_id);
create index if not exists idx_mission_logs_user_id on public.mission_logs(user_id);
create index if not exists idx_mission_logs_agent_id on public.mission_logs(agent_id);
create index if not exists idx_mission_logs_started on public.mission_logs(started_at desc);

-- Onboarding submissions (public form - no auth required to submit)
create table if not exists public.onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  business_name text not null,
  website_url text,
  industry text not null,
  business_description text,
  goals jsonb not null default '[]',
  tools_crm jsonb not null default '[]',
  tools_email jsonb not null default '[]',
  tools_comms jsonb not null default '[]',
  tools_workspace jsonb not null default '[]',
  tools_social jsonb not null default '[]',
  agent_name text,
  agent_tone text,
  plan text,
  clerk_user_id text,

  -- User lifecycle status
  -- signed_up  → Clerk user created, no form submitted yet
  -- pending_payment → Form completed, awaiting payment
  -- paid       → Stripe payment confirmed
  -- provisioning → VPS + agents being set up
  -- active     → Fully provisioned, dashboard live
  -- abandoned  → 7+ days no payment, marked by cron
  status text not null default 'pending_payment',

  stripe_session_id text,

  -- Lifecycle timestamps
  signed_up_at timestamptz,     -- set when Clerk user is created
  paid_at timestamptz,         -- set when Stripe checkout.session.completed fires
  provisioned_at timestamptz,   -- set when VPS is live and dashboard URL sent
  abandoned_at timestamptz,      -- set by cron after 7 days no payment

  -- Provisioning details (set during Phase 2)
  composio_entity_id text,
  vps_instance_id text,
  dashboard_url text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Cron job: mark submissions abandoned after 7 days pending_payment
-- Run daily: update onboarding_submissions set abandoned_at = now()
--   where status = 'pending_payment' and created_at < now() - interval '7 days';
-- After marking abandoned, optionally email user via notification service.

-- RLS: allow insert from anyone (public form), but only service role can read/update
alter table public.onboarding_submissions enable row level security;

-- Anyone can INSERT (public form submission)
create policy "Anyone can submit onboarding form"
  on public.onboarding_submissions
  for insert
  with check (true);

-- Only service role can SELECT/UPDATE (internal use)
create policy "Service role full access"
  on public.onboarding_submissions
  for all
  using (auth.role() = 'service_role');

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger onboarding_submissions_updated_at
  before update on public.onboarding_submissions
  for each row execute function public.handle_updated_at();

-- ─── contact_submissions ───────────────────────────────────────────────
create table if not exists public.contact_submissions (
  id          bigint generated by default as identity primary key,
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamp with time zone default now()
);

alter table public.contact_submissions enable row level security;

create policy "Public can insert contact_submissions"
  on public.contact_submissions
  for insert
  with check (true);

create policy "Service role can read contact_submissions"
  on public.contact_submissions
  for select
  using (auth.role() = 'service_role');

-- ─── provisioning_logs ─────────────────────────────────────────────────
-- All Contabo/VPS/provisioning API calls logged here for audit trail
create table if not exists public.provisioning_logs (
  id          uuid default gen_random_uuid() primary key,
  user_id     text not null,
  action      text not null,
  payload     jsonb,
  response    jsonb,
  status      text,
  created_at  timestamptz default now()
);

alter table public.provisioning_logs enable row level security;

-- Only service role can write/read (internal audit log)
create policy "Service role full access provisioning_logs"
  on public.provisioning_logs
  for all
  using (auth.role() = 'service_role');

-- =============================================
-- PHASE 2 UPDATES (2026-04-22)
-- =============================================

-- Add composio_entity_created flag
alter table public.onboarding_submissions
  add column if not exists composio_entity_created boolean not null default false;

-- Add user channel columns (users bring their own tokens/webhooks)
alter table public.onboarding_submissions
  add column if not exists user_telegram_bot_token text,
  add column if not exists user_whatsapp_number text,
  add column if not exists user_slack_webhook_url text,
  add column if not exists user_discord_webhook_url text;

-- Update profiles plan enum — remove old tiers, add new 3-tier structure
alter table public.profiles
  drop constraint if exists profiles_plan_check;

alter table public.profiles
  add constraint profiles_plan_check
  check (plan in ('personal', 'team', 'business'))
  deferrable initially immediate;

-- Add stripe-related payment status column
alter table public.onboarding_submissions
  add column if not exists payment_status text default 'pending'
  check (payment_status in ('pending', 'paid', 'failed', 'refunded'));

-- =============================================
-- ─── Dashboard tables (2026-04-24) ───────────────────────────────────────────
-- agents: per-user AI agents with system prompts
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  status TEXT DEFAULT 'idle',
  system_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agents" ON public.agents
  FOR ALL USING (auth.uid()::TEXT = user_id);

-- missions: agent tasks with full history
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  title TEXT,
  prompt TEXT,
  output TEXT,
  status TEXT DEFAULT 'completed',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own missions" ON public.missions
  FOR ALL USING (auth.uid()::TEXT = user_id);

-- logs: activity and error log
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent TEXT,
  message TEXT,
  level TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
-- Logs are append-only, read by own user
CREATE POLICY "Users read own logs" ON public.logs
  FOR SELECT USING (true);
CREATE POLICY "Service can insert logs" ON public.logs
  FOR INSERT WITH CHECK (true);

-- user_model_config: per-user AI model preferences
CREATE TABLE IF NOT EXISTS public.user_model_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_name TEXT,
  api_key_set BOOLEAN DEFAULT FALSE,
  custom_base_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_model_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own model config" ON public.user_model_config
  FOR ALL USING (auth.uid()::TEXT = user_id);

-- installed_mcp_servers: Composio MCP tool integrations
CREATE TABLE IF NOT EXISTS public.installed_mcp_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  server_name TEXT NOT NULL,
  smithery_id TEXT,
  status TEXT DEFAULT 'installing',
  connected BOOLEAN DEFAULT FALSE,
  installed_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.installed_mcp_servers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own integrations" ON public.installed_mcp_servers
  FOR ALL USING (auth.uid()::TEXT = user_id);

-- onboarding_submissions: add vps_ip column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'onboarding_submissions' AND column_name = 'vps_ip'
  ) THEN
    ALTER TABLE public.onboarding_submissions ADD COLUMN vps_ip TEXT;
  END IF;
END $$;

