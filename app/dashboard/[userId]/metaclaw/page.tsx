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
        {/* Service Icon */}
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6"
          style={{ background: 'rgba(16,185,129,0.15)' }}
        >
          🤖
        </div>

        {/* Service Name */}
        <h1 className="text-2xl font-bold text-white mb-2">MetaClaw</h1>
        <p className="text-white/50 text-sm mb-8 text-center max-w-md">
          AI agent workspace. Multi-agent orchestration and task management powered by OpenClaw.
        </p>

        {/* Open Button */}
        <a
          href="/gateway/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 mb-4"
          style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
        >
          Open MetaClaw in new tab ↗
        </a>

        <p className="text-white/30 text-xs">
          Opens in a new tab · OpenClaw Gateway UI
        </p>
      </div>
    </DashboardShell>
  );
}
