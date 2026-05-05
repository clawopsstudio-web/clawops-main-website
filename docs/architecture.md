# ClawOps Studio - Architecture Document

> **Last Updated:** 2026-05-05
> **Stack:** Next.js (App Router) + Hermes Agent + Supabase
> **Status:** Implementation in Progress

---

## Overview

ClawOps Studio is a multi-tenant SaaS platform that provides AI agent services to businesses. Each customer gets their own VPS instance running Hermes Agent, accessible via a private dashboard.

### Key Principles
1. **Hermes-only** - We use Hermes Agent as the core AI engine (NOT OpenClaw)
2. **Multi-tenant** - All data is scoped per workspace/user
3. **API-first** - All Hermes communication goes through our backend
4. **Self-hosted** - Each customer gets their own VPS

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENTS                                     │
│                    (Web Browser / Mobile)                            │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        CLOWOPS.STUDIO                                │
│                     (Next.js on Vercel)                              │
├─────────────────────────────────────────────────────────────────────┤
│  FRONTEND                          │  BACKEND (API Routes)           │
│  ────────                          │  ────────────────               │
│  /dashboard/*                      │  /api/hermes/*                  │
│  - Overview                        │  /api/workspace/*               │
│  - Agents                          │  /api/chat/*                    │
│  - Chat                            │  /api/tasks/*                   │
│  - Tasks                           │  /api/tools/*                   │
│  - Tools                           │                                 │
│  - Plugins                         │                                 │
│  - Logs                            │                                 │
│  - Settings                        │                                 │
│  - Browser                         │                                 │
│  - Terminal                        │                                 │
│  - Projects                        │                                 │
└─────────────────────────────────┼───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           SUPABASE                                    │
│                    (PostgreSQL + Auth + Storage)                     │
├─────────────────────────────────────────────────────────────────────┤
│  Tables:                                                           │
│  - profiles (user info)                                             │
│  - workspaces (per-user workspaces)                                 │
│  - vps_instances (user's VPS)                                       │
│  - workspace_agents (agent definitions)                              │
│  - tasks (mission tracking)                                         │
│  - logs (activity logs)                                             │
│  - tools (available tools)                                           │
│  - agent_tools (agent-tool mapping)                                  │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      USER'S VPS (per customer)                       │
├─────────────────────────────────────────────────────────────────────┤
│  Hermes Agent (port 9119)                                           │
│  - Gateway API for chat                                             │
│  - Sessions stored in SQLite                                        │
│  - Telegram/WhatsApp integrations                                    │
│                                                                     │
│  Hermes Control Interface / HCI (port 10272)                        │
│  - Web dashboard for management                                      │
│  - Terminal access                                                   │
│  - File explorer                                                    │
│  - Session viewer                                                   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
clawops-main-website/
├── app/
│   ├── dashboard/              # Dashboard pages
│   │   ├── page.tsx           # Overview
│   │   ├── agents/            # Agent management
│   │   ├── chat/              # Chat interface
│   │   ├── tasks/             # Task tracking
│   │   ├── tools/             # Tools & integrations
│   │   ├── plugins/           # Plugin marketplace
│   │   ├── logs/             # Activity logs
│   │   ├── settings/          # User settings
│   │   ├── browser/          # Browser automation
│   │   ├── terminal/         # Terminal access
│   │   └── projects/         # Project management
│   ├── auth/                  # Auth pages (login, signup, reset)
│   ├── api/                   # API routes
│   │   ├── hermes/           # Hermes API proxy
│   │   ├── workspace/        # Workspace CRUD
│   │   ├── chat/             # Chat endpoints
│   │   ├── tasks/            # Task endpoints
│   │   └── auth/             # Auth handlers
│   └── page.tsx              # Landing page
├── lib/
│   ├── hermes.ts             # Hermes API client
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   └── server.ts        # Server client
│   └── auth.ts               # Auth utilities
├── docs/
│   └── architecture.md       # This file
└── supabase/
    └── schema.sql            # Database schema
```

---

## Database Schema

### Tables

#### 1. profiles
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  company TEXT,
  avatar_url TEXT,
  avatar_color TEXT DEFAULT '#6366f1',
  plan TEXT DEFAULT 'personal',
  timezone TEXT DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2. workspaces
```sql
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. vps_instances
```sql
CREATE TABLE public.vps_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  name TEXT NOT NULL,
  hermes_url TEXT NOT NULL,        -- e.g., http://123.456.789.0:9119
  hermes_token TEXT,               -- Session token for auth
  hci_url TEXT,                    -- HCI dashboard URL
  vps_ip TEXT,
  region TEXT,
  status TEXT DEFAULT 'offline',
  last_heartbeat TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4. workspace_agents
```sql
CREATE TABLE public.workspace_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  name TEXT NOT NULL,               -- e.g., "Ryan", "Arjun"
  role TEXT NOT NULL,               -- e.g., "sales", "research"
  model TEXT,
  profile TEXT DEFAULT 'default',    -- Hermes profile name
  status TEXT DEFAULT 'inactive',
  system_prompt TEXT,
  tools TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. tasks
```sql
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  agent_id UUID REFERENCES workspace_agents(id),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',     -- pending, running, completed, failed
  hermes_session_id TEXT,
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. activity_logs
```sql
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id),
  agent_id UUID REFERENCES workspace_agents(id),
  task_id UUID REFERENCES tasks(id),
  type TEXT NOT NULL,               -- chat, task, tool_call, system
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 7. tools
```sql
CREATE TABLE public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT,
  config_schema JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 8. agent_tools
```sql
CREATE TABLE public.agent_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES workspace_agents(id) ON DELETE CASCADE,
  tool_id UUID REFERENCES tools(id) ON DELETE CASCADE,
  config JSONB DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  UNIQUE(agent_id, tool_id)
);
```

---

## Row Level Security (RLS)

All tables must have RLS enabled with policies like:

```sql
-- Enable RLS
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Policy: users can only see their own workspaces
CREATE POLICY "Users can view own workspaces" ON workspaces
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workspaces" ON workspaces
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## API Routes

### Hermes API Proxy

All Hermes API calls go through our backend to:
1. Add authentication
2. Scope data per workspace
3. Handle CORS

```
POST /api/hermes/chat
  Body: { workspaceId, agentId, message }
  → Proxies to Hermes Gateway
  → Returns: Streaming response

GET /api/hermes/status
  Query: ?workspaceId=xxx
  → Checks Hermes health
  → Returns: { version, platforms, sessions }

GET /api/hermes/sessions
  Query: ?workspaceId=xxx
  → Lists Hermes sessions
  → Returns: { sessions: [...] }
```

### Workspace API

```
GET /api/workspace
  → Get user's workspaces

POST /api/workspace
  → Create new workspace

GET /api/workspace/[id]
  → Get workspace details

PUT /api/workspace/[id]
  → Update workspace

POST /api/workspace/[id]/vps
  → Connect VPS to workspace
```

### Chat API

```
GET /api/chat/history?workspaceId=xxx&agentId=yyy
  → Get chat history from Hermes

POST /api/chat/send
  Body: { workspaceId, agentId, message }
  → Send message to Hermes
  → Returns: Streaming response
```

---

## Hermes Integration

### How We Connect to Hermes

Each VPS has Hermes running with:
- **Gateway API:** Port 9119
- **Session Token:** Retrieved from HCI dashboard

### Hermes API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/status` | GET | Token | Health check |
| `/api/sessions` | GET | Token | List sessions |
| `/api/chat` | POST | Token | Send message |

### Authentication Flow

1. User adds VPS to workspace (enters IP/URL + token)
2. We store token encrypted in `vps_instances`
3. All API calls include `X-Session-Token` header
4. Response proxied back to frontend

---

## Dashboard URL Strategy

**Chosen:** Path-based routing

```
https://clawops.studio/dashboard/<workspace-slug>
```

**Example:**
- Pulkit's workspace: `clawops` → `clawops.studio/dashboard/clawops`
- Acme Corp: `acme` → `clawops.studio/dashboard/acme`

**Why path-based:**
- Easier to implement (no wildcard SSL needed)
- Works with existing Vercel deployment
- Cleaner from SEO perspective

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# Hermes (for testing)
TEST_VPS_URL=http://178.238.232.52:9119
TEST_VPS_TOKEN=EwqDt1Gq_YsYfJVjKEHgaaXw4AqnALNTGh5Tl_4k-Uc

# App
NEXT_PUBLIC_APP_URL=https://clawops.studio
```

---

## Implementation Phases

### Phase 1: Foundation
- [x] Architecture document
- [ ] Complete DB schema with RLS
- [ ] Hermes API client (`lib/hermes.ts`)
- [ ] Auth middleware

### Phase 2: Core Features
- [ ] Workspace CRUD API
- [ ] VPS connection flow
- [ ] Dashboard overview page
- [ ] Agent listing page

### Phase 3: Chat & Tasks
- [ ] Chat API with streaming
- [ ] Task tracking API
- [ ] Activity logs
- [ ] Settings page

### Phase 4: Tools & Plugins
- [ ] Tools management
- [ ] Plugin marketplace
- [ ] Browser automation
- [ ] Terminal access

---

## Questions / Decisions Pending

1. **Provisioning flow** - Auto-provision VPS on signup, or manual?
2. **Hermes profiles** - Each agent = Hermes profile, or single profile?
3. **Session storage** - Hermes SQLite vs our Supabase?
4. **Real-time updates** - Server-Sent Events or WebSocket?

---

## Contact

For questions about this architecture, reach out to the ClawOps Studio team.
