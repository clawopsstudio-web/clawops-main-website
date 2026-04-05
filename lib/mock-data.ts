// ============================================================================
// ClawOps Studio — Mock Data (Phase 1 MVP)
// ============================================================================

import type {
  User,
  BusinessProfile,
  Plan,
  Subscription,
  OpenClawConnection,
  Task,
  Goal,
  Workflow,
  ActivityEntry,
  SystemHealth,
  DashboardStats,
  AgentSession,
  ChatMessage,
  Service,
  AgentInfo,
} from '@/types';

// ----------------------------------------------------------------------------
// Plans
// ----------------------------------------------------------------------------

export const MOCK_PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'AI Assistant Lite',
    tagline: 'Perfect for solo operators',
    price: { monthly: 299, setupFee: 499 },
    features: [
      '1 AI Agent',
      '5 Active workflows',
      'Telegram integration',
      'Basic task management',
      'Activity history',
      'Email support',
    ],
    limits: { agents: 1, workflows: 5, seats: 1 },
  },
  {
    id: 'growth',
    name: 'AI Employee Pro',
    tagline: 'For growing agencies',
    price: { monthly: 499, setupFee: 499 },
    features: [
      '3 AI Agents',
      '25 Active workflows',
      'Telegram + Slack integration',
      'Advanced task board',
      'Goal tracking',
      'Priority support',
      'API access',
    ],
    limits: { agents: 3, workflows: 25, seats: 3 },
  },
  {
    id: 'pro',
    name: 'Vertical AI Specialist',
    tagline: 'Industry-specific AI workforce',
    price: { monthly: 799, setupFee: 999 },
    features: [
      '10 AI Agents',
      'Unlimited workflows',
      'All integrations',
      'Custom agent templates',
      'Multi-business profiles',
      'Dedicated support',
      'White-label ready',
    ],
    limits: { agents: 10, workflows: -1, seats: 10 },
  },
  {
    id: 'enterprise',
    name: 'Custom AI Workforce',
    tagline: 'Tailored to your needs',
    price: { monthly: 0, setupFee: 0 },
    features: [
      'Unlimited AI Agents',
      'Unlimited everything',
      'Custom integrations',
      'On-premise deployment',
      'SLA guarantee',
      'Dedicated account manager',
      'Custom training',
    ],
    limits: { agents: -1, workflows: -1, seats: -1 },
  },
];

// ----------------------------------------------------------------------------
// Mock User
// ----------------------------------------------------------------------------

export const MOCK_USER: User = {
  id: 'usr_1a2b3c4d5e6f',
  email: 'pulkit@clawops.studio',
  fullName: 'Pulkit',
  avatarUrl: undefined,
  role: 'admin',
  status: 'active',
  totpEnabled: true,
  createdAt: '2026-03-01T09:00:00Z',
  updatedAt: '2026-04-01T09:00:00Z',
};

// ----------------------------------------------------------------------------
// Mock Business Profile
// ----------------------------------------------------------------------------

export const MOCK_BUSINESS_PROFILE: BusinessProfile = {
  id: 'biz_1a2b3c4d5e6f',
  userId: 'usr_1a2b3c4d5e6f',
  businessName: 'ClawOps Studio',
  businessType: 'Agency',
  industry: 'AI Automation',
  logoUrl: undefined,
  websiteUrl: 'https://clawops.studio',
  timezone: 'Asia/Kolkata',
  language: 'en',
  createdAt: '2026-03-01T09:05:00Z',
  updatedAt: '2026-04-01T09:05:00Z',
};

// ----------------------------------------------------------------------------
// Mock Subscription
// ----------------------------------------------------------------------------

export const MOCK_SUBSCRIPTION: Subscription = {
  id: 'sub_1a2b3c4d5e6f',
  userId: 'usr_1a2b3c4d5e6f',
  plan: 'growth',
  status: 'active',
  currentPeriodStart: '2026-03-01T00:00:00Z',
  currentPeriodEnd: '2026-04-01T00:00:00Z',
  cancelAtPeriodEnd: false,
  createdAt: '2026-03-01T09:10:00Z',
};

// ----------------------------------------------------------------------------
// Mock OpenClaw Connections
// ----------------------------------------------------------------------------

