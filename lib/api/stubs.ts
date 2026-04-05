// ============================================================================
// ClawOps Studio — API Client Stubs
// Phase 1 MVP
// ============================================================================
// These are mock API functions that mirror the Supabase integration pattern.
// Replace with real Supabase client calls once credentials are configured.
//
// TODO for Phase 2:
//   1. Add real Supabase URL and anon key to environment variables
//   2. Replace mock implementations with supabase.from().select() etc.
//   3. Add real-time subscriptions via supabase.channel()
//   4. Add error handling for network failures
// ============================================================================

import type {
  User,
  BusinessProfile,
  Subscription,
  OpenClawConnection,
  Task,
  Goal,
  Workflow,
  ActivityEntry,
  SystemHealth,
  ApiResponse,
  Plan,
} from '@/types';

import {
  MOCK_USER,
  MOCK_BUSINESS_PROFILE,
  MOCK_SUBSCRIPTION,
  MOCK_CONNECTIONS,
  MOCK_TASKS,
  MOCK_GOALS,
  MOCK_WORKFLOWS,
  MOCK_ACTIVITY,
  MOCK_SYSTEM_HEALTH,
  MOCK_PLANS,
} from '@/lib/mock-data';

const simulateDelay = (ms = 300) =>
  new Promise((r) => setTimeout(r, ms));

// ----------------------------------------------------------------------------
// Auth API
// ----------------------------------------------------------------------------

export async function apiLogin(email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
  await simulateDelay(800);
  if (email && password) {
    return {
      success: true,
      data: { user: MOCK_USER, token: 'mock_token_' + Date.now() },
    };
  }
  return { success: false, error: 'Invalid credentials' };
}

export async function apiSignup(
  email: string,
  password: string,
  fullName: string
): Promise<ApiResponse<{ user: User; token: string }>> {
  await simulateDelay(1000);
  if (email && password && fullName) {
    return {
      success: true,
      data: {
        user: { ...MOCK_USER, id: 'usr_' + Date.now(), email, fullName },
        token: 'mock_token_' + Date.now(),
      },
    };
  }
  return { success: false, error: 'Signup failed' };
}

export async function apiVerifyTotp(token: string): Promise<ApiResponse<{ token: string }>> {
  await simulateDelay(400);
  if (/^\d{6}$/.test(token)) {
    return { success: true, data: { token: 'mock_token_' + Date.now() } };
  }
  return { success: false, error: 'Invalid TOTP code' };
}

export async function apiLogout(): Promise<ApiResponse<void>> {
  await simulateDelay(200);
  return { success: true };
}

// ----------------------------------------------------------------------------
// User API
// ----------------------------------------------------------------------------

export async function apiGetMe(): Promise<ApiResponse<User>> {
  await simulateDelay(300);
  return { success: true, data: MOCK_USER };
}

export async function apiUpdateMe(updates: Partial<User>): Promise<ApiResponse<User>> {
  await simulateDelay(400);
  return { success: true, data: { ...MOCK_USER, ...updates } };
}

// ----------------------------------------------------------------------------
// Business Profile API
// ----------------------------------------------------------------------------

export async function apiGetBusinessProfiles(): Promise<ApiResponse<BusinessProfile[]>> {
  await simulateDelay(300);
  return { success: true, data: [MOCK_BUSINESS_PROFILE] };
}

export async function apiCreateBusinessProfile(
  data: Partial<BusinessProfile>
): Promise<ApiResponse<BusinessProfile>> {
  await simulateDelay(500);
  return {
    success: true,
    data: { ...MOCK_BUSINESS_PROFILE, ...data, id: 'biz_' + Date.now() },
  };
}

export async function apiUpdateBusinessProfile(
  id: string,
  updates: Partial<BusinessProfile>
): Promise<ApiResponse<BusinessProfile>> {
  await simulateDelay(400);
  return {
    success: true,
    data: { ...MOCK_BUSINESS_PROFILE, ...updates, id },
  };
}

// ----------------------------------------------------------------------------
// Subscription API
// ----------------------------------------------------------------------------

export async function apiGetSubscription(): Promise<ApiResponse<Subscription>> {
  await simulateDelay(300);
  return { success: true, data: MOCK_SUBSCRIPTION };
}

export async function apiGetPlans(): Promise<ApiResponse<Plan[]>> {
  await simulateDelay(200);
  return { success: true, data: MOCK_PLANS };
}

export async function apiCreateCheckoutSession(
  plan: string
): Promise<ApiResponse<{ url: string }>> {
  await simulateDelay(600);
  // TODO Phase 2: Replace with real Stripe checkout session creation
  return { success: true, data: { url: 'https://checkout.stripe.com/mock' } };
}

// ----------------------------------------------------------------------------
// OpenClaw Connection API
// ----------------------------------------------------------------------------

