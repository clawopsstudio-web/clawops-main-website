// ============================================================================
// ClawOps Studio — Utility Functions
// Phase 1 MVP
// ============================================================================

import { type ClassValue, clsx } from 'clsx';

// Tailwind class merger (lightweight, no twMerge dep needed for now)
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// ----------------------------------------------------------------------------
// Date / Time
// ----------------------------------------------------------------------------

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  return `${mins}m ${remainingSecs}s`;
}

// ----------------------------------------------------------------------------
// Number formatting
// ----------------------------------------------------------------------------

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(value: number): string {
  return `${value}%`;
}

// ----------------------------------------------------------------------------
// Status helpers
// ----------------------------------------------------------------------------

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    // Task statuses
    TODO: 'text-yellow-400',
    DOING: 'text-blue-400',
    BLOCKED: 'text-red-400',
    DONE: 'text-green-400',
    DEFERRED: 'text-gray-500',

    // Priority
    P0: 'text-red-500',
    P1: 'text-orange-400',
    P2: 'text-yellow-400',
    P3: 'text-gray-400',

    // Service statuses
    running: 'text-green-400',
    stopped: 'text-gray-500',
    error: 'text-red-400',
    unknown: 'text-gray-500',

    // Agent statuses
    active: 'text-green-400',
    idle: 'text-yellow-400',
    busy: 'text-blue-400',
    offline: 'text-gray-500',

    // Subscription statuses
    trialing: 'text-blue-400',
    past_due: 'text-orange-400',
    canceled: 'text-red-400',
    expired: 'text-gray-500',
  };
  return map[status] ?? 'text-gray-400';
}

export function getStatusDotColor(status: string): string {
  const map: Record<string, string> = {
    running: 'bg-green-400',
    active: 'bg-green-400',
    completed: 'bg-green-400',
    done: 'bg-green-400',
    todo: 'bg-yellow-400',
    idle: 'bg-yellow-400',
    trialing: 'bg-blue-400',
    doing: 'bg-blue-400',
    busy: 'bg-blue-400',
    deferred: 'bg-gray-500',
    stopped: 'bg-gray-500',
    offline: 'bg-gray-500',
    blocked: 'bg-red-400',
    error: 'bg-red-400',
    failed: 'bg-red-400',
    canceled: 'bg-red-400',
    expired: 'bg-gray-500',
  };
  return map[status.toLowerCase()] ?? 'bg-gray-500';
}

export function getStatusBgColor(status: string): string {
  const map: Record<string, string> = {
    running: 'bg-green-400/10 border-green-400/30',
    active: 'bg-green-400/10 border-green-400/30',
    completed: 'bg-green-400/10 border-green-400/30',
    done: 'bg-green-400/10 border-green-400/30',
    todo: 'bg-yellow-400/10 border-yellow-400/30',
    idle: 'bg-yellow-400/10 border-yellow-400/30',
    doing: 'bg-blue-400/10 border-blue-400/30',
    busy: 'bg-blue-400/10 border-blue-400/30',
    deferred: 'bg-gray-500/10 border-gray-500/30',
    stopped: 'bg-gray-500/10 border-gray-500/30',
    offline: 'bg-gray-500/10 border-gray-500/30',
    blocked: 'bg-red-400/10 border-red-400/30',
    error: 'bg-red-400/10 border-red-400/30',
    failed: 'bg-red-400/10 border-red-400/30',
    canceled: 'bg-red-400/10 border-red-400/30',
    expired: 'bg-gray-500/10 border-gray-500/30',
  };
  return map[status.toLowerCase()] ?? 'bg-gray-500/10 border-gray-500/30';
}

// ----------------------------------------------------------------------------
// Plan helpers
// ----------------------------------------------------------------------------

export function getPlanDisplayName(plan: string): string {
  const map: Record<string, string> = {
    starter: 'Starter',
    growth: 'Growth',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };
  return map[plan] ?? plan;
}

export function getPlanColor(plan: string): string {
  const map: Record<string, string> = {
    starter: 'border-blue-500/40 bg-blue-500/5',
    growth: 'border-cyan-500/40 bg-cyan-500/5',
    pro: 'border-violet-500/40 bg-violet-500/5',
    enterprise: 'border-amber-500/40 bg-amber-500/5',
  };
  return map[plan] ?? '';
}

// ----------------------------------------------------------------------------
// Misc
// ----------------------------------------------------------------------------

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function actionTypeLabel(type: string): string {
  const map: Record<string, string> = {
    login: 'Logged in',
    logout: 'Logged out',
    signup: 'Signed up',
    task_created: 'Created task',
    task_updated: 'Updated task',
    task_deleted: 'Deleted task',
    agent_launched: 'Launched agent',
    agent_stopped: 'Stopped agent',
    workflow_created: 'Created workflow',
    workflow_run: 'Workflow executed',
    connection_created: 'Connected OpenClaw',
    connection_updated: 'Updated connection',
    connection_deleted: 'Removed connection',
  };
  return map[type] ?? type.replace(/_/g, ' ');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Health score color
export function getHealthScoreColor(score: number): string {
  if (score >= 90) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
}

export function getHealthScoreBg(score: number): string {
  if (score >= 90) return 'bg-green-400/10 border-green-400/30';
  if (score >= 70) return 'bg-yellow-400/10 border-yellow-400/30';
  if (score >= 50) return 'bg-orange-400/10 border-orange-400/30';
  return 'bg-red-400/10 border-red-400/30';
}
