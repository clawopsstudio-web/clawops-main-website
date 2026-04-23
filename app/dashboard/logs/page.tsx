'use client'
import { useState, useEffect } from 'react'

export default function LogsPage() {
  const [lines, setLines] = useState<string[]>([])
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/ssh/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cmd: 'journalctl -u hermes -n 50 --no-pager' }),
        })
        const data = await res.json()
        if (data.stdout) {
          setLines(data.stdout.split('\n').filter(Boolean))
        }
      } catch {}
    }
    fetchLogs()
    const t = setInterval(fetchLogs, 5_000)
    return () => clearInterval(t)
  }, [paused])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-black text-lg">Hermes Logs</h1>
        <button
          onClick={() => setPaused(p => !p)}
          className="text-xs text-white/40 border border-white/10 px-3 py-1.5 rounded-lg"
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <pre className="bg-[#0a0a0a] border border-white/7 rounded-xl p-4 text-[11px] font-mono whitespace-pre-wrap overflow-x-auto h-[60vh] overflow-y-auto text-white/50">
        {lines.join('\n') || 'Connecting...'}
      </pre>
    </div>
  )
}