export async function apiGetConnections(): Promise<ApiResponse<OpenClawConnection[]>> {
  await simulateDelay(300);
  return { success: true, data: MOCK_CONNECTIONS };
}

export async function apiCreateConnection(
  data: Partial<OpenClawConnection>
): Promise<ApiResponse<OpenClawConnection>> {
  await simulateDelay(600);
  return {
    success: true,
    data: {
      ...data,
      id: 'ocn_' + Date.now(),
      userId: MOCK_USER.id,
      isActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as OpenClawConnection,
  };
}

export async function apiTestConnection(id: string): Promise<ApiResponse<{ success: boolean }>> {
  await simulateDelay(1000);
  // TODO Phase 2: Replace with real OpenClaw gateway health check
  return { success: true, data: { success: true } };
}

export async function apiDeleteConnection(id: string): Promise<ApiResponse<void>> {
  await simulateDelay(300);
  return { success: true };
}

// ----------------------------------------------------------------------------
// Tasks API
// ----------------------------------------------------------------------------

export async function apiGetTasks(filters?: { status?: string; priority?: string }): Promise<ApiResponse<Task[]>> {
  await simulateDelay(300);
  let tasks = MOCK_TASKS;
  if (filters?.status) {
    tasks = tasks.filter((t) => t.status === filters.status);
  }
  if (filters?.priority) {
    tasks = tasks.filter((t) => t.priority === filters.priority);
  }
  return { success: true, data: tasks };
}

export async function apiCreateTask(data: Partial<Task>): Promise<ApiResponse<Task>> {
  await simulateDelay(400);
  return {
    success: true,
    data: {
      ...data,
      id: 'tsk_' + Date.now(),
      userId: MOCK_USER.id,
      status: 'TODO',
      priority: 'P2',
      definitionOfDone: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Task,
  };
}

export async function apiUpdateTask(
  id: string,
  updates: Partial<Task>
): Promise<ApiResponse<Task>> {
  await simulateDelay(300);
  const task = MOCK_TASKS.find((t) => t.id === id);
  return { success: true, data: { ...task!, ...updates } };
}

export async function apiDeleteTask(id: string): Promise<ApiResponse<void>> {
  await simulateDelay(200);
  return { success: true };
}

// ----------------------------------------------------------------------------
// Goals API
// ----------------------------------------------------------------------------

export async function apiGetGoals(): Promise<ApiResponse<Goal[]>> {
  await simulateDelay(300);
  return { success: true, data: MOCK_GOALS };
}

export async function apiCreateGoal(data: Partial<Goal>): Promise<ApiResponse<Goal>> {
  await simulateDelay(400);
  return {
    success: true,
    data: {
      ...data,
      id: 'goal_' + Date.now(),
      userId: MOCK_USER.id,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Goal,
  };
}

// ----------------------------------------------------------------------------
// Workflows API
// ----------------------------------------------------------------------------

export async function apiGetWorkflows(): Promise<ApiResponse<Workflow[]>> {
  await simulateDelay(300);
  return { success: true, data: MOCK_WORKFLOWS };
}

export async function apiCreateWorkflow(data: Partial<Workflow>): Promise<ApiResponse<Workflow>> {
  await simulateDelay(500);
  return {
    success: true,
    data: {
      ...data,
      id: 'wf_' + Date.now(),
      userId: MOCK_USER.id,
      isActive: false,
      runCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Workflow,
  };
}

export async function apiToggleWorkflow(id: string): Promise<ApiResponse<Workflow>> {
  await simulateDelay(200);
  const wf = MOCK_WORKFLOWS.find((w) => w.id === id);
  return { success: true, data: { ...wf!, isActive: !wf!.isActive } };
}

// ----------------------------------------------------------------------------
// Activity API
// ----------------------------------------------------------------------------

export async function apiGetActivity(
  filters?: { actionType?: string }
): Promise<ApiResponse<ActivityEntry[]>> {
  await simulateDelay(300);
  let entries = MOCK_ACTIVITY;
  if (filters?.actionType) {
    entries = entries.filter((e) => e.actionType === filters.actionType);
  }
  return { success: true, data: entries };
}

// ----------------------------------------------------------------------------
// System Health API (Mission Control)
// ----------------------------------------------------------------------------

export async function apiGetSystemHealth(): Promise<ApiResponse<SystemHealth>> {
  await simulateDelay(500);
  return { success: true, data: MOCK_SYSTEM_HEALTH };
}

export async function apiRefreshSystemHealth(): Promise<ApiResponse<SystemHealth>> {
  await simulateDelay(600);
  return {
    success: true,
    data: {
      ...MOCK_SYSTEM_HEALTH,
      lastUpdated: new Date().toISOString(),
    },
  };
}
