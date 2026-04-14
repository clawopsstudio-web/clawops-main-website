import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardShell';

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

        {/* Open Button */}
        <a
          href={`/api/proxy/${userId}/n8n/`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 mb-4"
          style={{ background: 'linear-gradient(135deg, #EA4B71, #ff6b8a)', boxShadow: '0 0 20px rgba(234,75,113,0.3)' }}
        >
          Open n8n in new tab ↗
        </a>

        <p className="text-white/30 text-xs">
          Opens in a new tab · Requires n8n to be running on your server
        </p>
      </div>
    </DashboardShell>
  );
}
