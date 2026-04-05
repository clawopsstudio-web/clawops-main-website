// ============================================================================
// ClawOps Studio — Client State Store (Zustand)
// Phase 1 MVP
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  OnboardingState,
  AuthState,
  DashboardStats,
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
  MOCK_DASHBOARD_STATS,
} from '@/lib/mock-data';

// ----------------------------------------------------------------------------
// Auth Store
// ----------------------------------------------------------------------------

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  verifyTotp: (token: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  setLoading: (loading: boolean) => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email, _password) => {
        set({ isLoading: true });
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 800));

        if (email && _password) {
          // Mock: accept any credentials
          set({
            session: {
              userId: MOCK_USER.id,
              email: MOCK_USER.email,
              role: MOCK_USER.role,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              accessToken: 'mock_jwt_token_' + Date.now(),
            },
            user: MOCK_USER,
            isLoading: false,
            isAuthenticated: true,
          });
          return { success: true };
        }

        set({ isLoading: false });
        return { success: false, error: 'Invalid email or password' };
      },

      logout: () => {
        set({ session: null, user: null, isAuthenticated: false });
      },

      verifyTotp: async (token) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 400));
        // Mock: accept any 6-digit token
        if (/^\d{6}$/.test(token)) {
          set({ isLoading: false });
          return { success: true };
        }
        set({ isLoading: false });
        return { success: false, error: 'Invalid TOTP code' };
      },

      signup: async (email, _password, fullName) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 1000));

        if (email && _password && fullName) {
          const newUser: User = {
            ...MOCK_USER,
            id: 'usr_' + Date.now(),
            email,
            fullName,
            totpEnabled: false,
          };
          set({
            session: {
              userId: newUser.id,
              email: newUser.email,
              role: newUser.role,
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              accessToken: 'mock_jwt_token_' + Date.now(),
            },
            user: newUser,
            isLoading: false,
            isAuthenticated: true,
          });
          return { success: true };
        }

        set({ isLoading: false });
        return { success: false, error: 'All fields are required' };
      },

      setLoading: (loading) => set({ isLoading: loading }),

      completeOnboarding: () => {
        // Onboarding completion is tracked in onboarding store
      },
    }),
    {
      name: 'clawops-auth',
      partialize: (state) => ({
        session: state.session,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ----------------------------------------------------------------------------
// Onboarding Store
// ----------------------------------------------------------------------------

interface OnboardingStore extends OnboardingState {
  setStep: (step: OnboardingState['currentStep']) => void;
  saveBusinessProfile: (data: Partial<BusinessProfile>) => void;
  saveSubscription: (data: Partial<Subscription>) => void;
  saveConnection: (data: Partial<OpenClawConnection>) => void;
  finish: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 'login',
  completed: false,
  data: {},

  setStep: (step) => set({ currentStep: step }),

  saveBusinessProfile: (data) =>
    set((state) => ({
      data: { ...state.data, businessProfileId: 'biz_' + Date.now() },
    })),

  saveSubscription: (data) =>
    set((state) => ({
      data: { ...state.data, subscriptionId: 'sub_' + Date.now() },
    })),

  saveConnection: (data) =>
    set((state) => ({
      data: { ...state.data, connectionId: 'ocn_' + Date.now() },
    })),

  finish: () => set({ completed: true }),

  reset: () =>
    set({
      currentStep: 'login',
      completed: false,
      data: {},
    }),
}));

// ----------------------------------------------------------------------------
// Business Profile Store
// ----------------------------------------------------------------------------

interface BusinessProfileStore {
  profile: BusinessProfile | null;
  setProfile: (profile: BusinessProfile) => void;
  updateProfile: (updates: Partial<BusinessProfile>) => void;
}

export const useBusinessProfileStore = create<BusinessProfileStore>((set) => ({
  profile: MOCK_BUSINESS_PROFILE,
  setProfile: (profile) => set({ profile }),
  updateProfile: (updates) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, ...updates } : null,
    })),
}));

// ----------------------------------------------------------------------------
// Subscription Store
// ----------------------------------------------------------------------------

interface SubscriptionStore {
  subscription: Subscription | null;
  setSubscription: (sub: Subscription) => void;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  subscription: MOCK_SUBSCRIPTION,
  setSubscription: (sub) => set({ subscription: sub }),
}));

// ----------------------------------------------------------------------------
// Connections Store
// ----------------------------------------------------------------------------

interface ConnectionsStore {
  connections: OpenClawConnection[];
  activeConnection: OpenClawConnection | null;
  addConnection: (conn: OpenClawConnection) => void;
  updateConnection: (id: string, updates: Partial<OpenClawConnection>) => void;
  removeConnection: (id: string) => void;
  setActive: (id: string) => void;
}

