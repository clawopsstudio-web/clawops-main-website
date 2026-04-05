'use client';

// ============================================================================
// ClawOps Studio — Dashboard Home
// Phase 1 MVP
// ============================================================================

import { useDashboardStatsStore } from '@/lib/store';
import { formatRelativeTime, actionTypeLabel, getHealthScoreColor, getHealthScoreBg, formatCurrency } from '@/lib/utils';
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import Card, { SectionHeader } from '@/components/dashboard/Card';
import StatusBadge, { PriorityBadge } from '@/components/dashboard/StatusBadge';
import Link from 'next/link';

export default function DashboardPage() {
  const { stats } = useDashboardStatsStore();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Dashboard"
        description="Your AI workforce at a glance"
        badge="LIVE"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Active Agents"
          value={stats.activeAgents}
          subValue="2 running now"
          color="cyan"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          }
        />
        <StatCard
          label="System Health"
          value={`${stats.systemHealth}%`}
          subValue="All services nominal"
          color="green"
          className={getHealthScoreBg(stats.systemHealth)}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          }
        />
        <StatCard
          label="Tasks"
          value={`${stats.completedTasks}/${stats.totalTasks}`}
          subValue="completed today"
          color="yellow"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          }
        />
        <StatCard
          label="Active Workflows"
          value={stats.activeWorkflows}
          subValue="3 total workflows"
          color="violet"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 3 21 3 21 8"/>
              <line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/>
              <line x1="15" y1="15" x2="21" y2="21"/>
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card
            title="Quick Actions"
            noPadding
          >
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'New Task', href: '/dashboard/tasks', icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                )},
                { label: 'Start Chat', href: '/dashboard/chat', icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                )},
                { label: 'Mission Control', href: '/dashboard/mission-control', icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                )},
                { label: 'Workflows', href: '/dashboard/workflows', icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/></svg>
                )},
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-[#00D4FF]/30 hover:bg-[#00D4FF]/5 transition-all duration-150 group"
                >
                  <span className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/15 flex items-center justify-center text-[#00D4FF] group-hover:bg-[#00D4FF]/15 transition-colors">
                    {action.icon}
                  </span>
                  <span className="text-xs font-medium text-white/60 group-hover:text-white/80 transition-colors">{action.label}</span>
                </Link>
              ))}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card title="Recent Activity">
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0"
                >
                  <div className="w-2 h-2 rounded-full bg-[#00D4FF]/50 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/70">
                      <span className="text-white/90 font-medium">{actionTypeLabel(activity.actionType)}</span>
                      {activity.entityData && 'title' in activity.entityData && (
                        <span className="text-white/40"> — {(activity.entityData.title as string) || activity.entityType}</span>
                      )}
                    </p>
                    <p className="text-[11px] text-white/30 mt-0.5 font-mono">
                      {formatRelativeTime(activity.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={activity.actionType.includes('error') ? 'error' : 'active'} size="sm" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* System Status */}
          <Card
            title="System Status"
            action={
              <Link href="/dashboard/mission-control" className="text-[10px] font-mono text-[#00D4FF]/60 hover:text-[#00D4FF] transition-colors">
                Full View →
              </Link>
            }
          >
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#00D4FF] transition-all duration-500"
                    style={{ width: `${stats.systemHealth}%` }}
                  />
                </div>
                <span className={`text-sm font-bold font-mono ${getHealthScoreColor(stats.systemHealth)}`}>
                  {stats.systemHealth}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Memory', value: '62%', color: 'bg-blue-400/40' },
                  { label: 'CPU', value: '18%', color: 'bg-green-400/40' },
                  { label: 'Disk', value: '34%', color: 'bg-violet-400/40' },
                ].map((metric) => (
                  <div key={metric.label} className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-2">
                    <p className="text-[10px] text-white/30 font-mono uppercase">{metric.label}</p>
                    <p className="text-sm font-bold text-white/70 font-mono">{metric.value}</p>
                    <div className="h-1 rounded-full bg-white/[0.06] mt-1.5 overflow-hidden">
                      <div className={`h-full rounded-full ${metric.color}`} style={{ width: metric.value }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* OpenClaw Connection */}
          <Card title="OpenClaw Connection">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm text-white/70">Production Gateway</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-white/30">Gateway</span>
                  <span className="text-white/50 font-mono">gateway.clawops.studio</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/30">Environment</span>
                  <span className="text-[#00D4FF] font-mono">production</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/30">Latency</span>
                  <span className="text-green-400 font-mono">8ms</span>
                </div>
              </div>
              <Link
                href="/dashboard/integrations"
                className="block text-center text-xs font-medium text-[#00D4FF]/70 hover:text-[#00D4FF] transition-colors py-1.5 border border-[#00D4FF]/15 hover:border-[#00D4FF]/30 rounded-lg"
              >
                Manage Connections
              </Link>
            </div>
          </Card>

          {/* Subscription */}
          <Card title="Subscription">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">Growth Plan</p>
                <p className="text-xs text-white/30">{formatCurrency(499)}/month</p>
              </div>
            </div>
            <div className="flex justify-between text-xs mb-3">
              <span className="text-white/30">Renewal</span>
              <span className="text-white/50 font-mono">Apr 1, 2026</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/30">Agents</span>
                <span className="text-white/50 font-mono">2 / 3</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/30">Workflows</span>
                <span className="text-white/50 font-mono">4 / 25</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