export const MOCK_CONNECTIONS: OpenClawConnection[] = [
  {
    id: 'ocn_production',
    userId: 'usr_1a2b3c4d5e6f',
    connectionName: 'Production Gateway',
    gatewayUrl: 'https://gateway.clawops.studio',
    apiKey: 'sk-openclaw-****-****-****',
    workspacePath: '/root/.openclaw',
    environment: 'production',
    isActive: true,
    lastConnectedAt: new Date().toISOString(),
    createdAt: '2026-03-01T09:15:00Z',
    updatedAt: '2026-04-05T08:00:00Z',
  },
  {
    id: 'ocn_staging',
    userId: 'usr_1a2b3c4d5e6f',
    connectionName: 'Staging Gateway',
    gatewayUrl: 'https://staging.gateway.clawops.studio',
    apiKey: 'sk-openclaw-****-****-****',
    workspacePath: '/root/.openclaw-staging',
    environment: 'staging',
    isActive: false,
    lastConnectedAt: '2026-03-28T14:30:00Z',
    createdAt: '2026-03-15T11:00:00Z',
    updatedAt: '2026-03-28T14:30:00Z',
  },
];

// ----------------------------------------------------------------------------
// Mock Tasks
// ----------------------------------------------------------------------------

export const MOCK_TASKS: Task[] = [
  {
    id: 'tsk_1',
    userId: 'usr_1a2b3c4d5e6f',
    title: 'Set up n8n automation pipeline',
    description: 'Connect ClawOps to n8n for complex workflow orchestration',
    priority: 'P0',
    status: 'DOING',
    owner: 'Henry',
    currentState: 'Configuring webhook triggers',
    nextAction: 'Test the trigger endpoint',
    definitionOfDone: ['Webhook configured', 'Test run successful', 'Docs updated'],
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-04-05T07:30:00Z',
  },
  {
    id: 'tsk_2',
    userId: 'usr_1a2b3c4d5e6f',
    title: 'Build Phase 1 dashboard MVP',
    description: 'Implement dashboard shell, auth flow, and core pages',
    priority: 'P0',
    status: 'DOING',
    owner: 'Henry',
    currentState: 'Building dashboard pages and components',
    nextAction: 'Build tasks page and Mission Control',
    definitionOfDone: ['Auth flow', 'Onboarding', 'Dashboard shell', 'Tasks', 'Mission Control'],
    createdAt: '2026-04-01T09:00:00Z',
    updatedAt: '2026-04-05T08:10:00Z',
  },
  {
    id: 'tsk_3',
    userId: 'usr_1a2b3c4d5e6f',
    title: 'Deploy dashboard to Vercel',
    description: 'Set up Vercel project and configure environment variables',
    priority: 'P1',
    status: 'TODO',
    owner: 'Henry',
    nextAction: 'Configure Supabase env vars',
    definitionOfDone: ['Vercel project created', 'Env vars set', 'Deployed'],
    createdAt: '2026-04-02T09:00:00Z',
    updatedAt: '2026-04-02T09:00:00Z',
  },
  {
    id: 'tsk_4',
    userId: 'usr_1a2b3c4d5e6f',
    title: 'Set up Supabase project',
    description: 'Create Supabase project and run initial migrations',
    priority: 'P1',
    status: 'TODO',
    owner: 'Henry',
    nextAction: 'Apply schema from architecture doc',
    definitionOfDone: ['Project created', 'Schema migrated', 'RLS policies applied'],
    createdAt: '2026-04-02T09:30:00Z',
    updatedAt: '2026-04-02T09:30:00Z',
  },
  {
    id: 'tsk_5',
    userId: 'usr_1a2b3c4d5e6f',
    title: 'Configure Stripe checkout',
    description: 'Integrate Stripe for subscription payments',
    priority: 'P2',
    status: 'DEFERRED',
    nextAction: 'Set up Stripe account first',
    definitionOfDone: ['Stripe connected', 'Checkout working', 'Webhook verified'],
    createdAt: '2026-04-03T10:00:00Z',
    updatedAt: '2026-04-03T10:00:00Z',
  },
  {
    id: 'tsk_6',
    userId: 'usr_1a2b3c4d5e6f',
    title: 'Research competitor dashboards',
    description: 'Analyze rival AI dashboard products for feature gaps',
    priority: 'P2',
    status: 'DONE',
    owner: 'Henry',
    currentState: 'Completed competitor analysis',
    definitionOfDone: ['Research done', 'Report written', 'Opportunities identified'],
    createdAt: '2026-03-30T09:00:00Z',
    updatedAt: '2026-04-01T18:00:00Z',
  },
  {
    id: 'tsk_7',
    userId: 'usr_1a2b3c4d5e6f',
    title: 'Paperclip integration testing',
    description: 'Test Paperclip MCP server connectivity and function calls',
    priority: 'P1',
    status: 'BLOCKED',
    owner: 'Henry',
    currentState: 'Waiting for Paperclip service to be accessible',
    nextAction: 'Check network configuration',
    definitionOfDone: ['Ping test pass', 'Function calls working', 'Error handling in place'],
    createdAt: '2026-04-04T11:00:00Z',
    updatedAt: '2026-04-05T06:00:00Z',
  },
];

