'use client';

// ============================================================================
// ClawOps Studio — Status Badge
// Phase 1 MVP
// ============================================================================

import { cn, getStatusDotColor } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  label?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'text-[9px] px-1.5 py-0.5',
  md: 'text-[10px] px-2 py-0.5',
};

export default function StatusBadge({
  status,
  label,
  size = 'md',
  showDot = true,
  className,
}: StatusBadgeProps) {
  const displayLabel = label ?? status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
  const dotColor = getStatusDotColor(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-mono font-semibold uppercase tracking-wider',
        'rounded-full border',
        size === 'sm' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5',
        className
      )}
    >
      {showDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', dotColor)} />
      )}
      {displayLabel}
    </span>
  );
}

// Priority Badge
export function PriorityBadge({ priority }: { priority: string }) {
  const colorMap: Record<string, string> = {
    P0: 'bg-red-400/10 text-red-400 border-red-400/20',
    P1: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
    P2: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    P3: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
  };
  return (
    <span className={cn(
      'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border',
      colorMap[priority] ?? colorMap['P2']
    )}>
      {priority}
    </span>
  );
}