export const useConnectionsStore = create<ConnectionsStore>((set) => ({
  connections: MOCK_CONNECTIONS,
  activeConnection: MOCK_CONNECTIONS.find((c) => c.isActive) ?? null,

  addConnection: (conn) =>
    set((state) => ({ connections: [...state.connections, conn] })),

  updateConnection: (id, updates) =>
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    })),

  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
      activeConnection:
        state.activeConnection?.id === id ? null : state.activeConnection,
    })),

  setActive: (id) =>
    set((state) => ({
      connections: state.connections.map((c) => ({
        ...c,
        isActive: c.id === id,
        lastConnectedAt: c.id === id ? new Date().toISOString() : c.lastConnectedAt,
      })),
      activeConnection: state.connections.find((c) => c.id === id) ?? null,
    })),
}));

// ----------------------------------------------------------------------------
// Tasks Store
// ----------------------------------------------------------------------------

interface TasksStore {
  tasks: Task[];
  filter: { status?: Task['status']; priority?: Task['priority'] };
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setFilter: (filter: Partial<TasksStore['filter']>) => void;
  getTasksByStatus: () => Record<Task['status'], Task[]>;
}

export const useTasksStore = create<TasksStore>((set, get) => ({
  tasks: MOCK_TASKS,
  filter: {},

  addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    })),

  deleteTask: (id) =>
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),

  getTasksByStatus: () => {
    const { tasks, filter } = get();
    const filtered = tasks.filter((t) => {
      if (filter.status && t.status !== filter.status) return false;
      if (filter.priority && t.priority !== filter.priority) return false;
      return true;
    });
    return {
      TODO: filtered.filter((t) => t.status === 'TODO'),
      DOING: filtered.filter((t) => t.status === 'DOING'),
      BLOCKED: filtered.filter((t) => t.status === 'BLOCKED'),
      DONE: filtered.filter((t) => t.status === 'DONE'),
      DEFERRED: filtered.filter((t) => t.status === 'DEFERRED'),
    };
  },
}));

// ----------------------------------------------------------------------------
// Goals Store
// ----------------------------------------------------------------------------

interface GoalsStore {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
}

export const useGoalsStore = create<GoalsStore>((set) => ({
  goals: MOCK_GOALS,
  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
  updateGoal: (id, updates) =>
    set((state) => ({
      goals: state.goals.map((g) =>
        g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
      ),
    })),
  deleteGoal: (id) =>
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),
}));

// ----------------------------------------------------------------------------
// Workflows Store
// ----------------------------------------------------------------------------

interface WorkflowsStore {
  workflows: Workflow[];
  toggleWorkflow: (id: string) => void;
  addWorkflow: (wf: Workflow) => void;
}

export const useWorkflowsStore = create<WorkflowsStore>((set) => ({
  workflows: MOCK_WORKFLOWS,
  toggleWorkflow: (id) =>
    set((state) => ({
      workflows: state.workflows.map((w) =>
        w.id === id
          ? { ...w, isActive: !w.isActive, updatedAt: new Date().toISOString() }
          : w
      ),
    })),
  addWorkflow: (wf) => set((state) => ({ workflows: [wf, ...state.workflows] })),
}));

// ----------------------------------------------------------------------------
// Activity Store
// ----------------------------------------------------------------------------

interface ActivityStore {
  entries: ActivityEntry[];
  filter: { actionType?: ActionType };
  setFilter: (filter: Partial<{ actionType: ActionType }>) => void;
}

type ActionType = ActivityEntry['actionType'];

export const useActivityStore = create<ActivityStore>((set) => ({
  entries: MOCK_ACTIVITY,
  filter: {},
  setFilter: (filter) =>
    set((state) => ({ filter: { ...state.filter, ...filter } })),
}));

// ----------------------------------------------------------------------------
// System Health Store (Mission Control)
// ----------------------------------------------------------------------------

interface SystemHealthStore {
  health: SystemHealth;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

export const useSystemHealthStore = create<SystemHealthStore>((set) => ({
  health: MOCK_SYSTEM_HEALTH,
  isRefreshing: false,

  refresh: async () => {
    set({ isRefreshing: true });
    await new Promise((r) => setTimeout(r, 600));
    set({
      health: {
        ...MOCK_SYSTEM_HEALTH,
        lastUpdated: new Date().toISOString(),
        memoryUsage: Math.floor(Math.random() * 20) + 55,
        cpuUsage: Math.floor(Math.random() * 15) + 10,
      },
      isRefreshing: false,
    });
  },
}));

// ----------------------------------------------------------------------------
// Dashboard Stats Store
// ----------------------------------------------------------------------------

interface DashboardStatsStore {
  stats: DashboardStats;
  refresh: () => Promise<void>;
}

export const useDashboardStatsStore = create<DashboardStatsStore>((set) => ({
  stats: MOCK_DASHBOARD_STATS,
  refresh: async () => {
    await new Promise((r) => setTimeout(r, 400));
    set({ stats: MOCK_DASHBOARD_STATS });
  },
}));

// ----------------------------------------------------------------------------
// UI Store (transient sidebar state, modals, etc.)
// ----------------------------------------------------------------------------

interface UIStore {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  activeModal: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  activeModal: null,
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));
