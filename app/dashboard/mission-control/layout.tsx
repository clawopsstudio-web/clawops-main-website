'use client';

import MissionControlShell from '@/components/gateway/MissionControlShell'

export default function MissionControlLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MissionControlShell>{children}</MissionControlShell>
}
