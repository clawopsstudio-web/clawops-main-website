// ============================================================================
// ClawOps Studio — Type Definitions
// Phase 1 MVP
// ============================================================================

// ----------------------------------------------------------------------------
// User & Auth
// ----------------------------------------------------------------------------

export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'deleted';

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  totpEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
  expiresAt: string;
  accessToken: string;
}

export interface AuthState {
  session: AuthSession | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ----------------------------------------------------------------------------
// Business Profile
// ----------------------------------------------------------------------------

export type BusinessType = 'Agency' | 'SMB' | 'Enterprise';
export type Language = 'en' | 'es' | 'fr' | 'de' | 'pt' | 'zh';

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType: BusinessType;
  industry?: string;
  logoUrl?: string;
  websiteUrl?: string;
  timezone: string;
  language: Language;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Subscription & Plans
// ----------------------------------------------------------------------------

export type PlanTier = 'starter' | 'growth' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired';

export interface Plan {
  id: PlanTier;
  name: string;
  tagline: string;
  price: {
    monthly: number;
    setupFee: number;
  };
  features: string[];
  limits: {
    agents: number;
    workflows: number;
    seats: number;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelAt?: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// OpenClaw Connection
// ----------------------------------------------------------------------------

export type Environment = 'development' | 'staging' | 'production';

export interface OpenClawConnection {
  id: string;
  userId: string;
  businessProfileId?: string;
  connectionName: string;
  gatewayUrl: string;
  apiKey: string;
  workspacePath?: string;
  environment: Environment;
  isActive: boolean;
  lastConnectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Tasks
// ----------------------------------------------------------------------------

export type TaskPriority = 'P0' | 'P1' | 'P2' | 'P3';
export type TaskStatus = 'TODO' | 'DOING' | 'BLOCKED' | 'DONE' | 'DEFERRED';

export interface Task {
  id: string;
  userId: string;
  businessProfileId?: string;
  goalId?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  owner?: string;
  currentState?: string;
  nextAction?: string;
  definitionOfDone: string[];
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Goals
// ----------------------------------------------------------------------------

export interface Goal {
  id: string;
  userId: string;
  businessProfileId?: string;
  goalName: string;
  targetValue?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------------
// Workflows
// ----------------------------------------------------------------------------

export type TriggerType = 'scheduled' | 'webhook' | 'event';

export interface Workflow {
  id: string;
  userId: string;
  name: string;
  description?: string;
  triggerType: TriggerType;
  triggerConfig: Record<string, unknown>;
  isActive: boolean;
  lastRunAt?: string;
  runCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'skipped';
  startTime: string;
  endTime?: string;
  duration?: string;
  logs?: string;
}

// ----------------------------------------------------------------------------
// Activity History
// ----------------------------------------------------------------------------

export type ActionType =
  | 'login'
  | 'logout'
  | 'signup'
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'agent_launched'
  | 'agent_stopped'
  | 'workflow_created'
  | 'workflow_run'
  | 'connection_created'
  | 'connection_updated'
  | 'connection_deleted';

export interface ActivityEntry {
  id: string;
  userId: string;
  businessProfileId?: string;
  actionType: ActionType;
  entityType?: string;
  entityId?: string;
  entityData: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ----------------------------------------------------------------------------
// Mission Control — System Health
// ----------------------------------------------------------------------------

export type ServiceStatus = 'running' | 'stopped' | 'error' | 'unknown';

export interface Service {
  id: string;
  name: string;
  displayName: string;
  status: ServiceStatus;
  port?: number;
  url?: string;
  latency?: number;
  uptime?: string;
  version?: string;
  lastChecked: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  model: string;
  status: 'active' | 'idle' | 'busy' | 'offline';
  lastActivity: string;
  sessionCount: number;
}

export interface SystemHealth {
  score: number;
  services: Service[];
  agents: AgentInfo[];
  queueActive: number;
  incidentsOpen: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
  lastUpdated: string;
}

// ----------------------------------------------------------------------------
// API Response Shapes
// ----------------------------------------------------------------------------

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ----------------------------------------------------------------------------
// Onboarding
// ----------------------------------------------------------------------------

export type OnboardingStep =
  | 'login'
  | 'signup'
  | 'totp-setup'
  | 'business-profile'
  | 'subscription'
  | 'connect-openclaw'
  | 'welcome';

export interface OnboardingState {
  currentStep: OnboardingStep;
  completed: boolean;
  data: {
    userId?: string;
    businessProfileId?: string;
    subscriptionId?: string;
    connectionId?: string;
  };
}

// ----------------------------------------------------------------------------
// Chat / Agent Session
// ----------------------------------------------------------------------------

export interface AgentSession {
  id: string;
  userId: string;
  businessProfileId?: string;
  agentId?: string;
  customAgentName?: string;
  agentModel: string;
  agentSystemPrompt?: string;
  connectionId?: string;
  isActive: boolean;
  startTime: string;
  lastActivityAt?: string;
  settings: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    tokensUsed?: number;
    model?: string;
    duration?: string;
  };
}

// ----------------------------------------------------------------------------
// Dashboard Stats (Home Page)
// ----------------------------------------------------------------------------

export interface DashboardStats {
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  activeWorkflows: number;
  systemHealth: number;
  recentActivity: ActivityEntry[];
}
