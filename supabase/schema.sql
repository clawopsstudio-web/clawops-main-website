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
  plan text default 'personal' check (plan in ('personal', 'power', 'team', 'enterprise')),
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
  plan text not null check (plan in ('personal', 'power', 'team', 'enterprise')),
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
  status text not null default 'pending_payment',
  stripe_session_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
