'use client';

// ============================================================================
// ClawOps Studio — Workflows Page
// Phase 1 MVP
// ============================================================================

import { useWorkflowsStore } from '@/lib/store';
import { formatRelativeTime, formatDuration } from '@/lib/utils';
import PageHeader from '@/components/dashboard/PageHeader';
import Card, { EmptyState } from '@/components/dashboard/Card';
import StatusBadge from '@/components/dashboard/StatusBadge';

export default function WorkflowsPage() {
  const { workflows, toggleWorkflow } = useWorkflowsStore();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Workflows"
        description="Automate tasks with scheduled, webhook, and event-driven workflows"
        actions={
          <button className="btn btn-primary text-sm py-2 px-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Workflow
          </button>
        }
      />

      {workflows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/></svg>}
            title="No workflows yet"
            description="Create your first automated workflow"
            action={<button className="btn btn-primary text-sm py-2 px-4">Create Workflow</button>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {workflows.map((wf) => (
            <Card key={wf.id} noPadding>
              <div className="p-4 flex items-start gap-4">
                {/* Toggle */}
                <button
                  onClick={() => toggleWorkflow(wf.id)}
                  className={`w-10 h-6 rounded-full relative flex-shrink-0 transition-colors mt-0.5 ${
                    wf.isActive ? 'bg-[#00D4FF]/20' : 'bg-white/[0.08]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full absolute top-1 transition-all ${
                      wf.isActive
                        ? 'bg-[#00D4FF] left-5'
                        : 'bg-white/30 left-1'
                    }`}
                  />
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-white/80">{wf.name}</h4>
                    <StatusBadge status={wf.triggerType} size="sm" />
                    {wf.isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    )}
                  </div>
                  {wf.description && (
                    <p className="text-xs text-white/30 mb-2">{wf.description}</p>
                  )}
                  <div className="flex items-center gap-4">
                    {wf.triggerType === 'scheduled' && (
                      <span className="text-[11px] font-mono text-white/30">
                        {typeof wf.triggerConfig === 'object' && 'cron' in wf.triggerConfig
                          ? (wf.triggerConfig.cron as string)
                          : 'scheduled'}
                      </span>
                    )}
                    {wf.triggerType === 'webhook' && (
                      <span className="text-[11px] font-mono text-white/30">Webhook</span>
                    )}
                    {wf.triggerType === 'event' && (
                      <span className="text-[11px] font-mono text-white/30">
                        Event: {typeof wf.triggerConfig === 'object' && 'event' in wf.triggerConfig
                          ? (wf.triggerConfig.event as string)
                          : 'event'}
                      </span>
                    )}
                    <span className="text-[11px] text-white/25">
                      {wf.runCount} runs
                    </span>
                    {wf.lastRunAt && (
                      <span className="text-[11px] text-white/25">
                        Last: {formatRelativeTime(wf.lastRunAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button className="text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded border border-white/[0.06] hover:border-white/[0.1]">
                    Run
                  </button>
                  <button className="text-xs text-white/30 hover:text-white/60 transition-colors px-2 py-1 rounded border border-white/[0.06] hover:border-white/[0.1]">
                    Edit
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
