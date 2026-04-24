'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

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

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? '')
      setIsLoaded(true)
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
        body: JSON.stringify({ cmd })
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
    <div className="p-6 space-y-4">
      {/* Warning banner */}
      {!bannerDismissed && (
        <div className="flex items-center gap-3 bg-amber-950/40 border border-amber-500/30 rounded-xl px-4 py-3">
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

      <h1 className="text-white font-black text-lg">Terminal</h1>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {QUICK_ACTIONS.map(a => (
          <button key={a.cmd} onClick={() => run(a.cmd, a.label)}
            disabled={!!running}
            className="bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold py-2 px-3 rounded-lg transition-colors disabled:opacity-40">
            {running === a.label ? 'Running...' : a.label}
          </button>
        ))}
      </div>
      {output && (
        <pre className="bg-[#0a0a0a] border border-white/7 rounded-xl p-4 text-[11px] font-mono text-[#e8ff47] whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
          {output}
        </pre>
      )}
    </div>
  )
}
