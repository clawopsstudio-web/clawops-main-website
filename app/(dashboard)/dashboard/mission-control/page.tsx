'use client';

// ============================================================================
// ClawOps Studio — Mission Control
// Phase 1 MVP
// ============================================================================

import { useSystemHealthStore } from '@/lib/store';
import {
  formatRelativeTime,
  getHealthScoreColor,
  getHealthScoreBg,
  getStatusBgColor,
} from '@/lib/utils';
import PageHeader from '@/components/dashboard/PageHeader';
import StatCard from '@/components/dashboard/StatCard';
import Card from '@/components/dashboard/Card';
import StatusBadge from '@/components/dashboard/StatusBadge';
import type { Service } from '@/types';

function ServiceRow({ service }: { service: Service }) {
  const statusColor = service.status === 'running' ? 'text-green-400' : service.status === 'error' ? 'text-red-400' : 'text-white/40';
  const statusBg = getStatusBgColor(service.status);

  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.01] rounded px-2 -mx-2 transition-colors">
      {/* Status */}
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{
        backgroundColor: service.status === 'running' ? '#4ade80' : service.status === 'error' ? '#f87171' : '#9ca3af'
      }} />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white/80">{service.displayName}</p>
          <span className="text-[9px] font-mono text-white/20">{service.name}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {service.port && (
            <span className="text-[10px] font-mono text-white/25">:{service.port}</span>
          )}
          {service.version && (
            <span className="text-[10px] font-mono text-white/25">v{service.version}</span>
          )}
          {service.uptime && (
            <span className="text-[10px] font-mono text-white/25">{service.uptime}</span>
          )}
        </div>
      </div>

      {/* Latency */}
      {service.latency !== undefined && (
        <div className="text-right flex-shrink-0">
          <span className={`text-sm font-mono font-bold ${
            service.latency < 50 ? 'text-green-400' : service.latency < 100 ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {service.latency}ms
          </span>
        </div>
      )}

      {/* Status badge */}
      <StatusBadge status={service.status} size="sm" />
    </div>
  );
}

export default function MissionControlPage() {
  const { health, refresh, isRefreshing } = useSystemHealthStore();
  const { score, services, agents, queueActive, incidentsOpen, memoryUsage, cpuUsage, diskUsage, lastUpdated } = health;

  const runningServices = services.filter(s => s.status === 'running').length;
  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'busy').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Mission Control"
        description="Monitor your AI infrastructure in real-time"
        badge="LIVE"
        badgeColor="bg-green-400/10 text-green-400 border-green-400/20"
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30 font-mono">
              Updated {formatRelativeTime(lastUpdated)}
            </span>
            <button
              onClick={refresh}
              disabled={isRefreshing}
              className="btn btn-ghost text-sm py-2 px-3 disabled:opacity-50"
            >
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2"
                className={isRefreshing ? 'animate-spin' : ''}
              >
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
              Refresh
            </button>
          </div>
        }
      />

      {/* Health Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <StatCard
          label="Health Score"
          value={`${score}%`}
          color="green"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          }
        />
        <StatCard
          label="Services"
          value={`${runningServices}/${services.length}`}
          subValue="all running"
          color="cyan"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          }
        />
        <StatCard
          label="Active Agents"
          value={activeAgents}
          subValue={`${agents.length} total`}
          color="violet"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          }
        />
        <StatCard
          label="Queue Jobs"
          value={queueActive}
          subValue="processing"
          color="yellow"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          }
        />
        <StatCard
          label="Incidents"
          value={incidentsOpen}
          subValue="open"
          color={incidentsOpen > 0 ? 'red' : 'green'}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          }
        />
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Memory', value: memoryUsage, color: '#00D4FF' },
          { label: 'CPU', value: cpuUsage, color: '#4ade80' },
          { label: 'Disk', value: diskUsage, color: '#a78bfa' },
        ].map((resource) => (
          <Card key={resource.label} noPadding>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 font-medium uppercase tracking-wider">{resource.label}</span>
                <span className="text-sm font-mono font-bold" style={{ color: resource.color }}>{resource.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${resource.value}%`,
                    backgroundColor: resource.color,
                    boxShadow: `0 0 8px ${resource.color}40`
                  }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Services List */}
        <Card title="Services" description={`${runningServices} of ${services.length} running`}>
          <div>
            {services.map((service) => (
              <ServiceRow key={service.id} service={service} />
            ))}
          </div>
        </Card>

        {/* Agent Monitoring */}
        <Card title="Agent Sessions" description={`${activeAgents} active`}>
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0"
              >
                {/* Agent Avatar */}
                <div className="w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={agent.status === 'active' ? '#00D4FF' : agent.status === 'busy' ? '#60a5fa' : agent.status === 'idle' ? '#fbbf24' : '#6b7280'} strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white/80">{agent.name}</p>
                    <span className="text-[9px] font-mono text-white/25 bg-white/[0.04] px-1.5 py-0.5 rounded">
                      {agent.model}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/25 font-mono mt-0.5">
                    {agent.sessionCount} sessions • active {formatRelativeTime(agent.lastActivity)}
                  </p>
                </div>

                <StatusBadge status={agent.status} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
