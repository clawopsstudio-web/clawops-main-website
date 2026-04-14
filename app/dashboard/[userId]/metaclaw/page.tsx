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
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg" style={{ background: 'rgba(16,185,129,0.15)' }}>
              🤖
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">MetaClaw</h1>
              <p className="text-[10px] text-white/40">AI agent workspace</p>
            </div>
          </div>
          <a
            href={`/api/proxy/${userId}/gateway/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            Open in new tab ↗
          </a>
        </div>
        {/* iFrame */}
        <div className="flex-1 relative">
          <iframe
            src={`/api/proxy/${userId}/gateway/`}
            className="w-full h-full border-0"
            title="MetaClaw - AI Agent Workspace"
            allow="clipboard-read; clipboard-write; microphone; camera"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals"
          />
          {/* Loading overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" id="loading">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#10b981]/30 border-t-[#10b981] rounded-full animate-spin" />
              <p className="text-xs text-white/40">Loading MetaClaw...</p>
            </div>
          </div>
          <script dangerouslySetInnerHTML={{ __html: `
            window.addEventListener('load', function() {
              setTimeout(function() {
                var loading = document.getElementById('loading');
                if (loading) loading.style.display = 'none';
              }, 3000);
            });
          ` }} />
        </div>
      </div>
    </DashboardShell>
  );
}
