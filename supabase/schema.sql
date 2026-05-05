-- ClawOps Studio - Complete Database Schema
-- Last updated: 2026-05-05
-- Run this in Supabase Dashboard → SQL Editor

-- =============================================
-- EXTENSIONS
-- =============================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================
-- PROFILES (extends auth.users)
-- =============================================
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  company text,
  avatar_url text,
  avatar_color text default '#6366f1',
  plan text default 'personal' check (plan in ('personal', 'power', 'team', 'business', 'enterprise')),
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
-- WORKSPACES
-- =============================================
create table if not exists public.workspaces (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text unique not null,
  logo_url text,
  default_vps_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster lookups
create index if not exists idx_workspaces_user_id on workspaces(user_id);
create index if not exists idx_workspaces_slug on workspaces(slug);

-- =============================================
-- VPS INSTANCES
-- =============================================
create table if not exists public.vps_instances (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references workspaces(id) on delete set null,
  name text not null,
  hermes_url text not null,
  hermes_token text,
  hci_url text,
  vps_ip text,
  region text,
  status text default 'offline' check (status in ('online', 'offline', 'error', 'provisioning')),
  last_heartbeat timestamptz,
  last_health_check timestamptz,
  health_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_vps_workspace_id on vps_instances(workspace_id);
create index if not exists idx_vps_status on vps_instances(status);

-- =============================================
-- WORKSPACE AGENTS
-- =============================================
create table if not exists public.workspace_agents (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  role text not null,
  model text,
  profile text default 'default',
  status text default 'inactive' check (status in ('active', 'inactive', 'error')),
  system_prompt text,
  description text,
  color text default '#6366f1',
  tools text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_agents_workspace_id on workspace_agents(workspace_id);
create index if not exists idx_agents_role on workspace_agents(role);

-- =============================================
-- TASKS
-- =============================================
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  agent_id uuid references workspace_agents(id) on delete set null,
  title text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  hermes_session_id text,
  result jsonb,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_tasks_workspace_id on tasks(workspace_id);
create index if not exists idx_tasks_agent_id on tasks(agent_id);
create index if not exists idx_tasks_status on tasks(status);

-- =============================================
-- ACTIVITY LOGS
-- =============================================
create table if not exists public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  agent_id uuid references workspace_agents(id) on delete set null,
  task_id uuid references tasks(id) on delete set null,
  type text not null check (type in ('chat', 'task', 'tool_call', 'system', 'agent_action', 'error')),
  message text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_logs_workspace_id on activity_logs(workspace_id);
create index if not exists idx_logs_agent_id on activity_logs(agent_id);
create index if not exists idx_logs_type on activity_logs(type);
create index if not exists idx_logs_created_at on activity_logs(created_at desc);

-- =============================================
-- CHAT SESSIONS
-- =============================================
create table if not exists public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  agent_id uuid references workspace_agents(id) on delete set null,
  hermes_session_id text,
  title text,
  last_message text,
  message_count integer default 0,
  status text default 'active' check (status in ('active', 'archived')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_chat_workspace_id on chat_sessions(workspace_id);
create index if not exists idx_chat_agent_id on chat_sessions(agent_id);

-- =============================================
-- CHAT MESSAGES
-- =============================================
create table if not exists public.chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_messages_session_id on chat_messages(session_id);
create index if not exists idx_messages_created_at on chat_messages(created_at);

-- =============================================
-- TOOLS
-- =============================================
create table if not exists public.tools (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  display_name text not null,
  description text,
  icon text,
  category text,
  config_schema jsonb default '{}',
  enabled boolean default true,
  created_at timestamptz default now()
);

-- Seed default tools
insert into public.tools (name, display_name, description, icon, category) values
  ('gmail', 'Gmail', 'Send and receive emails via Gmail', '📧', 'communication'),
  ('calendar', 'Google Calendar', 'Manage calendar events', '📅', 'productivity'),
  ('github', 'GitHub', 'Manage repositories and issues', '🐙', 'development'),
  ('notion', 'Notion', 'Read and write to Notion', '📝', 'productivity'),
  ('slack', 'Slack', 'Send messages to Slack', '💬', 'communication'),
  ('websearch', 'Web Search', 'Search the web', '🔍', 'information'),
  ('browser', 'Browser', 'Automate web browser actions', '🌐', 'automation'),
  ('terminal', 'Terminal', 'Execute shell commands', '💻', 'development')
on conflict (name) do nothing;

-- =============================================
-- AGENT TOOLS (mapping)
-- =============================================
create table if not exists public.agent_tools (
  id uuid default gen_random_uuid() primary key,
  agent_id uuid not null references workspace_agents(id) on delete cascade,
  tool_id uuid not null references tools(id) on delete cascade,
  config jsonb default '{}',
  enabled boolean default true,
  unique(agent_id, tool_id)
);

-- Index
create index if not exists idx_agent_tools_agent_id on agent_tools(agent_id);

-- =============================================
-- PLUGINS
-- =============================================
create table if not exists public.plugins (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  display_name text not null,
  description text,
  icon text,
  category text,
  price integer default 0,
  is_featured boolean default false,
  config_schema jsonb default '{}',
  created_at timestamptz default now()
);

-- Seed default plugins
insert into public.plugins (name, display_name, description, icon, category, is_featured) values
  ('web-scraper', 'Web Scraper', 'Scrape content from any website', '🕷️', 'data', true),
  ('pdf-reader', 'PDF Reader', 'Extract text from PDF files', '📄', 'data', true),
  ('email-parser', 'Email Parser', 'Parse and extract data from emails', '📬', 'automation', false),
  ('image-analysis', 'Image Analysis', 'Analyze and extract info from images', '🖼️', 'ai', true),
  ('data-exporter', 'Data Exporter', 'Export data to CSV, JSON, Excel', '📊', 'data', false)
on conflict (name) do nothing;

-- =============================================
-- WORKSPACE PLUGINS (installed)
-- =============================================
create table if not exists public.workspace_plugins (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  plugin_id uuid not null references plugins(id) on delete cascade,
  status text default 'installed' check (status in ('installed', 'uninstalled', 'error')),
  config jsonb default '{}',
  installed_at timestamptz default now(),
  unique(workspace_id, plugin_id)
);

-- =============================================
-- SUBSCRIPTIONS (Stripe/Paddle billing)
-- =============================================
create table if not exists public.subscriptions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  workspace_id uuid references workspaces(id) on delete set null,
  plan text not null check (plan in ('personal', 'power', 'team', 'business', 'enterprise')),
  status text not null check (status in ('active', 'cancelled', 'past_due', 'suspended', 'trialing')),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index
create index if not exists idx_subscriptions_user_id on subscriptions(user_id);
create index if not exists idx_subscriptions_status on subscriptions(status);

-- =============================================
-- API KEYS (for programmatic access)
-- =============================================
create table if not exists public.api_keys (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  key_hash text not null,
  last_used timestamptz,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Index
create index if not exists idx_api_keys_workspace_id on api_keys(workspace_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table workspaces enable row level security;
alter table vps_instances enable row level security;
alter table workspace_agents enable row level security;
alter table tasks enable row level security;
alter table activity_logs enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;
alter table tools enable row level security;
alter table agent_tools enable row level security;
alter table plugins enable row level security;
alter table workspace_plugins enable row level security;
alter table subscriptions enable row level security;
alter table api_keys enable row level security;

-- Profiles: Users can only see/update their own profile
create policy "Profiles are viewable by owner" on profiles
  for select using (auth.uid() = id);

create policy "Profiles are updateable by owner" on profiles
  for update using (auth.uid() = id);

-- Workspaces: Users can only see/manage their own workspaces
create policy "Workspaces are viewable by owner" on workspaces
  for select using (auth.uid() = user_id);

create policy "Workspaces are insertable by owner" on workspaces
  for insert with check (auth.uid() = user_id);

create policy "Workspaces are updateable by owner" on workspaces
  for update using (auth.uid() = user_id);

create policy "Workspaces are deletable by owner" on workspaces
  for delete using (auth.uid() = user_id);

-- VPS Instances: Viewable if workspace belongs to user
create policy "VPS instances are viewable by workspace owner" on vps_instances
  for select using (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

create policy "VPS instances are insertable by workspace owner" on vps_instances
  for insert with check (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

create policy "VPS instances are updateable by workspace owner" on vps_instances
  for update using (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

create policy "VPS instances are deletable by workspace owner" on vps_instances
  for delete using (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

-- Workspace Agents: Viewable if workspace belongs to user
create policy "Agents are viewable by workspace owner" on workspace_agents
  for select using (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

create policy "Agents are insertable by workspace owner" on workspace_agents
  for insert with check (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

create policy "Agents are updateable by workspace owner" on workspace_agents
  for update using (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

create policy "Agents are deletable by workspace owner" on workspace_agents
  for delete using (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

-- Tasks: Viewable if workspace belongs to user
create policy "Tasks are viewable by workspace owner" on tasks
  for select using (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

create policy "Tasks are insertable by workspace owner" on tasks
  for insert with check (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

create policy "Tasks are updateable by workspace owner" on tasks
  for update using (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

-- Activity Logs: Viewable if workspace belongs to user
create policy "Logs are viewable by workspace owner" on activity_logs
  for select using (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

create policy "Logs are insertable by workspace owner" on activity_logs
  for insert with check (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

-- Chat Sessions: Viewable if workspace belongs to user
create policy "Chat sessions are viewable by workspace owner" on chat_sessions
  for select using (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

create policy "Chat sessions are insertable by workspace owner" on chat_sessions
  for insert with check (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

-- Chat Messages: Viewable if session belongs to user's workspace
create policy "Messages are viewable by session owner" on chat_messages
  for select using (
    session_id in (
      select id from chat_sessions 
      where workspace_id in (select id from workspaces where user_id = auth.uid())
    )
  );

create policy "Messages are insertable by session owner" on chat_messages
  for insert with check (
    session_id in (
      select id from chat_sessions 
      where workspace_id in (select id from workspaces where user_id = auth.uid())
    )
  );

-- Tools: Public read access
create policy "Tools are viewable by everyone" on tools
  for select using (enabled = true);

-- Agent Tools: Viewable if agent belongs to user's workspace
create policy "Agent tools are viewable by workspace owner" on agent_tools
  for select using (
    agent_id in (
      select id from workspace_agents 
      where workspace_id in (select id from workspaces where user_id = auth.uid())
    )
  );

create policy "Agent tools are manageable by workspace owner" on agent_tools
  for all using (
    agent_id in (
      select id from workspace_agents 
      where workspace_id in (select id from workspaces where user_id = auth.uid())
    )
  );

-- Plugins: Public read access
create policy "Plugins are viewable by everyone" on plugins
  for select using (true);

-- Workspace Plugins: Manageable by workspace owner
create policy "Workspace plugins are manageable by owner" on workspace_plugins
  for all using (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

-- Subscriptions: Users can only see their own
create policy "Subscriptions are viewable by owner" on subscriptions
  for select using (auth.uid() = user_id);

create policy "Subscriptions are manageable by owner" on subscriptions
  for all using (auth.uid() = user_id);

-- API Keys: Users can only see/manage their own
create policy "API keys are viewable by workspace owner" on api_keys
  for select using (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

create policy "API keys are manageable by workspace owner" on api_keys
  for all using (
    workspace_id in (select id from workspaces where user_id = auth.uid())
  );

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to get workspace ID for current user
create or replace function public.get_workspace_id()
returns uuid as $$
  select id from workspaces where user_id = auth.uid() limit 1;
$$ language sql security definer stable;

-- Function to log activity
create or replace function public.log_activity(
  p_workspace_id uuid,
  p_type text,
  p_message text,
  p_agent_id uuid default null,
  p_task_id uuid default null,
  p_metadata jsonb default '{}'
)
returns void as $$
begin
  insert into activity_logs (workspace_id, agent_id, task_id, type, message, metadata)
  values (p_workspace_id, p_agent_id, p_task_id, p_type, p_message, p_metadata);
end;
$$ language plpgsql security definer;

-- =============================================
-- TRIGGER: Auto-update updated_at
-- =============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on profiles
  for each row execute procedure update_updated_at();

create trigger update_workspaces_updated_at
  before update on workspaces
  for each row execute procedure update_updated_at();

create trigger update_vps_instances_updated_at
  before update on vps_instances
  for each row execute procedure update_updated_at();

create trigger update_workspace_agents_updated_at
  before update on workspace_agents
  for each row execute procedure update_updated_at();

create trigger update_tasks_updated_at
  before update on tasks
  for each row execute procedure update_updated_at();

create trigger update_chat_sessions_updated_at
  before update on chat_sessions
  for each row execute procedure update_updated_at();
