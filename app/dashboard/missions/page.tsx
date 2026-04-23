'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MissionsPage() {
  const [missions, setMissions] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<any>(null)
  useEffect(() => {
    const sb = createClient()
    let q = sb.from('missions').select('*').order('created_at', { ascending: false }).limit(50)
    if (filter !== 'all') q = q.eq('status', filter)
    q.then(({ data }) => setMissions(data ?? []))
  }, [filter])

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
              {['Agent','Mission','Status','Duration','Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {missions.map(m => (
              <tr key={m.id}
                onClick={() => setSelected(m)}
                className="border-t border-white/5 hover:bg-white/4 cursor-pointer">
                <td className="px-4 py-3 text-white/70">{m.agent_id ?? '—'}</td>
                <td className="px-4 py-3 text-white/70 truncate max-w-xs">{m.title ?? m.prompt?.slice(0,40) ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.status === 'completed' ? 'bg-emerald-950 text-emerald-400' :
                    m.status === 'running' ? 'bg-yellow-950 text-yellow-400' :
                    m.status === 'failed' ? 'bg-red-950 text-red-400' :
                    'bg-white/8 text-white/40'
                  }`}>{m.status ?? 'idle'}</span>
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {m.completed_at && m.started_at
                    ? Math.round((new Date(m.completed_at).getTime() - new Date(m.started_at).getTime()) / 1000) + 's'
                    : '—'}
                </td>
                <td className="px-4 py-3 text-white/30 text-xs">
                  {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {missions.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-white/20 text-sm">No missions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="bg-[#111] border border-white/7 rounded-xl p-6 space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="text-white font-bold">Mission Detail</h3>
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