// ----------------------------------------------------------------------------
// Mock Goals
// ----------------------------------------------------------------------------

export const MOCK_GOALS: Goal[] = [
  {
    id: 'goal_1',
    userId: 'usr_1a2b3c4d5e6f',
    goalName: 'Launch ClawOps Studio Dashboard',
    targetValue: '$100k/month revenue',
    isActive: true,
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-04-01T09:00:00Z',
  },
  {
    id: 'goal_2',
    userId: 'usr_1a2b3c4d5e6f',
    goalName: 'First 10 paying customers',
    targetValue: '10 customers',
    isActive: true,
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-04-01T09:00:00Z',
  },
];

// ----------------------------------------------------------------------------
// Mock Workflows
// ----------------------------------------------------------------------------

export const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: 'wf_1',
    userId: 'usr_1a2b3c4d5e6f',
    name: 'Daily Activity Digest',
    description: 'Auto-generate daily summary of all agent activities',
    triggerType: 'scheduled',
    triggerConfig: { cron: '0 9 * * *' },
    isActive: true,
    lastRunAt: '2026-04-05T09:00:00Z',
    runCount: 35,
    createdAt: '2026-03-10T10:00:00Z',
    updatedAt: '2026-04-05T09:00:00Z',
  },
  {
    id: 'wf_2',
    userId: 'usr_1a2b3c4d5e6f',
    name: 'Task Sync to Notion',
    description: 'Sync completed tasks to Notion workspace',
    triggerType: 'webhook',
    triggerConfig: { url: 'https://api.notion.com/v1/pages' },
    isActive: true,
    lastRunAt: '2026-04-05T07:45:00Z',
    runCount: 89,
    createdAt: '2026-03-15T14:00:00Z',
    updatedAt: '2026-04-05T07:45:00Z',
  },
  {
    id: 'wf_3',
    userId: 'usr_1a2b3c4d5e6f',
    name: 'Weekly Revenue Report',
    description: 'Generate and email weekly revenue metrics',
    triggerType: 'scheduled',
    triggerConfig: { cron: '0 10 * * 1' },
    isActive: false,
    lastRunAt: '2026-03-31T10:00:00Z',
    runCount: 13,
    createdAt: '2026-03-05T08:00:00Z',
    updatedAt: '2026-03-31T10:00:00Z',
  },
  {
    id: 'wf_4',
    userId: 'usr_1a2b3c4d5e6f',
    name: 'Lead Enrichment Pipeline',
    description: 'Automatically enrich new leads from form submissions',
    triggerType: 'event',
    triggerConfig: { event: 'form_submission' },
    isActive: true,
    lastRunAt: '2026-04-05T08:00:00Z',
    runCount: 247,
    createdAt: '2026-03-20T12:00:00Z',
    updatedAt: '2026-04-05T08:00:00Z',
  },
];

// ----------------------------------------------------------------------------
// Mock Activity History
// ----------------------------------------------------------------------------

