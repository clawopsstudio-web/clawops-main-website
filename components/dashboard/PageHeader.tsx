'use client';

// ============================================================================
// ClawOps Studio — Page Header
// Phase 1 MVP
// ============================================================================

import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  badge?: string;
  badgeColor?: string;
}

export default function PageHeader({
  title,
  description,
  actions,
  badge,
  badgeColor = 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/20',
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {badge && (
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-sm text-white/40 max-w-xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}
