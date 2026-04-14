import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';
import Link from 'next/link';

interface Props {
  params: Promise<{ userId: string }>;
}

export default async function N8nPage({ params }: Props) {
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
          style={{ background: 'rgba(234,75,113,0.15)' }}
        >
          ⚙️
        </div>

        {/* Service Name */}
        <h1 className="text-2xl font-bold text-white mb-2">n8n Workflows</h1>
        <p className="text-white/50 text-sm mb-8 text-center max-w-md">
          Workflow automation & webhooks. Build, run, and manage your automations.
        </p>

        {/* Service Status */}
        <div className="flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30">
          <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-green-400">Running on port 5678</span>
        </div>

        {/* Open Button */}
        <a
          href="/n8n/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 mb-4"
          style={{ background: 'linear-gradient(135deg, #EA4B71, #ff6b8a)', boxShadow: '0 0 20px rgba(234,75,113,0.3)' }}
        >
          Open n8n ↗
        </a>

        <p className="text-white/30 text-xs text-center">
          Opens n8n in a new tab · n8n is running on your VPS at port 5678
        </p>
      </div>
    </DashboardShell>
  );
}