export const MOCK_ACTIVITY: ActivityEntry[] = [
  {
    id: 'act_1',
    userId: 'usr_1a2b3c4d5e6f',
    actionType: 'login',
    entityType: 'user',
    entityId: 'usr_1a2b3c4d5e6f',
    entityData: { method: 'password', mfa: true },
    ipAddress: '192.168.1.100',
    createdAt: '2026-04-05T08:00:00Z',
  },
  {
    id: 'act_2',
    userId: 'usr_1a2b3c4d5e6f',
    actionType: 'task_updated',
    entityType: 'task',
    entityId: 'tsk_2',
    entityData: { title: 'Build Phase 1 dashboard MVP', status: 'DOING' },
    createdAt: '2026-04-05T07:30:00Z',
  },
  {
    id: 'act_3',
    userId: 'usr_1a2b3c4d5e6f',
    actionType: 'agent_launched',
    entityType: 'agent_session',
    entityId: 'ses_1',
    entityData: { agentName: 'Research Agent', model: 'gpt-4o' },
    createdAt: '2026-04-05T07:15:00Z',
  },
  {
    id: 'act_4',
    userId: 'usr_1a2b3c4d5e6f',
    actionType: 'workflow_run',
    entityType: 'workflow',
    entityId: 'wf_2',
    entityData: { workflowName: 'Task Sync to Notion', status: 'completed' },
    createdAt: '2026-04-05T07:45:00Z',
  },
  {
    id: 'act_5',
    userId: 'usr_1a2b3c4d5e6f',
    actionType: 'task_created',
    entityType: 'task',
    entityId: 'tsk_7',
    entityData: { title: 'Paperclip integration testing' },
    createdAt: '2026-04-04T11:00:00Z',
  },
  {
    id: 'act_6',
    userId: 'usr_1a2b3c4d5e6f',
    actionType: 'connection_updated',
    entityType: 'openclaw_connection',
    entityId: 'ocn_production',
    entityData: { connectionName: 'Production Gateway' },
    createdAt: '2026-04-04T09:00:00Z',
  },
];

// ----------------------------------------------------------------------------
// Mock System Health
// ----------------------------------------------------------------------------

export const MOCK_SERVICES: Service[] = [
  {
    id: 'svc_gateway',
    name: 'gateway',
    displayName: 'OpenClaw Gateway',
    status: 'running',
    port: 18789,
    url: 'http://localhost:18789',
    latency: 8,
    uptime: '14d 6h',
    version: '2.4.1',
    lastChecked: new Date().toISOString(),
  },
  {
    id: 'svc_n8n',
    name: 'n8n',
    displayName: 'n8n Workflow Engine',
    status: 'running',
    port: 5678,
    url: 'http://localhost:5678',
    latency: 23,
    uptime: '14d 5h',
    version: '1.73.0',
    lastChecked: new Date().toISOString(),
  },
  {
    id: 'svc_paperclip',
    name: 'paperclip',
    displayName: 'Paperclip MCP Server',
    status: 'running',
    port: 4000,
    latency: 15,
    uptime: '7d 12h',
    version: '0.8.3',
    lastChecked: new Date().toISOString(),
  },
  {
    id: 'svc_pinchtab',
    name: 'pinchtab',
    displayName: 'PinchTab Browser',
    status: 'running',
    port: 9867,
    url: 'http://localhost:9867',
    latency: 42,
    uptime: '3d 2h',
    version: '1.2.0',
    lastChecked: new Date().toISOString(),
  },
  {
    id: 'svc_neko',
    name: 'neko',
    displayName: 'Neko Browser Stream',
    status: 'running',
    port: 8080,
    latency: 31,
    uptime: '3d 2h',
    version: '2.2.0',
    lastChecked: new Date().toISOString(),
  },
  {
    id: 'svc_firecrawl',
    name: 'firecrawl',
    displayName: 'Firecrawl Crawler',
    status: 'running',
    port: 3002,
    latency: 95,
    uptime: '2d 8h',
    version: '1.3.0',
    lastChecked: new Date().toISOString(),
  },
  {
    id: 'svc_postgres',
    name: 'postgres',
    displayName: 'PostgreSQL',
    status: 'running',
    latency: 4,
    uptime: '14d 6h',
    version: '16.3',
    lastChecked: new Date().toISOString(),
  },
  {
    id: 'svc_redis',
    name: 'redis',
    displayName: 'Redis Cache',
    status: 'running',
    latency: 2,
    uptime: '14d 6h',
    version: '7.2.4',
    lastChecked: new Date().toISOString(),
  },
];

export const MOCK_AGENTS: AgentInfo[] = [
  {
    id: 'agent_henry',
    name: 'Henry',
    model: 'gpt-4o',
    status: 'active',
    lastActivity: '2026-04-05T08:15:00Z',
    sessionCount: 142,
  },
  {
    id: 'agent_research',
    name: 'Research Agent',
    model: 'gpt-4o-mini',
    status: 'idle',
    lastActivity: '2026-04-05T07:15:00Z',
    sessionCount: 38,
  },
  {
    id: 'agent_content',
    name: 'Content Agent',
    model: 'gpt-4o',
    status: 'busy',
    lastActivity: '2026-04-05T08:16:00Z',
    sessionCount: 67,
  },
  {
    id: 'agent_ops',
    name: 'Ops Agent',
    model: 'claude-3-opus',
    status: 'offline',
    lastActivity: '2026-04-04T22:00:00Z',
    sessionCount: 23,
  },
];

