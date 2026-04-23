'use client'
import { useState, useEffect } from 'react'
import { streamSSH } from '@/lib/vps-ssh'

const TABS = ['Activity Logs', 'Hermes Logs']
const LEVELS = ['all', 'ssh', 'error', 'info']

export default function LogsPage() {
  const [tab, setTab] = useState('Activity Logs')
  const [level, setLevel] = useState('all')
  const [hermesLines, setHermesLines] = useState<string[]>([])
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (tab !== 'Hermes Logs') return
    let chunks: string[] = []
    let done = false
    streamSSH('test' as any, 'tail -100 /root/.hermes/logs/hermes.log', (chunk) => {
      if (!paused) setHermesLines(prev => [...prev.slice(-99), chunk])
    }).catch(() => {})
    return () => { done = true }
  }, [tab, paused])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-black text-lg">Logs</h1>
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === 'Hermes Logs' && (
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)}
                className={`px-3 py-1 rounded text-[10px] font-semibold capitalize ${level === l ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'}`}>{l}</button>
            ))}
          </div>
          <button onClick={() => setPaused(p => !p)}
            className="text-[10px] text-white/40 hover:text-white/70 border border-white/10 px-3 py-1 rounded-lg">
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>
      )}

      <pre className="bg-[#0a0a0a] border border-white/7 rounded-xl p-4 text-[11px] font-mono text-white/50 whitespace-pre-wrap overflow-x-auto h-[calc(100vh-200px)] overflow-y-auto">
        {tab === 'Hermes Logs'
          ? hermesLines.join('')
          : 'Activity logs will appear here.'}
      </pre>
    </div>
  )
}
