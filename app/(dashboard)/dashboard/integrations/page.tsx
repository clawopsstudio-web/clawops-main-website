'use client';

// ============================================================================
// ClawOps Studio — Integrations Page
// Phase 1 MVP
// ============================================================================

import { useConnectionsStore } from '@/lib/store';
import { formatRelativeTime, truncate } from '@/lib/utils';
import PageHeader from '@/components/dashboard/PageHeader';
import Card, { EmptyState } from '@/components/dashboard/Card';
import StatusBadge from '@/components/dashboard/StatusBadge';

const AVAILABLE_INTEGRATIONS = [
  {
    id: 'openclaw',
    name: 'OpenClaw Gateway',
    description: 'Connect your OpenClaw instance to manage agents',
    icon: '🦷',
    category: 'Core',
    connected: true,
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Deploy agents on Telegram',
    icon: '✈️',
    category: 'Messaging',
    connected: false,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Connect to Slack workspaces',
    icon: '💬',
    category: 'Messaging',
    connected: false,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Sync tasks and notes to Notion',
    icon: '📝',
    category: 'Productivity',
    connected: false,
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Payment processing and billing',
    icon: '💳',
    category: 'Payments',
    connected: false,
  },
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Database and auth backend',
    icon: '🗄️',
    category: 'Infrastructure',
    connected: false,
  },
];

export default function IntegrationsPage() {
  const { connections, addConnection, removeConnection, setActive } = useConnectionsStore();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Integrations"
        description="Connect external services and manage your OpenClaw instances"
        actions={
          <button className="btn btn-primary text-sm py-2 px-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Connection
          </button>
        }
      />

      {/* OpenClaw Connections */}
      <Card title="OpenClaw Connections" description={`${connections.length} configured`} className="mb-6">
        {connections.length === 0 ? (
          <EmptyState
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>}
            title="No OpenClaw connections"
            description="Connect your first OpenClaw gateway instance"
            action={<button className="btn btn-primary text-sm py-2 px-4">Add Connection</button>}
          />
        ) : (
          <div className="space-y-3">
            {connections.map((conn) => (
              <div
                key={conn.id}
                className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0"
              >
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                  conn.isActive
                    ? 'bg-[#00D4FF]/10 border-[#00D4FF]/20'
                    : 'bg-white/[0.04] border-white/[0.08]'
                }`}>
                  <span className="text-lg">🦷</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-medium text-white/80">{conn.connectionName}</h4>
                    <StatusBadge status={conn.isActive ? 'running' : 'stopped'} size="sm" />
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      conn.environment === 'production'
                        ? 'bg-green-400/10 text-green-400 border-green-400/20'
                        : conn.environment === 'staging'
                        ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
                        : 'bg-gray-400/10 text-gray-400 border-gray-400/20'
                    }`}>
                      {conn.environment}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-white/30">
                    <span>{truncate(conn.gatewayUrl, 40)}</span>
                    {conn.lastConnectedAt && (
                      <span>Last: {formatRelativeTime(conn.lastConnectedAt)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {conn.isActive ? (
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                  ) : (
                    <button
                      onClick={() => setActive(conn.id)}
                      className="text-xs text-[#00D4FF]/70 hover:text-[#00D4FF] transition-colors px-2 py-1 rounded border border-[#00D4FF]/15 hover:border-[#00D4FF]/30"
                    >
                      Connect
                    </button>
                  )}
                  <button className="text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded border border-white/[0.06] hover:border-white/[0.1]">
                    Edit
                  </button>
                  <button
                    onClick={() => removeConnection(conn.id)}
                    className="text-xs text-red-400/50 hover:text-red-400 transition-colors px-2 py-1 rounded border border-red-400/10 hover:border-red-400/20"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Available Integrations */}
      <Card title="Available Integrations">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {AVAILABLE_INTEGRATIONS.map((int) => (
            <div
              key={int.id}
              className={`rounded-lg border p-4 transition-colors ${
                int.connected
                  ? 'bg-[#00D4FF]/5 border-[#00D4FF]/15'
                  : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1]'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{int.icon}</span>
                  <div>
                    <h4 className="text-sm font-medium text-white/80">{int.name}</h4>
                    <span className="text-[9px] font-mono text-white/25 uppercase">{int.category}</span>
                  </div>
                </div>
                {int.connected ? (
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                ) : null}
              </div>
              <p className="text-[11px] text-white/30 mb-3">{int.description}</p>
              <button
                className={`w-full text-xs font-medium py-1.5 rounded-lg border transition-colors ${
                  int.connected
                    ? 'bg-green-400/10 text-green-400 border-green-400/20'
                    : 'bg-white/[0.04] text-white/60 border-white/[0.08] hover:border-white/[0.15]'
                }`}
              >
                {int.connected ? 'Connected' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
