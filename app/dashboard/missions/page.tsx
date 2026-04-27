'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ─────────────────────────────────────────────────────────
interface HermesStatus {
  running: boolean
  activeState: string
  subState: string
  pid: string | null
  uptime: string | null
  rawOutput: string
}

interface VpsHealth {
  cpu: { load: string; uptime: string }
  ram: { total: string; used: string; free: string; percent: number }
  disk: { used: string; available: string; percent: number }
}

interface RuntimeStatus {
  hermes: HermesStatus
  vps: VpsHealth
  agents: unknown[]
  lastSync: string
  error?: string
}

interface QuickAction {
  id: string
  label: string
  icon: string
  description: string
  loading?: boolean
  lastOutput?: string
  lastSuccess?: boolean
}

interface Mission {
  id: string
  agent_id?: string
  title?: string
  prompt?: string
  status?: string
  created_at?: string
  completed_at?: string
  started_at?: string
  lastRan?: string
  output?: string
  schedule?: string
}

// ─── Constants ──────────────────────────────────────────────────────
const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'
const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'vps-status',
    label: 'Check VPS Status',
    icon: '🖥️',
    description: 'Run system health check',
  },
  {
    id: 'hermes-doctor',
    label: 'Hermes Doctor',
    icon: '🩺',
    description: 'Diagnose Hermes health',
  },
  {
    id: 'sync-agents',
    label: 'Sync Agents',
    icon: '🔄',
    description: 'Push configs to VPS',
  },
  {
    id: 'restart',
    label: 'Restart Gateway',
    icon: '♻️',
    description: 'Restart Hermes service',
  },
  {
    id: 'logs',
    label: 'View Logs',
    icon: '📋',
    description: 'Recent Hermes logs',
  },
]

