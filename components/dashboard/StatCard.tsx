'use client';

// ============================================================================
// ClawOps Studio — Stat Card
// Phase 1 MVP
// ============================================================================

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'cyan' | 'green' | 'yellow' | 'red' | 'violet' | 'default';
  className?: string;
}

const colorMap = {
  cyan: {
    icon: 'bg-[#e8ff47]/10 text-[#e8ff47] border-[#e8ff47]/15',
    value: 'text-[#e8ff47]',
  },
  green: {
    icon: 'bg-green-400/10 text-green-400 border-green-400/15',
    value: 'text-green-400',
  },
  yellow: {
    icon: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/15',
    value: 'text-yellow-400',
  },
  red: {
    icon: 'bg-red-400/10 text-red-400 border-red-400/15',
    value: 'text-red-400',
  },
  violet: {
    icon: 'bg-violet-500/10 text-violet-400 border-violet-500/15',
    value: 'text-violet-400',
  },
  default: {
    icon: 'bg-white/[0.04] text-white/50 border-white/[0.08]',
    value: 'text-white',
  },
};

export default function StatCard({
  label,
  value,
  subValue,
  icon,
  trend,
  color = 'default',
  className,
}: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl p-5',
      'bg-white/[0.03] border border-white/[0.08]',
      'hover:border-white/[0.12] transition-colors duration-200',
      className
    )}>
      {/* Subtle gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent pointer-events-none" />

      <div className="flex items-start justify-between gap-3 relative">
        <div className="flex flex-col gap-1">
          <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{label}</p>
          <p className={cn('text-2xl font-bold font-mono', colors.value)}>{value}</p>
          {subValue && (
            <p className="text-xs text-white/30">{subValue}</p>
          )}
          {trend && (
            <p className={cn(
              'text-xs font-medium mt-1',
              trend.value >= 0 ? 'text-green-400' : 'text-red-400'
            )}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>

        {icon && (
          <div className={cn(
            'w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0',
            colors.icon
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
