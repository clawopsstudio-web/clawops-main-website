'use client'
import { useState, useEffect } from 'react'
export const metadata = { title: 'Missions — ClawOps' };
import { createClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

const DEMO_MISSIONS = [
  {
    id: 'demo-mission-1',
    agent_id: 'Ryan',
    title: 'Daily Lead Digest',
    schedule: '8:00 AM daily',
    type: 'CRON' as const,
    status: 'completed',
    lastRan: '8 hr ago',
    output: 'Processed 45 leads from LinkedIn outreach. 12 qualified for sales pipeline.',
  },
  {
    id: 'demo-mission-2',
    agent_id: 'Helena',
    title: 'Support Ticket Monitor',
    schedule: 'On new Gmail',
    type: 'TRIGGER' as const,
    status: 'running',
    lastRan: '28 min ago',
    output: 'Monitoring inbox. 5 new tickets processed, all resolved automatically.',
  },
  {
    id: 'demo-mission-3',
    agent_id: 'Arjun',
    title: 'Weekly Report',
    schedule: 'Monday 9:00 AM',
    type: 'CRON' as const,
    status: 'paused',
    lastRan: '3 days ago',
    output: 'Weekly competitive analysis report generated and sent to Notion.',
  },
]

export default function MissionsPage() {
  const [missions, setMissions] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)
  const [userId, setUserId] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? ''))
  }, [])

  useEffect(() => {
    let q = supabase.from('missions').select('*').order('created_at', { ascending: false }).limit(50)
    if (filter !== 'all') q = q.eq('status', filter)
    q.then(({ data }) => setMissions(data ?? []))
  }, [filter])

  const isAdmin = userId === ADMIN_USER_ID
  const displayMissions = isAdmin
    ? filter === 'all'
      ? [...DEMO_MISSIONS, ...missions]
      : [...DEMO_MISSIONS.filter(m => m.status === filter), ...missions]
    : missions

  const typeBadgeClass = (type: string) => {
    switch (type) {
      case 'CRON': return 'bg-blue-950 text-blue-400 border-blue-900'
      case 'TRIGGER': return 'bg-purple-950 text-purple-400 border-purple-900'
      default: return 'bg-white/8 text-white/40 border-white/10'
    }
  }

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-950 text-emerald-400'
      case 'running': return 'bg-yellow-950 text-yellow-400'
      case 'failed': return 'bg-red-950 text-red-400'
      default: return 'bg-white/8 text-white/40'
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-white font-black text-lg">Missions</h1>
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
          {['all','running','completed','failed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize ${filter === f ? 'bg-white/10 text-white font-semibold' : 'text-white/40'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-white/7 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-white/30 text-xs uppercase">
              {['Agent','Mission','Type','Status','Last Ran','Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayMissions.map(m => (
              <tr key={m.id}
                onClick={() => setSelected(m)}
                className="border-t border-white/5 hover:bg-white/4 cursor-pointer">
                <td className="px-4 py-3 text-white/70 text-xs">{m.agent_id}</td>
                <td className="px-4 py-3 text-white/70 text-xs truncate max-w-xs">{m.title ?? m.prompt?.slice(0,40) ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeBadgeClass(m.type || 'MANUAL')}`}>
                    {m.type || 'MANUAL'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadgeClass(m.status)}`}>
                    {m.status ?? 'idle'}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">{m.lastRan ?? '—'}</td>
                <td className="px-4 py-3 text-white/30 text-xs">
                  {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {displayMissions.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-white/20 text-sm">No missions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="bg-[#111] border border-white/7 rounded-xl p-6 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-white font-bold">{selected.title ?? 'Mission Detail'}</h3>
              {selected.schedule && <p className="text-white/40 text-xs mt-0.5">Schedule: {selected.schedule}</p>}
            </div>
            <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white">✕</button>
          </div>
          <pre className="text-white/50 text-xs whitespace-pre-wrap font-mono bg-[#0a0a0a] rounded-lg p-3 max-h-48 overflow-auto">
            {selected.output ?? selected.prompt ?? 'No detail available.'}
          </pre>
        </div>
      )}
    </div>
  )
}
