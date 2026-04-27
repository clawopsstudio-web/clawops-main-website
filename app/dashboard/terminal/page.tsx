'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const PRODUCT_NAME = process.env.NEXT_PUBLIC_PRODUCT_NAME ?? 'Hermes'

const MISSION_CONTROL_URL =
  process.env.NEXT_PUBLIC_HERMES_DASHBOARD_URL ??
  `https://hermes.clawops.studio`

const FALLBACK_ACTIONS = [
  { cmd: 'systemctl restart hermes-gateway', label: 'Restart Agent Runtime' },
  { cmd: 'hermes mission trigger "Daily Lead Digest"', label: 'Run Daily Lead Digest' },
  { cmd: 'hermes queue clear', label: 'Clear message queue' },
  { cmd: 'df -h && free -h && systemctl status hermes-gateway', label: 'Check VPS Status' },
  { cmd: "curl -s -X POST 'https://api.telegram.org/bot7951858806:AAFpypvacA6oVjCnuVBewT1IXg50p21ghoI/sendMessage' -d 'chat_id=381136631&text=Test alert from Mission Control'", label: 'Send Test Alert' },
]

export default function TerminalPage() {
  const [userId, setUserId] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState('')
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [activeTab, setActiveTab] = useState<'terminal' | 'mission-control'>('mission-control')
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const iframeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [commands, setCommands] = useState(FALLBACK_ACTIONS)
  const [hermesOffline, setHermesOffline] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? '')
      setIsLoaded(true)
    })

    // iframe load timeout (10s fallback)
    iframeTimer.current = setTimeout(() => setIframeLoaded(true), 10_000)

    // Check Hermes status
    const fetchHermesStatus = async () => {
      try {
        const res = await fetch('/api/hermes/status')
        if (!res.ok) throw new Error('Hermes offline')
        const status = await res.json()
        if (!status.live) throw new Error('Hermes not live')
        setHermesOffline(false)
      } catch {
        setHermesOffline(true)
      }
    }
    fetchHermesStatus()

    return () => {
      if (iframeTimer.current) clearTimeout(iframeTimer.current)
    }
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

      {/* Mission Control tab — iframe loads via Cloudflare Tunnel HTTPS */}
      {activeTab === 'mission-control' && (
        <div className="flex-1 px-4 pb-4 min-h-0">
          <div className="relative w-full h-full rounded-xl border border-white/10 bg-black overflow-hidden">
          {!iframeLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black z-10">
              <div className="w-6 h-6 border-2 border-[#e8ff47] border-t-transparent rounded-full animate-spin" />
              <p className="text-white/40 text-xs">Loading {PRODUCT_NAME} Mission Control…</p>
            </div>
          )}
          <iframe
            src={MISSION_CONTROL_URL}
            className="w-full h-full"
            title={`${PRODUCT_NAME} Mission Control`}
            allow="clipboard-write"
            onLoad={() => {
              if (iframeTimer.current) clearTimeout(iframeTimer.current)
              setIframeLoaded(true)
            }}
          />
        </div>
        </div>
      )}

      {/* Quick Actions tab */}
      {activeTab === 'terminal' && (
        <div className="flex-1 px-4 pb-4 overflow-y-auto space-y-4">
          {hermesOffline && (
            <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-500/30 rounded-lg px-3 py-2 text-amber-400/80 text-[11px]">
              <span>⚠️</span>
              <span>Hermes offline — showing cached commands</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {commands.map(a => (
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
