import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard/DashboardShell'

interface Props {
  params: Promise<{ userId: string }>
}

export default async function ChromePage({ params }: Props) {
  const { userId } = await params
  const cookieStore = await cookies()
  const sbUserId = cookieStore.get('sb-user-id')?.value

  if (!sbUserId || sbUserId !== userId) {
    redirect('/auth/login')
  }

  return (
    <DashboardShell>
      <div className="flex flex-col h-full">
        {/* Header bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: 'rgba(0,212,255,0.2)' }}>🌐</div>
            <div>
              <h2 className="text-sm font-semibold text-white">Agent Browser</h2>
              <p className="text-xs text-white/40">Chrome VNC · Port 5800</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Running</span>
            <a
              href="/chrome"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
              style={{ background: 'rgba(0,212,255,0.2)', border: '1px solid rgba(0,212,255,0.3)' }}
            >
              Fullscreen ↗
            </a>
          </div>
        </div>
        {/* VNC iframe */}
        <div className="flex-1 relative" style={{ background: '#1a1a2e' }}>
          <iframe
            src="/api/proxy/chrome"
            className="w-full h-full border-0"
            title="Chrome VNC"
            allow="clipboard-write; clipboard-read; clipboard-manager"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
          />
          {/* Loading overlay */}
          <div className="absolute inset-0 flex items-center justify-center" id="vnc-loader" style={{ background: '#1a1a2e' }}>
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl mx-auto mb-3 animate-spin" style={{ border: '2px solid rgba(0,212,255,0.2)', borderTopColor: '#00D4FF' }} />
              <p className="text-sm text-white/50">Loading Chrome VNC...</p>
              <p className="text-xs text-white/25 mt-1">Make sure VNC server is running on the VPS</p>
            </div>
          </div>
          <script dangerouslySetInnerHTML={{ __html: `
            document.querySelector('iframe').onload = function() {
              var loader = document.getElementById('vnc-loader');
              if (loader) loader.style.display = 'none';
            };
            setTimeout(function() {
              var loader = document.getElementById('vnc-loader');
              if (loader) loader.style.display = 'none';
            }, 8000);
          `}} />
        </div>
      </div>
    </DashboardShell>
  )
}
