'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const QUICK_ACTIONS = [
  { cmd: 'systemctl status hermes', label: 'Hermes Status' },
  { cmd: 'systemctl restart hermes', label: 'Restart Hermes' },
  { cmd: 'hermes doctor', label: 'Run Doctor' },
  { cmd: 'hermes cache clear', label: 'Clear Cache' },
  { cmd: 'df -h', label: 'Disk Usage' },
  { cmd: 'free -h', label: 'Memory' },
  { cmd: 'curl -s http://127.0.0.1:8888 | head -1', label: 'Check SearXNG' },
]

export default function TerminalPage() {
  const [userId, setUserId] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState('')
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [activeTab, setActiveTab] = useState<'terminal' | 'mission-control'>('mission-control')
  const [vpsUrl, setVpsUrl] = useState<string | null>(null)
  const [vpsLoading, setVpsLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      setUserId(data.user?.id ?? '')
      setIsLoaded(true)
      if (data.user?.id) {
        const { data: row } = await supabase
          .from('onboarding_submissions')
          .select('dashboard_url, vps_ip')
          .eq('clerk_user_id', data.user.id)
          .eq('status', 'active')
          .maybeSingle()
        if (row?.dashboard_url) {
          setVpsUrl(row.dashboard_url)
        } else if (row?.vps_ip) {
          setVpsUrl(`http://${row.vps_ip}:9119`)
        }
      }
      setVpsLoading(false)
    })
  }, [])

  const run = async (cmd: string, label: string) => {
    if (!userId) return
    setRunning(label)
    setOutput('')
    try {
      const res = await fetch('/api/ssh/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd }),
      })
      const data = await res.json()
      setOutput(data.output || data.error || 'Done.')
    } catch (e: any) {
      setOutput('Error: ' + (e.message ?? 'Unknown'))
    } finally {
      setRunning('')
    }
  }

  if (!isLoaded) return <div className="p-8 text-white/40">Loading...</div>

  return (
    <div className="flex flex-col h-[calc(100vh-44px)]">

      {/* Warning banner */}
      {!bannerDismissed && (
        <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-500/30 rounded-xl mx-4 mt-4 px-4 py-3">
          <span className="text-amber-400 text-sm shrink-0">⚠️</span>
          <p className="text-amber-400/80 text-xs flex-1">
            Advanced access — changes here affect your live agent runtime
          </p>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-amber-400/50 hover:text-amber-400 text-lg leading-none shrink-0 transition-colors"
          >
            ×
          </button>
        </div>
      )}

      {/* Tab switcher */}
      <div className="flex gap-1 px-4 pt-3 pb-1">
        <button
          onClick={() => setActiveTab('mission-control')}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'mission-control'
              ? 'bg-[#e8ff47] text-black'
              : 'bg-white/5 text-white/40 hover:text-white/70'
          }`}
        >
          Mission Control
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
            activeTab === 'terminal'
              ? 'bg-[#e8ff47] text-black'
              : 'bg-white/5 text-white/40 hover:text-white/70'
          }`}
        >
          Quick Actions
        </button>
      </div>

      {/* Mission Control tab */}
      {activeTab === 'mission-control' && (
        <div className="flex-1 px-4 pb-4 min-h-0 flex flex-col">
          {vpsLoading && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/40 text-sm">Loading Mission Control...</p>
            </div>
          )}
          {!vpsLoading && !vpsUrl && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <p className="text-white/60 text-sm font-medium mb-2">Mission Control not configured</p>
              <p className="text-white/30 text-xs">Your VPS is being provisioned. Check back in ~20 minutes.</p>
            </div>
          )}
          {!vpsLoading && vpsUrl && (
            <iframe
              src={vpsUrl}
              className="w-full h-full rounded-xl border border-white/10 bg-black"
              title="Hermes Mission Control"
              allow="clipboard-write"
            />
          )}
        </div>
      )}

      {/* Quick Actions tab */}
      {activeTab === 'terminal' && (
        <div className="flex-1 px-4 pb-4 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {QUICK_ACTIONS.map(a => (
              <button
                key={a.cmd}
                onClick={() => run(a.cmd, a.label)}
                disabled={!!running}
                className="bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold py-2.5 px-3 rounded-lg transition-colors disabled:opacity-40 text-left"
              >
                {running === a.label ? '⟳ Running...' : a.label}
              </button>
            ))}
          </div>
          {output && (
            <pre className="bg-[#0a0a0a] border border-white/7 rounded-xl p-4 text-[11px] font-mono text-[#e8ff47] whitespace-pre-wrap overflow-x-auto max-h-80 overflow-y-auto">
              {output}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
