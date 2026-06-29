'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

type LogCategory = 'all' | 'agent' | 'tool' | 'error' | 'mission'

interface LogEntry {
  id: number; ts: string; severity: 'INFO' | 'WARN' | 'ERROR'; category: 'agent' | 'tool' | 'mission' | 'error'; source: string; message: string
}

const DEMO_ENTRIES: LogEntry[] = [
  { id: 1, ts: '22:47', severity: 'INFO', category: 'agent', source: 'Agent Ryan', message: 'Qualified lead company.com' },
  { id: 2, ts: '22:32', severity: 'INFO', category: 'agent', source: 'Agent Arjun', message: 'Research task completed in 45s' },
  { id: 3, ts: '22:19', severity: 'INFO', category: 'agent', source: 'Agent Helena', message: 'Ticket #1234 resolved' },
  { id: 4, ts: '22:15', severity: 'INFO', category: 'tool', source: 'System', message: 'Gmail integration connected via Composio' },
  { id: 5, ts: '21:47', severity: 'WARN', category: 'tool', source: 'Agent Arjun', message: 'Slow response from web search (8s)' },
  { id: 6, ts: '21:30', severity: 'INFO', category: 'mission', source: 'System', message: 'Mission Daily Digest completed' },
  { id: 7, ts: '21:28', severity: 'INFO', category: 'tool', source: 'Agent Ryan', message: '20 emails sent via Gmail' },
  { id: 8, ts: '20:55', severity: 'ERROR', category: 'error', source: 'Agent Ryan', message: 'LinkedIn profile fetch failed (rate limited)' },
  { id: 9, ts: '20:44', severity: 'INFO', category: 'agent', source: 'Agent Arjun', message: '8 competitors analyzed' },
  { id: 10, ts: '20:12', severity: 'INFO', category: 'agent', source: 'Agent Helena', message: '5 tickets escalated to human' },
  { id: 11, ts: '19:30', severity: 'WARN', category: 'tool', source: 'System', message: 'Composio rate limit approaching (80% used)' },
  { id: 12, ts: '19:01', severity: 'ERROR', category: 'error', source: 'System', message: 'Composio integration Slack disconnected (reconnecting...)' },
  { id: 13, ts: '18:45', severity: 'INFO', category: 'mission', source: 'Agent Ryan', message: 'Outreach campaign Q2 SaaS launched — 45 targets' },
  { id: 14, ts: '18:22', severity: 'INFO', category: 'agent', source: 'Agent Arjun', message: 'Competitor pricing report generated (12 pages)' },
  { id: 15, ts: '17:55', severity: 'INFO', category: 'agent', source: 'Agent Helena', message: 'Resolved 12 support tickets batch' },
  { id: 16, ts: '16:30', severity: 'INFO', category: 'tool', source: 'System', message: 'Gateway health check passed' },
  { id: 17, ts: '15:10', severity: 'WARN', category: 'tool', source: 'System', message: 'Memory usage at 72% — within normal range' },
  { id: 18, ts: '14:00', severity: 'INFO', category: 'mission', source: 'Agent Ryan', message: 'Lead qualification batch completed — 28 leads scored' },
  { id: 19, ts: '12:30', severity: 'INFO', category: 'agent', source: 'Agent Arjun', message: 'Market research for fintech vertical completed' },
  { id: 20, ts: '09:00', severity: 'INFO', category: 'mission', source: 'System', message: 'Scheduled mission Weekly Report completed successfully' },
]

const LOG_TABS: { id: LogCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'agent', label: 'Agent Actions' },
  { id: 'tool', label: 'Tool Executions' },
  { id: 'error', label: 'Errors' },
  { id: 'mission', label: 'Missions' },
]

function countForCategory(entries: LogEntry[], cat: LogCategory): number {
  if (cat === 'all') return entries.length
  if (cat === 'error') return entries.filter(e => e.severity === 'ERROR').length
  return entries.filter(e => e.category === cat).length
}

function severityStyle(severity: string) {
  switch (severity) {
    case 'INFO': return 'bg-emerald-400/10 text-emerald-400'
    case 'WARN': return 'bg-yellow-400/10 text-yellow-400'
    case 'ERROR': return 'bg-red-400/10 text-red-400'
    default: return 'bg-white/5 text-white/30'
  }
}

function categoryDot(category: string) {
  switch (category) {
    case 'agent': return 'bg-blue-400'
    case 'tool': return 'bg-purple-400'
    case 'mission': return 'bg-[#e8ff47]'
    default: return 'bg-white/20'
  }
}

export default function LogsPage() {
  const [userId, setUserId] = useState('')
  const [filter, setFilter] = useState<LogCategory>('all')
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ''))
  }, [])

  const isAdmin = userId === ADMIN_USER_ID
  const filtered = isAdmin
    ? filter === 'all'
      ? DEMO_ENTRIES
      : filter === 'error'
      ? DEMO_ENTRIES.filter(e => e.severity === 'ERROR')
      : DEMO_ENTRIES.filter(e => e.category === filter)
    : []

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-black text-lg">Logs</h1>
        {isAdmin && (
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#e8ff47]/10 text-[#e8ff47] border border-[#e8ff47]/20 font-medium">
            Demo
          </span>
        )}
      </div>

      {/* Filter tabs */}
      {isAdmin && (
        <div className="flex items-center gap-1 bg-[#111] border border-white/7 rounded-xl p-1 w-fit">
          {LOG_TABS.map(tab => {
            const count = countForCategory(DEMO_ENTRIES, tab.id)
            return (
              <button key={tab.id} onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === tab.id ? 'bg-white/8 text-white' : 'text-white/40 hover:text-white/70'
                }`}>
                {tab.label}
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                  filter === tab.id ? 'bg-white/10 text-white/60' : 'bg-white/5 text-white/30'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Log entries */}
      <div className="bg-[#0a0a0a] border border-white/7 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-white/20 text-sm">No log entries.</div>
        ) : (
          filtered.map((entry, i) => (
            <div key={entry.id}
              className={`flex items-start gap-3 px-4 py-2.5 border-b border-white/4 last:border-0 ${i % 2 === 1 ? 'bg-white/[0.01]' : ''}`}>
              <span className="text-[11px] font-mono text-white/25 shrink-0 w-12">{entry.ts}</span>
              <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${severityStyle(entry.severity).split(' ')[0]}`} />
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${severityStyle(entry.severity)}`}>
                {entry.severity}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${categoryDot(entry.category)}`} />
              <span className={`text-[11px] font-medium shrink-0 ${
                entry.source.startsWith('Agent') ? 'text-white/50' : 'text-white/30'
              }`}>
                {entry.source}:
              </span>
              <span className="text-[11px] text-white/60">{entry.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
