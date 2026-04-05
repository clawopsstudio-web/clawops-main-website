'use client';

// ============================================================================
// ClawOps Studio — History Page
// Phase 1 MVP
// ============================================================================

import { useActivityStore } from '@/lib/store';
import { formatDateTime, actionTypeLabel, getStatusBgColor } from '@/lib/utils';
import PageHeader from '@/components/dashboard/PageHeader';
import Card from '@/components/dashboard/Card';
import StatusBadge from '@/components/dashboard/StatusBadge';
import type { ActionType } from '@/types';

const ACTION_TYPES: ActionType[] = [
  'login', 'logout', 'signup', 'task_created', 'task_updated', 'task_deleted',
  'agent_launched', 'agent_stopped', 'workflow_created', 'workflow_run',
  'connection_created', 'connection_updated', 'connection_deleted',
];

export default function HistoryPage() {
  const { entries, setFilter, filter } = useActivityStore();

  const filteredEntries = filter.actionType
    ? entries.filter((e) => e.actionType === filter.actionType)
    : entries;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Activity History"
        description="Audit log of all actions across your workspace"
      />

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-xs text-white/30 font-mono mr-1">Filter:</span>
        <button
          onClick={() => setFilter({})}
          className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
            !filter.actionType
              ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20'
              : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:border-white/[0.1]'
          }`}
        >
          All
        </button>
        {ACTION_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setFilter({ actionType: type })}
            className={`text-[10px] font-mono px-2 py-1 rounded border transition-colors ${
              filter.actionType === type
                ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20'
                : 'bg-white/[0.03] text-white/40 border-white/[0.06] hover:border-white/[0.1]'
            }`}
          >
            {actionTypeLabel(type)}
          </button>
        ))}
      </div>

      <Card noPadding>
        <div className="divide-y divide-white/[0.04]">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.01] transition-colors">
              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0 mt-0.5">
                {entry.actionType.includes('login') && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                )}
                {entry.actionType.includes('task') && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                )}
                {entry.actionType.includes('agent') && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
                )}
                {entry.actionType.includes('workflow') && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/></svg>
                )}
                {entry.actionType.includes('connection') && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>
                )}
                {!entry.actionType.includes('login') && !entry.actionType.includes('task') &&
                 !entry.actionType.includes('agent') && !entry.actionType.includes('workflow') &&
                 !entry.actionType.includes('connection') && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm text-white/70">{actionTypeLabel(entry.actionType)}</span>
                  {entry.entityType && (
                    <span className="text-[10px] font-mono text-white/25 bg-white/[0.04] px-1.5 py-0.5 rounded">
                      {entry.entityType}
                    </span>
                  )}
                </div>
                {entry.entityData && 'title' in entry.entityData && (
                  <p className="text-xs text-white/40 truncate">{entry.entityData.title as string}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-[10px] font-mono text-white/25">
                  <span>{formatDateTime(entry.createdAt)}</span>
                  {entry.ipAddress && <span>IP: {entry.ipAddress}</span>}
                </div>
              </div>

              {/* Status */}
              <StatusBadge status={entry.actionType.includes('error') || entry.actionType.includes('deleted') ? 'error' : 'active'} size="sm" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
