'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'
const AGENT_COLORS: Record<string, string> = {
  Ryan: '#22c55e', Arjun: '#f59e0b', Helena: '#3b82f6',
}

function getTimeOfDay(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [agents, setAgents] = useState<{id: string; name: string; role: string; status: string}[]>([])
  const [missions, setMissions] = useState<{id: string; status: string}[]>([])
  const [logs, setLogs] = useState<{id: string; agent_name: string; action: string; created_at: string}[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const admin = data.user.id === ADMIN_USER_ID
      setIsAdmin(admin)
      setUserName(data.user.user_metadata?.full_name ?? data.user.email?.split('@')[0] ?? 'User')
      if (!admin) { setLoaded(true); return }

      const supabase = createClient()
      const uid = ADMIN_USER_ID

      const [agRes, misRes, logRes] = await Promise.all([
        supabase.from('agents').select('id, name, role, status').eq('user_id', uid).limit(10),
        supabase.from('missions').select('id, status').eq('user_id', uid).limit(20),
        supabase.from('logs').select('id, agent_name, action, created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(8),
      ])

      if (agRes.data) setAgents(agRes.data)
      if (misRes.data) setMissions(misRes.data)
      if (logRes.data) setLogs(logRes.data)
      setLoaded(true)
    })
  }, [])

  if (!loaded) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-white/30 text-sm">Loading...</div>
    </div>
  )

  const activeAgents = agents.filter(a => a.status === 'running' || a.status === 'active').length
  const activeMissions = missions.filter(m => m.status === 'running' || m.status === 'completed').length

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-8 py-10 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-white">
            Good {getTimeOfDay()}, {userName}
          </h1>
          <p className="text-white/40 text-sm mt-1">
            {isAdmin ? "Here's your ClawOps command center" : "Here's your AI workspace"}
          </p>
        </div>

        {/* KPI Strip */}
        {isAdmin && (
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Agents Active', value: activeAgents, sub: `${agents.length} total`, color: '#22c55e' },
              { label: 'Tools Connected', value: '5', sub: 'Integrations active', color: '#3b82f6' },
              { label: 'Missions', value: activeMissions, sub: `${missions.length} total`, color: '#a855f7' },
              { label: 'Log Entries', value: logs.length, sub: 'Recent activity', color: '#f59e0b' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-[#111] border border-white/7 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/30 text-xs">{kpi.label}</span>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: kpi.color }} />
                </div>
                <p className="text-white font-black text-2xl mb-0.5">{kpi.value}</p>
                <p className="text-white/30 text-[10px]">{kpi.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* Agent Status */}
        {isAdmin && agents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-semibold text-sm">Agent Status</h2>
              <Link href="/dashboard/agents" className="text-[#e8ff47]/70 hover:text-[#e8ff47] text-xs transition-colors">View all →</Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {agents.map(agent => (
                <div key={agent.id} className="bg-[#111] border border-white/7 rounded-xl p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-black text-sm shrink-0"
                      style={{ backgroundColor: AGENT_COLORS[agent.name] ?? '#888' }}>
                      {agent.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold text-sm">{agent.name}</p>
                      <p className="text-white/30 text-[10px]">{agent.role ?? 'Agent'}</p>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                      agent.status === 'running' || agent.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      agent.status === 'idle' ? 'bg-white/8 text-white/40' :
                      'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse'
                    }`}>
                      {agent.status ?? 'idle'}
                    </span>
                  </div>
                  <div className="bg-[#0d0d0d] rounded-lg px-3 py-2 mb-3">
                    <p className="text-white/40 text-[10px] mb-0.5">Last active</p>
                    <p className="text-white/60 text-[10px] truncate">
                      {agent.name === 'Ryan' ? 'Processing outreach queue (20 emails)' :
                       agent.name === 'Arjun' ? 'Monitoring competitor pricing' :
                       agent.name === 'Helena' ? '5 tickets in queue' :
                       'Ready to assist'}
                    </p>
                  </div>
                  <Link href="/dashboard/chat"
                    className="block text-center text-[10px] text-[#e8ff47]/70 hover:text-[#e8ff47] transition-colors border border-[#e8ff47]/15 rounded-lg py-1.5">
                    Open Chat →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VPS Status */}
        {isAdmin && (
          <div className="flex items-center gap-3 bg-[#111] border border-emerald-500/20 rounded-2xl p-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">VPS: ClawOps Studio — Online</p>
              <p className="text-white/40 text-xs">5 tools connected · {activeMissions} missions running</p>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Live</span>
          </div>
        )}

        {/* Recent Activity */}
        {isAdmin && logs.length > 0 && (
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">Recent Activity</h2>
              <Link href="/dashboard/logs" className="text-white/30 hover:text-white/60 text-xs transition-colors">View logs →</Link>
            </div>
            <div className="space-y-2">
              {logs.slice(0, 5).map(log => {
                const agentColor = AGENT_COLORS[log.agent_name ?? ''] ?? '#888'
                return (
                  <div key={log.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-white/5 last:border-0">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                      style={{ backgroundColor: agentColor + '22', color: agentColor }}>
                      {(log.agent_name ?? '?')[0]}
                    </div>
                    <span className="font-medium shrink-0" style={{ color: agentColor }}>{log.agent_name ?? 'System'}</span>
                    <span className="text-white/50 flex-1 truncate">{log.action ?? ''}</span>
                    <span className="text-white/20 shrink-0 text-[10px]">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Chat CTA */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-3">Chat with your agents</h2>
          {isAdmin ? (
            <div className="space-y-4">
              {/* Quick action chips */}
              <div className="flex flex-wrap gap-2">
                {[
                  { text: 'Ask Ryan for 10 leads', agent: 'Ryan', color: '#22c55e', msg: 'Ryan, find me 10 leads from LinkedIn in the SaaS space' },
                  { text: 'Ask Arjun to research a competitor', agent: 'Arjun', color: '#f59e0b', msg: 'Arjun, research our top 3 competitors and summarize their pricing' },
                  { text: 'Ask Helena to draft a reply', agent: 'Helena', color: '#3b82f6', msg: 'Helena, draft a reply to an angry customer who waited 3 days' },
                ].map(chip => (
                  <Link key={chip.agent}
                    href={`/dashboard/chat?msg=${encodeURIComponent(chip.msg)}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/30 border border-white/8 hover:border-white/15 transition-all text-xs group">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-black shrink-0"
                      style={{ backgroundColor: chip.color }}>
                      {chip.agent[0]}
                    </div>
                    <span className="text-white/60 group-hover:text-white/80 transition-colors">{chip.text}</span>
                  </Link>
                ))}
              </div>
              {/* Mini input */}
              <form onSubmit={e => {
                e.preventDefault()
                const input = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value
                if (input?.trim()) window.location.href = `/dashboard/chat?msg=${encodeURIComponent(input.trim())}`
              }} className="flex gap-2">
                <input name="q" placeholder="Message your agents..."
                  className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-white/60 text-sm focus:outline-none focus:border-white/20 placeholder:text-white/20" />
                <button type="submit" className="px-4 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-xs rounded-xl shrink-0 transition-colors">Send →</button>
              </form>
              <Link href="/dashboard/chat" className="text-center text-white/30 hover:text-white/50 text-xs transition-colors block">Open full chat →</Link>
            </div>
          ) : (
            <div className="bg-black/30 rounded-xl p-5 text-center text-white/20 text-sm border border-white/5">
              Your AI workspace will be ready after onboarding.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
