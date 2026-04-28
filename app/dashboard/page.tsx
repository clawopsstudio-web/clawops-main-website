'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

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

interface VPSInstance {
  id: string
  name: string
  tunnel_url: string
  status: string
  agent_count: number
}

interface Agent {
  id: string
  agent_name: string
  agent_role: string
  status: string
  tools: string[]
  hermes_agent_id: string
}

interface MissionLog {
  id: string
  agent_id: string
  mission_type: string
  status: string
  started_at: string
  completed_at: string | null
}

interface ToolConnection {
  id: string
  tool_name: string
  status: string
  connected_at: string
}

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')
  const [vps, setVps] = useState<VPSInstance | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [missions, setMissions] = useState<MissionLog[]>([])
  const [tools, setTools] = useState<ToolConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const supabase = createClient()
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setError('Not logged in')
          setLoading(false)
          return
        }

        setUserId(user.id)
        setUserName(
          user.user_metadata?.full_name 
            ?? user.email?.split('@')[0] 
            ?? 'User'
        )

        // Fetch user's VPS instance
        const { data: vpsData } = await supabase
          .from('vps_instances')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (vpsData) {
          setVps(vpsData)
        }

        // Fetch user's agents (from vps_agents table)
        const { data: agentsData } = await supabase
          .from('vps_agents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (agentsData && agentsData.length > 0) {
          setAgents(agentsData)
        }

        // Fetch recent missions (skip if table doesn't exist)
        try {
          const { data: missionsData } = await supabase
            .from('mission_logs')
            .select('*')
            .eq('user_id', user.id)
            .order('started_at', { ascending: false })
            .limit(10)
          if (missionsData) {
            setMissions(missionsData)
          }
        } catch (e) {
          // Table might not exist, skip
          console.log('mission_logs not available')
        }

        // Fetch connected tools
        const { data: toolsData } = await supabase
          .from('user_tools')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'connected')

        if (toolsData) {
          setTools(toolsData)
        }

      } catch (err: any) {
        console.error('[dashboard] Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

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

  const activeAgents = agents.filter(a => a.status === 'active').length
  const runningMissions = missions.filter(m => m.status === 'running').length
  const completedMissions = missions.filter(m => m.status === 'completed').length

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-8 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">
              Good {getTimeOfDay()}, {userName.split(' ')[0]}
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {vps ? `Your ${vps.name} is ${vps.status}` : 'Setting up your workspace...'}
            </p>
          </div>
          {vps && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
              <div className={`w-2 h-2 rounded-full ${vps.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-white/60 text-xs">{vps.tunnel_url}</span>
            </div>
          )}
        </div>

        {/* No VPS - Show Setup CTA */}
        {!vps && (
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

        {/* VPS Status & KPIs */}
        {vps && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-[#111] border border-white/7 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/30 text-xs">Agents Active</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
              <p className="text-white font-black text-2xl mb-0.5">{activeAgents}</p>
              <p className="text-white/30 text-[10px]">{agents.length} total configured</p>
            </div>
            <div className="bg-[#111] border border-white/7 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/30 text-xs">Tools Connected</span>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              </div>
              <p className="text-white font-black text-2xl mb-0.5">{tools.length}</p>
              <p className="text-white/30 text-[10px]">Integrations active</p>
            </div>
            <div className="bg-[#111] border border-white/7 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/30 text-xs">Missions Run</span>
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              </div>
              <p className="text-white font-black text-2xl mb-0.5">{completedMissions}</p>
              <p className="text-white/30 text-[10px]">{runningMissions} running now</p>
            </div>
            <div className="bg-[#111] border border-white/7 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/30 text-xs">VPS Status</span>
                <div className={`w-1.5 h-1.5 rounded-full ${vps.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              </div>
              <p className="text-white font-black text-2xl mb-0.5 capitalize">{vps.status}</p>
              <p className="text-white/30 text-[10px]">{vps.name}</p>
            </div>
          </div>
        )}

        {/* Agent Status */}
        {agents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">Your AI Agents</h2>
              <Link href="/dashboard/agents" className="text-white/40 hover:text-white/70 text-xs transition-colors">Manage →</Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {agents.map(agent => (
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

        {/* Recent Missions */}
        {missions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm">Recent Activity</h2>
              <Link href="/dashboard/tasks" className="text-white/40 hover:text-white/70 text-xs transition-colors">View all →</Link>
            </div>
            <div className="bg-[#111] border border-white/7 rounded-xl overflow-hidden">
              {missions.slice(0, 5).map((mission, i) => (
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
