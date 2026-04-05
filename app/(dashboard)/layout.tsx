'use client';

// ============================================================================
// ClawOps Studio — Dashboard Layout
// Phase 1 MVP
// ============================================================================

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuthStore, useUIStore } from '@/lib/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#04040c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-white/40">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#04040c]">
      <Sidebar />
      <main
        className="transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '68px' : '240px' }}
      >
        <div className="min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
