'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useHermesStatus } from '@/components/providers/HermesStatusProvider'

const AGENT_COLORS: Record<string, string> = {
  Ryan: '#22c55e', Arjun: '#f59e0b', Helena: '#3b82f6',
  Sarah: '#ec4899', Mike: '#8b5cf6', Alex: '#06b6d4',
}

function getTimeOfDay(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

interface DashboardData {
  profile: any
  instances: any[]
  agents: any[]
  tools: any[]
  hermesStatus: any
  hermesOnline: boolean
  recentActivity: any[]
  missions: any[]
  stats: {
    activeAgents: number
    connectedTools: number
    totalInstances: number
    onlineInstances: number
    completedMissions: number
    runningMissions: number
  }
}

export default function DashboardPage() {
  const [userName, setUserName] = useState('')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Shared Hermes status from layout provider — avoids double-polling
  const { hermesOnline, hermesStatus: ctxHermesStatus } = useHermesStatus()

  // Fetch user display name first (needed immediately for greeting)
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const name = user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User'
        setUserName(name)
      } else {
        // No user — the layout will redirect, just show loading
      }
    })
  }, [])

  // Fetch all dashboard data from API
  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/dashboard')
        if (!res.ok) {
          if (res.status === 401) {
            // Auth handled by layout — stay on loading briefly
            setLoading(false)
            return
          }
          throw new Error(`Failed to load dashboard (${res.status})`)
        }
        const json: DashboardData = await res.json()
        setData(json)
      } catch (err: any) {
        console.error('[dashboard] Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // Polling: refresh every 60 seconds
  useEffect(() => {
    if (!data) return
    const id = setInterval(async () => {
      try {
        const res = await fetch('/api/dashboard')
        if (res.ok) {
          const json: DashboardData = await res.json()
          setData(json)
        }
      } catch {
        // Silently ignore polling failures
      }
    }, 60_000)
    return () => clearInterval(id)
  }, [!!data])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-white/30 text-sm">Loading your dashboard...</div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-red-400 text-sm">Error: {error}</div>
    </div>
  )

  if (!data) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-white/30 text-sm">Loading...</div>
    </div>
  )

  const { instances, agents, tools, hermesStatus: apiHermesStatus, hermesOnline: apiHermesOnline, recentActivity, missions, stats } = data

  // Prefer context Hermes status; fall back to API response
  const hermesStatus = ctxHermesStatus ?? apiHermesStatus
  const hermesOnline_final = hermesOnline || apiHermesOnline
  const vps = instances[0] ?? null
  const displayName = userName || data.profile?.full_name || 'User'

  // Merge hermesStatus.platforms into agents display
  const platformAgents = hermesStatus?.gateway_platforms
    ? Object.entries(hermesStatus.gateway_platforms).map(([platform, info]: [string, any]) => ({
        id: platform,
        agent_name: platform.charAt(0).toUpperCase() + platform.slice(1),
        agent_role: `${platform} bot`,
        status: info.state === 'connected' ? 'active' : 'inactive',
        tools: [],
        hermes_agent_id: platform,
      }))
    : []

  // Combine DB agents + Hermes platform agents
  const allAgents = [...agents, ...platformAgents]

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-8 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">
              Good {getTimeOfDay()}, {displayName.split(' ')[0]}
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {vps
                ? `${vps.name ?? 'Your VPS'} is ${vps.status}`
                : hermesOnline_final
                  ? 'Hermes is online — no VPS instance linked yet'
                  : 'Connect a VPS to get started'}
            </p>
          </div>
          {vps && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
              <div className={`w-2 h-2 rounded-full ${vps.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-white/60 text-xs">{vps.tunnel_url ?? vps.hermes_url ?? 'vps'}</span>
            </div>
          )}
        </div>

        {/* No VPS + no agents — Show Setup CTA */}
        {!vps && agents.length === 0 && (
          <div className="bg-gradient-to-r from-[#1a1a1a] to-[#111] border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-[#e8ff47]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Ready to launch your AI team?</h2>
            <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
              Connect your first tool to get started. Your agents will be ready to work for you 24/7.
            </p>
            <Link
              href="/dashboard/tools"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors"
            >
              Connect Your First Tool →
            </Link>
          </div>
        )}

        {/* KPIs */}
        {(vps || agents.length > 0) && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#111] border border-white/7 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/30 text-xs">Agents Active</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <p className="text-white font-black text-2xl mb-0.5">{stats.activeAgents}</p>
              <p className="text-white/30 text-[10px]">{allAgents.length} total configured</p>
            </div>
            <div className="bg-[#111] border border-white/7 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/30 text-xs">Tools Connected</span>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              </div>
              <p className="text-white font-black text-2xl mb-0.5">{stats.connectedTools}</p>
              <p className="text-white/30 text-[10px]">Integrations active</p>
            </div>
            <div className="bg-[#111] border border-white/7 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/30 text-xs">Missions Run</span>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              </div>
              <p className="text-white font-black text-2xl mb-0.5">{stats.completedMissions}</p>
              <p className="text-white/30 text-[10px]">{stats.runningMissions} running now</p>
            </div>
            <div className="bg-[#111] border border-white/7 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/30 text-xs">Hermes Status</span>
                <div className={`w-1.5 h-1.5 rounded-full ${hermesOnline_final ? 'bg-emerald-400' : 'bg-red-400'}`} />
              </div>
              <p className="text-white font-black text-2xl mb-0.5 capitalize">
                {hermesOnline_final ? 'Online' : 'Offline'}
              </p>
              <p className="text-white/30 text-[10px]">
                {hermesStatus?.gateway_platforms
                  ? `${Object.keys(hermesStatus.gateway_platforms).length} platform${Object.keys(hermesStatus.gateway_platforms).length !== 1 ? 's' : ''}`
                  : vps?.name ?? 'No instance'}
              </p>
            </div>
          </div>
        )}

        {/* Hermes Status — Platforms */}
        {hermesStatus?.gateway_platforms && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">Hermes Platforms</h2>
              <span className="text-white/30 text-xs">v{hermesStatus.version}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(hermesStatus.gateway_platforms).map(([platform, info]: [string, any]) => (
                <div key={platform} className="bg-[#111] border border-white/7 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${info.state === 'connected' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    <p className="text-white font-bold text-sm capitalize">{platform}</p>
                  </div>
                  <p className="text-white/40 text-xs mb-1">
                    {info.state === 'connected' ? 'Connected' : info.error_message ?? 'Disconnected'}
                  </p>
                  {info.error_code && (
                    <p className="text-red-400/60 text-[10px]">Error: {info.error_code}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Agent Status */}
        {allAgents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">Your AI Agents</h2>
              <Link href="/dashboard/agents" className="text-white/40 hover:text-white/70 text-xs transition-colors">Manage →</Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {allAgents.map(agent => (
                <div key={agent.id} className="bg-[#111] border border-white/7 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
                      style={{ backgroundColor: AGENT_COLORS[agent.agent_name] || '#6b7280' }}
                    >
                      {agent.agent_name[0]}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{agent.agent_name}</p>
                      <p className="text-white/40 text-xs">{agent.agent_role || 'AI Agent'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      agent.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-white/10 text-white/40'
                    }`}>
                      {agent.status === 'active' ? '● Running' : '○ Stopped'}
                    </span>
                    <Link
                      href={`/dashboard/chat?agent=${agent.id}`}
                      className="text-[10px] text-white/40 hover:text-white/70 transition-colors"
                    >
                      Chat →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">Recent Chats</h2>
              <Link href="/dashboard/chat" className="text-white/40 hover:text-white/70 text-xs transition-colors">View all →</Link>
            </div>
            <div className="bg-[#111] border border-white/7 rounded-xl overflow-hidden">
              {recentActivity.slice(0, 5).map((session: any, i: number) => (
                <div
                  key={session.id ?? i}
                  className={`flex items-center justify-between px-4 py-3 ${i < recentActivity.length - 1 ? 'border-b border-white/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <div>
                      <p className="text-white/80 text-sm">{session.title ?? 'Chat session'}</p>
                      <p className="text-white/30 text-xs">
                        {session.last_active
                          ? new Date(session.last_active).toLocaleString()
                          : `${session.message_count ?? 0} messages`}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40 capitalize">
                    {session.source}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mission Logs (fallback when no Hermes sessions) */}
        {missions.length > 0 && recentActivity.length === 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">Recent Activity</h2>
              <Link href="/dashboard/tasks" className="text-white/40 hover:text-white/70 text-xs transition-colors">View all →</Link>
            </div>
            <div className="bg-[#111] border border-white/7 rounded-xl overflow-hidden">
              {missions.slice(0, 5).map((mission: any, i: number) => (
                <div
                  key={mission.id}
                  className={`flex items-center justify-between px-4 py-3 ${i < missions.length - 1 ? 'border-b border-white/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      mission.status === 'completed' ? 'bg-emerald-400' :
                      mission.status === 'running' ? 'bg-blue-400 animate-pulse' :
                      'bg-red-400'
                    }`} />
                    <div>
                      <p className="text-white/80 text-sm">{mission.mission_type || 'Task'}</p>
                      <p className="text-white/30 text-xs">
                        {new Date(mission.started_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    mission.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                    mission.status === 'running' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {mission.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-white font-semibold text-sm mb-4">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            <Link href="/dashboard/chat/new" className="bg-[#111] border border-white/7 rounded-xl p-4 hover:border-white/15 transition-colors group">
              <div className="w-8 h-8 bg-[#e8ff47]/10 rounded-lg flex items-center justify-center mb-2 group-hover:bg-[#e8ff47]/20 transition-colors">
                <span className="text-sm">💬</span>
              </div>
              <p className="text-white font-medium text-xs">New Chat</p>
              <p className="text-white/30 text-[10px]">Talk to an agent</p>
            </Link>
            <Link href="/dashboard/tasks/new" className="bg-[#111] border border-white/7 rounded-xl p-4 hover:border-white/15 transition-colors group">
              <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center mb-2 group-hover:bg-blue-500/20 transition-colors">
                <span className="text-sm">🎯</span>
              </div>
              <p className="text-white font-medium text-xs">Assign Task</p>
              <p className="text-white/30 text-[10px]">Create a mission</p>
            </Link>
            <Link href="/dashboard/tools" className="bg-[#111] border border-white/7 rounded-xl p-4 hover:border-white/15 transition-colors group">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center mb-2 group-hover:bg-purple-500/20 transition-colors">
                <span className="text-sm">🔌</span>
              </div>
              <p className="text-white font-medium text-xs">Connect Tool</p>
              <p className="text-white/30 text-[10px]">Add integration</p>
            </Link>
            <Link href="/dashboard/terminal" className="bg-[#111] border border-white/7 rounded-xl p-4 hover:border-white/15 transition-colors group">
              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center mb-2 group-hover:bg-orange-500/20 transition-colors">
                <span className="text-sm">⌨️</span>
              </div>
              <p className="text-white font-medium text-xs">Mission Control</p>
              <p className="text-white/30 text-[10px]">Direct access</p>
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
