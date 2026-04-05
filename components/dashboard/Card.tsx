'use client';

// ============================================================================
// ClawOps Studio — Card Component
// Phase 1 MVP
// ============================================================================

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  noPadding?: boolean;
}

export default function Card({
  children,
  className,
  title,
  description,
  action,
  noPadding = false,
}: CardProps) {
  return (
    <div className={cn(
      'rounded-xl bg-white/[0.03] border border-white/[0.08]',
      'hover:border-white/[0.1] transition-colors duration-200',
      className
    )}>
      {(title || action) && (
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div>
            {title && <h3 className="text-sm font-semibold text-white/80">{title}</h3>}
            {description && <p className="text-xs text-white/30 mt-0.5">{description}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>
        {children}
      </div>
    </div>
  );
}

// Empty state component
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/20 mb-4">
        {icon}
      </div>
      <h4 className="text-sm font-medium text-white/60 mb-1">{title}</h4>
      <p className="text-xs text-white/30 max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}

// Section header for dashboard
export function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">{title}</h2>
      {action}
    </div>
  );
}
