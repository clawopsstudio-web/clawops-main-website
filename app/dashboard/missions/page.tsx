'use client'
import { useState, useEffect } from 'react'
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

  // Create mission modal state
  const [showCreate, setShowCreate] = useState(false)
  const [createStep, setCreateStep] = useState(1)
  const [agent, setAgent] = useState('Ryan')
  const [goal, setGoal] = useState('')
  const [trigger, setTrigger] = useState<'manual'|'cron'|'gmail'>('manual')
  const [cron, setCron] = useState('Daily 8:00 AM')
  const [savingMission, setSavingMission] = useState(false)

  const handleCreateMission = async () => {
    setSavingMission(true)
    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user) { setSavingMission(false); return }
    const prompt = trigger === 'manual'
      ? goal
      : trigger === 'cron'
      ? `CRON: ${cron} — ${goal}`
      : `TRIGGER: On new Gmail — ${goal}`
    await supabase.from('missions').insert({
      user_id: userData.user.id,
      title: goal.slice(0, 60) || 'New Mission',
      prompt,
      status: 'idle',
    })
    setSavingMission(false)
    setShowCreate(false)
    setCreateStep(1)
    setAgent('Ryan'); setGoal(''); setTrigger('manual'); setCron('Daily 8:00 AM')
    // Refresh
    const { data: refreshed } = await supabase.from('missions').select('*').limit(50)
    if (refreshed) setMissions(refreshed)
  }

  // DB doesn't have a 'type' column — derive from schedule/prompt pattern
  const typeBadgeClass = (mission: any) => {
    const title = (mission.title ?? '').toLowerCase()
    const schedule = (mission.schedule ?? mission.prompt ?? '').toLowerCase()
    if (schedule.includes('daily') || schedule.includes('weekly') || schedule.includes('hour')) return 'bg-blue-950 text-blue-400 border-blue-900'
    if (schedule.includes('gmail') || schedule.includes('trigger') || schedule.includes('new ')) return 'bg-purple-950 text-purple-400 border-purple-900'
    return 'bg-white/8 text-white/40 border-white/10'
  }

  const getTypeLabel = (mission: any) => {
    const schedule = (mission.schedule ?? mission.prompt ?? '').toLowerCase()
    if (schedule.includes('daily') || schedule.includes('weekly') || schedule.includes('hour')) return 'CRON'
    if (schedule.includes('gmail') || schedule.includes('trigger') || schedule.includes('new ')) return 'TRIGGER'
    return 'MANUAL'
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
        <div className="flex items-center gap-3">
          <button onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-xs rounded-xl transition-colors">
            + New Mission
          </button>
          <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
          {['all','running','completed','failed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize ${filter === f ? 'bg-white/10 text-white font-semibold' : 'text-white/40'}`}>
              {f}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Create Mission Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <div>
                <h3 className="text-white font-bold">Create Mission</h3>
                <p className="text-white/30 text-xs mt-0.5">Step {createStep} of 4</p>
              </div>
              <button onClick={() => { setShowCreate(false); setCreateStep(1) }} className="text-white/30 hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {createStep === 1 && (
                <div className="space-y-4">
                  <p className="text-white/70 text-sm">Which agent should run this mission?</p>
                  {['Ryan', 'Arjun', 'Helena'].map(a => (
                    <button key={a} onClick={() => { setAgent(a); setCreateStep(2) }}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                        agent === a ? 'border-[#e8ff47] bg-[#e8ff47]/5' : 'border-white/8 hover:border-white/15 bg-[#111]'
                      }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        a === 'Ryan' ? 'bg-emerald-500/20 text-emerald-400' : a === 'Arjun' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>{a[0]}</div>
                      <span className="text-white font-medium text-sm">{a}</span>
                    </button>
                  ))}
                </div>
              )}
              {createStep === 2 && (
                <div className="space-y-4">
                  <p className="text-white/70 text-sm">What should {agent} do?</p>
                  <textarea value={goal} onChange={e => setGoal(e.target.value)} rows={4}
                    placeholder={`e.g. Find 10 SaaS founders on LinkedIn and send them outreach emails...`}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm focus:outline-none focus:border-white/20 resize-none" />
                  <div className="flex gap-2">
                    <button onClick={() => setCreateStep(1)} className="flex-1 py-2.5 border border-white/10 text-white/50 rounded-xl text-sm hover:bg-white/5">Back</button>
                    <button onClick={() => goal.trim() && setCreateStep(3)} disabled={!goal.trim()}
                      className="flex-1 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-40 text-black font-bold rounded-xl text-sm">Next →</button>
                  </div>
                </div>
              )}
              {createStep === 3 && (
                <div className="space-y-4">
                  <p className="text-white/70 text-sm">How should this mission be triggered?</p>
                  {[
                    { id: 'manual' as const, label: 'Manual', desc: 'Run on demand' },
                    { id: 'cron' as const, label: 'Scheduled', desc: 'Daily, weekly, or hourly' },
                    { id: 'gmail' as const, label: 'On new email', desc: 'Runs when a new Gmail arrives' },
                  ].map(t => (
                    <button key={t.id} onClick={() => { setTrigger(t.id); setCreateStep(4) }}
                      className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors ${
                        trigger === t.id ? 'border-[#e8ff47] bg-[#e8ff47]/5' : 'border-white/8 hover:border-white/15 bg-[#111]'
                      }`}>
                      <div className={`w-2 h-2 rounded-full ${trigger === t.id ? 'bg-[#e8ff47]' : 'bg-white/20'}`} />
                      <div className="text-left">
                        <p className="text-white font-medium text-sm">{t.label}</p>
                        <p className="text-white/40 text-xs">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                  <button onClick={() => setCreateStep(2)} className="text-white/40 text-xs hover:text-white/60 transition-colors">← Back</button>
                </div>
              )}
              {createStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <p className="text-white/70 text-sm mb-2">Mission summary</p>
                    <div className="bg-[#111] border border-white/8 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-xs"><span className="text-white/40">Agent</span><span className="text-white/70">{agent}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-white/40">Task</span><span className="text-white/70 max-w-[200px] truncate">{goal}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-white/40">Trigger</span><span className="text-white/70 capitalize">{trigger}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCreateStep(3)} className="flex-1 py-2.5 border border-white/10 text-white/50 rounded-xl text-sm hover:bg-white/5">Back</button>
                    <button onClick={handleCreateMission} disabled={savingMission}
                      className="flex-[2] py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-40 text-black font-bold rounded-xl text-sm">
                      {savingMission ? 'Creating...' : 'Create Mission'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeBadgeClass(m)}`}>
                    {getTypeLabel(m)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadgeClass(m.status)}`}>
                    {m.status ?? 'idle'}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">{m.lastRan ?? (m.completed_at ? new Date(m.completed_at).toLocaleDateString() : m.started_at ? new Date(m.started_at).toLocaleDateString() : '—')}</td>
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