export const MOCK_SYSTEM_HEALTH: SystemHealth = {
  score: 98,
  services: MOCK_SERVICES,
  agents: MOCK_AGENTS,
  queueActive: 45,
  incidentsOpen: 0,
  memoryUsage: 62,
  cpuUsage: 18,
  diskUsage: 34,
  lastUpdated: new Date().toISOString(),
};

// ----------------------------------------------------------------------------
// Mock Dashboard Stats
// ----------------------------------------------------------------------------

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  activeAgents: 2,
  totalTasks: MOCK_TASKS.length,
  completedTasks: MOCK_TASKS.filter((t) => t.status === 'DONE').length,
  activeWorkflows: MOCK_WORKFLOWS.filter((w) => w.isActive).length,
  systemHealth: 98,
  recentActivity: MOCK_ACTIVITY,
};

// ----------------------------------------------------------------------------
// Mock Agent Sessions
// ----------------------------------------------------------------------------

export const MOCK_AGENT_SESSIONS: AgentSession[] = [
  {
    id: 'ses_1',
    userId: 'usr_1a2b3c4d5e6f',
    agentModel: 'gpt-4o',
    customAgentName: 'Henry',
    isActive: true,
    startTime: '2026-04-05T06:00:00Z',
    lastActivityAt: '2026-04-05T08:15:00Z',
    settings: {},
  },
  {
    id: 'ses_2',
    userId: 'usr_1a2b3c4d5e6f',
    agentModel: 'gpt-4o-mini',
    customAgentName: 'Research Agent',
    isActive: true,
    startTime: '2026-04-05T07:00:00Z',
    lastActivityAt: '2026-04-05T07:15:00Z',
    settings: {},
  },
  {
    id: 'ses_3',
    userId: 'usr_1a2b3c4d5e6f',
    agentModel: 'gpt-4o',
    customAgentName: 'Content Agent',
    isActive: true,
    startTime: '2026-04-05T08:00:00Z',
    lastActivityAt: '2026-04-05T08:16:00Z',
    settings: {},
  },
];

// ----------------------------------------------------------------------------
// Mock Chat Messages
// ----------------------------------------------------------------------------

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    sessionId: 'ses_1',
    role: 'user',
    content: 'Build the Phase 1 dashboard. Focus on the auth flow and dashboard shell first.',
    timestamp: '2026-04-05T08:10:00Z',
    metadata: { tokensUsed: 48, model: 'gpt-4o', duration: '1.2s' },
  },
  {
    id: 'msg_2',
    sessionId: 'ses_1',
    role: 'assistant',
    content:
      'Understood. I\'ll build the Phase 1 dashboard with:\n\n1. Auth flow (login, signup, 2FA)\n2. Onboarding (business profile, subscription, OpenClaw connection)\n3. Dashboard shell with sidebar navigation\n4. Home, Tasks, Workflows, Integrations, History pages\n5. Mission Control with system health\n\nStarting with the types and mock data layer, then moving to components and pages.',
    timestamp: '2026-04-05T08:10:30Z',
    metadata: { tokensUsed: 312, model: 'gpt-4o', duration: '3.1s' },
  },
  {
    id: 'msg_3',
    sessionId: 'ses_1',
    role: 'user',
    content: 'What\'s the current system health status?',
    timestamp: '2026-04-05T08:14:00Z',
    metadata: { tokensUsed: 28, model: 'gpt-4o', duration: '0.8s' },
  },
  {
    id: 'msg_4',
    sessionId: 'ses_1',
    role: 'assistant',
    content:
      'System health is **98%** — all 8 services are running.\n\n| Service | Status | Latency |\n|---|---|---|\n| OpenClaw Gateway | Running | 8ms |\n| n8n | Running | 23ms |\n| Paperclip | Running | 15ms |\n| PinchTab | Running | 42ms |\n| Neko | Running | 31ms |\n| Firecrawl | Running | 95ms |\n| PostgreSQL | Running | 4ms |\n| Redis | Running | 2ms |\n\nNo incidents open. Queue has 45 active jobs.',
    timestamp: '2026-04-05T08:14:15Z',
    metadata: { tokensUsed: 245, model: 'gpt-4o', duration: '2.8s' },
  },
];