// ─── Helpers ───────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        active ? 'bg-emerald-400 shadow-[0_0_6px_theme(colors.emerald.400)]' : 'bg-red-400 shadow-[0_0_6px_theme(colors.red.400)]'
      }`}
    />
  )
}

// ─── Status Card ────────────────────────────────────────────────────
function StatusCard({
  title,
  icon,
  children,
  accent = 'white',
}: {
  title: string
  icon: string
  children: React.ReactNode
  accent?: 'green' | 'yellow' | 'blue' | 'white'
}) {
  const accentMap = {
    green: 'border-emerald-900/50',
    yellow: 'border-yellow-900/50',
    blue: 'border-blue-900/50',
    white: 'border-white/8',
  }
  const headerMap = {
    green: 'bg-emerald-950/40',
    yellow: 'bg-yellow-950/40',
    blue: 'bg-blue-950/40',
    white: 'bg-white/4',
  }

  return (
    <div className={`border ${accentMap[accent]} rounded-xl overflow-hidden bg-[#111]`}>
      <div className={`flex items-center gap-2 px-4 py-2.5 ${headerMap[accent]} border-b border-white/5`}>
        <span className="text-base">{icon}</span>
        <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────
export default function MissionsPage() {
  const [userId, setUserId] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [agentMap, setAgentMap] = useState<Record<string, string>>({})

  // Mission state
  const [missions, setMissions] = useState<Mission[]>([])
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Mission | null>(null)

  // Mission control state
  const [runtimeStatus, setRuntimeStatus] = useState<RuntimeStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  // Quick action state
  const [actionStates, setActionStates] = useState<Record<string, { loading: boolean; output: string; success: boolean; error: string }>>({})
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [outputModal, setOutputModal] = useState<{ title: string; output: string; success: boolean } | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const supabase = createClient()

  // ─── Auth ───────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? ''
      setUserId(uid)
      setIsAdmin(uid === ADMIN_USER_ID)
    })
  }, [])

  // ─── Agent name map ──────────────────────────────────────────────
  useEffect(() => {
    supabase.from('agents').select('id, name').then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {}
        for (const a of data) map[a.id] = a.name
        setAgentMap(map)
      }
    })
  }, [])

  // ─── Fetch missions ──────────────────────────────────────────────
  useEffect(() => {
    let q = supabase.from('missions').select('*').order('created_at', { ascending: false }).limit(50)
    if (filter !== 'all') q = q.eq('status', filter)
    q.then(({ data }) => setMissions(data ?? []))
  }, [filter])

  // ─── Fetch runtime status ─────────────────────────────────────────
  const fetchRuntimeStatus = useCallback(async () => {
    if (!isAdmin) return
    setStatusLoading(true)
    try {
      const res = await fetch('/api/missions/runtime-status')
      const data = await res.json()
      setRuntimeStatus(data)
      setStatusError(data.error ?? null)
    } catch (e: any) {
      setStatusError(e.message)
    } finally {
      setStatusLoading(false)
    }
  }, [isAdmin])

  // Poll every 30 seconds when tab is visible
  useEffect(() => {
    if (!isAdmin) return
    fetchRuntimeStatus()
    pollIntervalRef.current = setInterval(fetchRuntimeStatus, 30_000)
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [isAdmin, fetchRuntimeStatus])

  // ─── Run quick action ─────────────────────────────────────────────
  const runAction = async (actionId: string) => {
    if (activeAction) return // one at a time
    setActiveAction(actionId)
    setActionStates(prev => ({
      ...prev,
      [actionId]: { loading: true, output: '', success: false, error: '' },
    }))

    try {
      const res = await fetch('/api/missions/quick-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: actionId }),
      })
      const data = await res.json()
      setActionStates(prev => ({
        ...prev,
        [actionId]: {
          loading: false,
          output: data.output ?? '',
          success: data.success ?? false,
          error: data.error ?? '',
        },
      }))

      // Show output modal for all actions
      const actionDef = QUICK_ACTIONS.find(a => a.id === actionId)
      setOutputModal({
        title: actionDef?.label ?? actionId,
        output: data.error ? `Error: ${data.error}\n\n${data.output}` : data.output,
        success: data.success ?? false,
      })

      // Refresh status after restart
      if (actionId === 'restart') {
        setTimeout(() => fetchRuntimeStatus(), 5000)
      }
    } catch (e: any) {
      setActionStates(prev => ({
        ...prev,
        [actionId]: {
          loading: false,
          output: '',
          success: false,
          error: e.message,
        },
      }))
    } finally {
      setActiveAction(null)
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────
  const getAgentName = (agentId: string | undefined) => {
    if (!agentId) return 'Unknown Agent'
    return agentMap[agentId] ?? 'Unknown Agent'
  }

  const typeBadgeClass = (mission: Mission) => {
    const schedule = (mission.schedule ?? mission.prompt ?? '').toLowerCase()
    if (schedule.includes('daily') || schedule.includes('weekly') || schedule.includes('hour')) return 'bg-blue-950 text-blue-400 border-blue-900'
    if (schedule.includes('gmail') || schedule.includes('trigger') || schedule.includes('new ')) return 'bg-purple-950 text-purple-400 border-purple-900'
    return 'bg-white/8 text-white/40 border-white/10'
  }

  const getTypeLabel = (mission: Mission) => {
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

  // ─── Create mission state ─────────────────────────────────────────
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
    const prompt = trigger === 'manual' ? goal : trigger === 'cron' ? `CRON: ${cron} — ${goal}` : `TRIGGER: On new Gmail — ${goal}`
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
    const { data: refreshed } = await supabase.from('missions').select('*').limit(50)
    if (refreshed) setMissions(refreshed)
  }

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-5 max-w-[1200px]">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-white font-black text-xl">Mission Control</h1>
          {runtimeStatus?.lastSync && (
            <span className="text-white/20 text-xs">synced {timeAgo(runtimeStatus.lastSync)}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={fetchRuntimeStatus}
              disabled={statusLoading}
              className="px-3 py-1.5 text-white/40 hover:text-white/70 text-xs border border-white/10 hover:border-white/20 rounded-lg transition-colors disabled:opacity-40"
            >
              {statusLoading ? '⟳ Syncing…' : '↻ Sync'}
            </button>
          )}
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

      {/* ── Error banner ── */}
      {statusError && (
        <div className="bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-2.5 text-red-400 text-xs">
          ⚠ VPS unreachable: {statusError}. Showing stale data.
        </div>
      )}

      {/* ── Mission Control Panel (admin only) ── */}
      {isAdmin && (
        <div className="space-y-4">

          {/* Status cards row */}
          <div className="grid grid-cols-3 gap-3">

            {/* Hermes Status */}
            <StatusCard title="Hermes" icon="🤖" accent="green">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <StatusDot active={runtimeStatus?.hermes.running ?? false} />
                  <span className={`text-sm font-bold ${runtimeStatus?.hermes.running ? 'text-emerald-400' : 'text-red-400'}`}>
                    {runtimeStatus?.hermes.running ? 'Running' : runtimeStatus ? 'Stopped' : 'Loading…'}
                  </span>
                </div>
                {runtimeStatus?.hermes.pid && (
                  <div className="text-white/30 text-xs">PID: {runtimeStatus.hermes.pid}</div>
                )}
                {runtimeStatus?.hermes.activeState && (
                  <div className="text-white/30 text-xs truncate">{runtimeStatus.hermes.activeState}</div>
                )}
                {runtimeStatus?.hermes.rawOutput && (
                  <details className="mt-2">
                    <summary className="text-white/30 text-xs cursor-pointer hover:text-white/50">raw output</summary>
                    <pre className="text-white/20 text-[10px] mt-1 whitespace-pre-wrap font-mono bg-black/30 rounded p-2 max-h-24 overflow-auto">
                      {runtimeStatus.hermes.rawOutput}
                    </pre>
                  </details>
                )}
              </div>
            </StatusCard>

            {/* VPS Health */}
            <StatusCard title="VPS Health" icon="🖥️" accent="blue">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>
                    <div className="text-white/30 text-[10px] uppercase">CPU Load</div>
                    <div className="text-white/70 text-sm font-mono">
                      {runtimeStatus?.vps?.cpu?.load ? runtimeStatus.vps.cpu.load.split(' ')[0] : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/30 text-[10px] uppercase">Uptime</div>
                    <div className="text-white/70 text-sm truncate max-w-[80px]">
                      {runtimeStatus?.vps?.cpu?.uptime ? runtimeStatus.vps.cpu.uptime.replace(/^.*up /, '').split(',')[0] : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-white/30 text-[10px] uppercase">RAM</div>
                    <div className="text-white/70 text-sm">
                      {runtimeStatus?.vps?.ram?.used ?? '—'}
                      <span className="text-white/30 text-xs"> / {runtimeStatus?.vps?.ram?.total ?? '—'}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-white/30 text-[10px] uppercase">Disk</div>
                    <div className="text-white/70 text-sm">
                      {runtimeStatus?.vps?.disk?.used ?? '—'}
                      <span className="text-white/30 text-xs"> / {runtimeStatus?.vps?.disk?.available ?? '—'}</span>
                    </div>
                  </div>
                </div>
                {/* Disk bar */}
                {runtimeStatus?.vps?.disk && runtimeStatus.vps.disk.percent > 0 && (
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full ${runtimeStatus.vps.disk.percent > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${Math.min(runtimeStatus.vps.disk.percent, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </StatusCard>

            {/* Active Sessions */}
            <StatusCard title="Agents" icon="👥" accent="yellow">
              <div className="space-y-2">
                <div className="text-white/40 text-xs">Agent runtime tracking</div>
                {runtimeStatus?.agents && runtimeStatus.agents.length > 0 ? (
                  runtimeStatus.agents.map((a: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <StatusDot active={a.running} />
                      <span className="text-white/60 text-sm">{a.name ?? `Agent ${i + 1}`}</span>
                      <span className="text-white/30 text-xs ml-auto">{a.status ?? 'idle'}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3 text-white/20 text-xs">
                    <div className="text-2xl mb-1">🤖</div>
                    No agents running
                  </div>
                )}
              </div>
            </StatusCard>
          </div>

          {/* Quick Actions */}
          <div className="border border-white/8 rounded-xl bg-[#111] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white/4 border-b border-white/5">
              <span className="text-base">⚡</span>
              <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">Quick Actions</span>
            </div>
            <div className="p-4 grid grid-cols-5 gap-2">
              {QUICK_ACTIONS.map(action => {
                const state = actionStates[action.id]
                const isRunning = activeAction === action.id
                return (
                  <button
                    key={action.id}
                    onClick={() => runAction(action.id)}
                    disabled={isRunning}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all disabled:opacity-50 ${
                      isRunning
                        ? 'border-[#e8ff47]/40 bg-[#e8ff47]/5'
                        : state?.success
                        ? 'border-emerald-900/50 bg-emerald-950/20 hover:bg-emerald-950/40'
                        : state?.error
                        ? 'border-red-900/50 bg-red-950/20'
                        : 'border-white/8 bg-[#1a1a1a] hover:bg-white/5 hover:border-white/15'
                    }`}
                  >
                    <span className="text-xl">{action.icon}</span>
                    <span className={`text-xs font-bold ${isRunning ? 'text-[#e8ff47]' : 'text-white/70'}`}>
                      {isRunning ? 'Running…' : action.label}
                    </span>
                    <span className="text-white/30 text-[10px] text-center leading-tight">
                      {state?.success ? '✓ OK' : state?.error ? '✕ Failed' : action.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      )}

      {/* ── Output Modal ── */}
      {outputModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${outputModal.success ? 'text-emerald-400' : 'text-red-400'}`}>
                  {outputModal.success ? '✓' : '✕'}
                </span>
                <h3 className="text-white font-bold text-sm">{outputModal.title}</h3>
              </div>
              <button
                onClick={() => setOutputModal(null)}
                className="text-white/30 hover:text-white text-lg leading-none">✕</button>
            </div>
            <pre className="flex-1 overflow-auto p-5 text-white/50 text-xs font-mono whitespace-pre-wrap">
              {outputModal.output}
            </pre>
            <div className="px-5 py-3 border-t border-white/5">
              <button onClick={() => setOutputModal(null)}
                className="px-4 py-2 bg-white/8 hover:bg-white/15 text-white/60 text-xs rounded-lg transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Mission Modal ── */}
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
                  {([
                    { id: 'manual' as const, label: 'Manual', desc: 'Run on demand' },
                    { id: 'cron' as const, label: 'Scheduled', desc: 'Daily, weekly, or hourly' },
                    { id: 'gmail' as const, label: 'On new email', desc: 'Runs when a new Gmail arrives' },
                  ]).map(t => (
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
                  <p className="text-white/70 text-sm mb-2">Mission summary</p>
                  <div className="bg-[#111] border border-white/8 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between text-xs"><span className="text-white/40">Agent</span><span className="text-white/70">{agent}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-white/40">Task</span><span className="text-white/70 max-w-[200px] truncate">{goal}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-white/40">Trigger</span><span className="text-white/70 capitalize">{trigger}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setCreateStep(3)} className="flex-1 py-2.5 border border-white/10 text-white/50 rounded-xl text-sm hover:bg-white/5">Back</button>
                    <button onClick={handleCreateMission} disabled={savingMission}
                      className="flex-[2] py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-40 text-black font-bold rounded-xl text-sm">
                      {savingMission ? 'Creating…' : 'Create Mission'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Missions Table ── */}
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
            {missions.map(m => (
              <tr key={m.id}
                onClick={() => setSelected(m)}
                className="border-t border-white/5 hover:bg-white/4 cursor-pointer">
                <td className="px-4 py-3 text-white/70 text-xs">{getAgentName(m.agent_id)}</td>
                <td className="px-4 py-3 text-white/70 text-xs truncate max-w-xs">{m.title ?? m.prompt?.slice(0,40) ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${typeBadgeClass(m)}`}>
                    {getTypeLabel(m)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadgeClass(m.status ?? 'idle')}`}>
                    {m.status ?? 'idle'}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/40 text-xs">
                  {m.lastRan ?? (m.completed_at ? timeAgo(m.completed_at) : m.started_at ? timeAgo(m.started_at) : '—')}
                </td>
                <td className="px-4 py-3 text-white/30 text-xs">
                  {m.created_at ? new Date(m.created_at).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
            {missions.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-white/20 text-sm">No missions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Detail panel ── */}
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
