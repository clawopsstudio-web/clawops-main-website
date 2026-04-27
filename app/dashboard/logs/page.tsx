'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

const DEMO_LOG_ENTRIES = [
  // Today
  { id: 1, ts: '22:47:03', severity: 'INFO', source: 'Agent Ryan', message: 'Qualified lead company.com' },
  { id: 2, ts: '22:32:15', severity: 'INFO', source: 'Agent Arjun', message: 'Research task completed in 45s' },
  { id: 3, ts: '22:19:44', severity: 'INFO', source: 'Agent Helena', message: 'Ticket #1234 resolved' },
  { id: 4, ts: '22:15:01', severity: 'INFO', source: 'System', message: 'Composio integration Gmail connected' },
  { id: 5, ts: '21:47:22', severity: 'WARN', source: 'Agent Arjun', message: 'Slow response from web search (8s)' },
  { id: 6, ts: '21:30:00', severity: 'INFO', source: 'System', message: 'Mission "Daily Digest" completed' },
  { id: 7, ts: '21:28:00', severity: 'INFO', source: 'Agent Ryan', message: '20 emails sent successfully' },
  { id: 8, ts: '20:55:17', severity: 'ERROR', source: 'Agent Ryan', message: 'LinkedIn profile fetch failed (rate limited)' },
  { id: 9, ts: '20:44:33', severity: 'INFO', source: 'Agent Arjun', message: '8 competitors analyzed' },
  { id: 10, ts: '20:12:08', severity: 'INFO', source: 'Agent Helena', message: '5 tickets escalated to human' },
  { id: 11, ts: '19:30:00', severity: 'WARN', source: 'System', message: 'Composio rate limit approaching (80% used)' },
  { id: 12, ts: '19:01:55', severity: 'ERROR', source: 'System', message: 'Composio integration Slack disconnected (reconnecting...)' },
  { id: 13, ts: '18:45:22', severity: 'INFO', source: 'Agent Ryan', message: 'Outreach campaign "Q2 SaaS" launched — 45 targets' },
  { id: 14, ts: '18:22:11', severity: 'INFO', source: 'Agent Arjun', message: 'Competitor pricing report generated (12 pages)' },
  // Yesterday
  { id: 15, ts: 'Yesterday 17:55:00', severity: 'INFO', source: 'Agent Helena', message: 'Resolved 12 support tickets batch' },
  { id: 16, ts: 'Yesterday 16:30:00', severity: 'INFO', source: 'System', message: 'Gateway health check passed' },
  { id: 17, ts: 'Yesterday 15:10:33', severity: 'WARN', source: 'System', message: 'Memory usage at 72% — within normal range' },
  { id: 18, ts: 'Yesterday 14:00:00', severity: 'INFO', source: 'Agent Ryan', message: 'Lead qualification batch completed — 28 leads scored' },
  { id: 19, ts: 'Yesterday 12:30:00', severity: 'INFO', source: 'Agent Arjun', message: 'Market research for fintech vertical completed' },
  { id: 20, ts: 'Yesterday 09:00:00', severity: 'INFO', source: 'System', message: 'Scheduled mission "Weekly Report" completed successfully' },
]

export default function LogsPage() {
  const [lines, setLines] = useState<string[]>([])
  const [paused, setPaused] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ''))
  }, [])

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

  const isAdmin = userId === ADMIN_USER_ID
  const showDemo = isAdmin && lines.length === 0

  const severityDot = (severity: string) => {
    switch (severity) {
      case 'INFO': return 'text-emerald-400'
      case 'WARN': return 'text-yellow-400'
      case 'ERROR': return 'text-red-400'
      default: return 'text-white/30'
    }
  }

  const severityBg = (severity: string) => {
    switch (severity) {
      case 'INFO': return 'bg-emerald-400/10'
      case 'WARN': return 'bg-yellow-400/10'
      case 'ERROR': return 'bg-red-400/10'
      default: return 'bg-white/5'
    }
  }

  // Group demo entries
  const todayEntries = DEMO_LOG_ENTRIES.filter(e => !e.ts.startsWith('Yesterday'))
  const yesterdayEntries = DEMO_LOG_ENTRIES.filter(e => e.ts.startsWith('Yesterday'))

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-white font-black text-lg">Hermes Logs</h1>
          {isAdmin && (
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#e8ff47]/10 text-[#e8ff47] font-medium border border-[#e8ff47]/20">
              Demo Mode
            </span>
          )}
        </div>
        <button
          onClick={() => setPaused(p => !p)}
          className="text-xs text-white/40 border border-white/10 px-3 py-1.5 rounded-lg"
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {showDemo ? (
        <div className="space-y-6">
          {/* Today */}
          <div>
            <p className="text-white/20 text-[10px] uppercase tracking-widest font-semibold mb-2 px-1">Today</p>
            <div className="bg-[#0a0a0a] border border-white/7 rounded-xl overflow-hidden">
              {todayEntries.map((entry, i) => (
                <div key={entry.id} className={`flex items-start gap-3 px-4 py-2.5 border-b border-white/4 last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  <span className="text-[11px] font-mono text-white/25 shrink-0 w-20">{entry.ts}</span>
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityDot(entry.severity).replace('text-', 'bg-')}`} />
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${severityBg(entry.severity)} ${severityDot(entry.severity)}`}>
                    {entry.severity}
                  </span>
                  <span className={`text-[11px] font-semibold shrink-0 ${entry.source.startsWith('Agent') ? 'text-white/50' : 'text-white/30'}`}>
                    {entry.source}:
                  </span>
                  <span className="text-[11px] text-white/60">{entry.message}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Yesterday */}
          <div>
            <p className="text-white/20 text-[10px] uppercase tracking-widest font-semibold mb-2 px-1">Yesterday</p>
            <div className="bg-[#0a0a0a] border border-white/7 rounded-xl overflow-hidden">
              {yesterdayEntries.map((entry, i) => (
                <div key={entry.id} className={`flex items-start gap-3 px-4 py-2.5 border-b border-white/4 last:border-0 ${i % 2 === 0 ? '' : 'bg-white/[0.01]'}`}>
                  <span className="text-[11px] font-mono text-white/25 shrink-0 w-36">{entry.ts}</span>
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityDot(entry.severity).replace('text-', 'bg-')}`} />
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${severityBg(entry.severity)} ${severityDot(entry.severity)}`}>
                    {entry.severity}
                  </span>
                  <span className={`text-[11px] font-semibold shrink-0 ${entry.source.startsWith('Agent') ? 'text-white/50' : 'text-white/30'}`}>
                    {entry.source}:
                  </span>
                  <span className="text-[11px] text-white/60">{entry.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <pre className="bg-[#0a0a0a] border border-white/7 rounded-xl p-4 text-[11px] font-mono whitespace-pre-wrap overflow-x-auto h-[60vh] overflow-y-auto text-white/50">
          {lines.join('\n') || 'Connecting...'}
        </pre>
      )}
    </div>
  )
}
