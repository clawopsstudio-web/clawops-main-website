import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function MetaClawPage({ params }: Props) {
  const { userId } = await params;
  const cookieStore = await cookies();
  const sbUserId = cookieStore.get('sb-user-id')?.value;

  if (!sbUserId || sbUserId !== userId) {
    redirect('/auth/login');
  }

  return (
    <DashboardShell>
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6"
          style={{ background: 'rgba(168,85,247,0.15)' }}
        >
          🐾
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">MetaClaw</h1>
        <p className="text-white/50 text-sm mb-8 text-center max-w-md">
          OpenClaw Control UI — agent management, sessions, tools, and system status.
        </p>
        <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-green-400">Running on port 18789</span>
        </div>
        <a
          href="/gateway/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 mb-4"
          style={{ background: 'linear-gradient(135deg, #a855f7, #c084fc)', boxShadow: '0 0 20px rgba(168,85,247,0.3)' }}
        >
          Open Control UI ↗
        </a>
        <p className="text-white/30 text-xs text-center">
          Opens the built-in OpenClaw Control UI in a new tab
        </p>
      </div>
    </DashboardShell>
  );
}
