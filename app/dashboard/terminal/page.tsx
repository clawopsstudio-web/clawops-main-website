'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { execSSH } from '@/lib/vps-ssh'

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
  const { user, isLoaded } = useUser()
  const userId = user?.id ?? ''
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState('')

  const run = async (cmd: string, label: string) => {
    if (!userId) return
    setRunning(label)
    setOutput('')
    try {
      const result = await execSSH(userId, cmd, 30_000)
      setOutput(result.stdout || result.stderr || 'Done.')
    } catch (e: any) {
      setOutput('Error: ' + (e.message ?? 'Unknown'))
    } finally {
      setRunning('')
    }
  }

  if (!isLoaded) {
    return <div className="p-6 text-white/30 text-sm">Loading...</div>
  }

  if (!userId) {
    return <div className="p-6 text-red-400 text-sm">Not signed in.</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white font-black text-lg">Mission Control</h1>
        <p className="text-white/30 text-xs mt-1">Monitor and control your VPS runtime.</p>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-3">Quick Actions</p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.cmd}
              onClick={() => run(a.cmd, a.label)}
              disabled={!!running || !userId}
              className="bg-[#111] border border-white/7 text-white/50 hover:text-white hover:border-white/15 disabled:opacity-40 text-xs px-3 py-2 rounded-xl transition-all text-left flex items-center gap-2"
            >
              {running === a.label && (
                <span className="w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full animate-spin shrink-0" />
              )}
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Output</p>
          {output && (
            <button onClick={() => setOutput('')} className="text-white/20 hover:text-white/60 text-[10px]">Clear</button>
          )}
        </div>
        <pre className="bg-[#111] border border-white/7 rounded-xl p-4 text-[11px] font-mono text-white/50 whitespace-pre-wrap min-h-32 max-h-64 overflow-auto">
          {output || 'Click an action to see output.'}
        </pre>
      </div>
    </div>
  )
}
