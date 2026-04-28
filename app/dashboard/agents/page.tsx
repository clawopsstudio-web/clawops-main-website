'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const AGENT_COLORS: Record<string, string> = {
  Ryan: '#22c55e', Arjun: '#f59e0b', Helena: '#3b82f6',
  Sarah: '#ec4899', Mike: '#8b5cf6', Tyler: '#f97316',
  default: '#6b7280',
}

const AGENT_ICONS: Record<string, string> = {
  Ryan: '💼', Arjun: '🔬', Helena: '🎧',
  Sarah: '📊', Mike: '⚡', Tyler: '📣',
  default: '🤖',
}

interface Agent {
  id: string
  hermes_agent_id: string
  agent_name: string
  agent_role: string | null
  status: string
  tools: string[]
  last_seen: string | null
  created_at: string
}

interface VPS {
  id: string
  name: string
  tunnel_url: string
  status: string
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [vps, setVps] = useState<VPS | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  useEffect(() => {
    async function loadAgents() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setError('Not logged in')
          setLoading(false)
          return
        }

        // Fetch user's VPS
        const { data: vpsData } = await supabase
          .from('vps_instances')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (vpsData) setVps(vpsData)

        // Fetch agents from VPS
        const { data: agentsData, error: agentsError } = await supabase
          .from('vps_agents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (agentsError) throw agentsError
        if (agentsData) setAgents(agentsData)

      } catch (err: any) {
        console.error('[agents] Error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadAgents()
  }, [])

  const getAgentColor = (name: string) => AGENT_COLORS[name] || AGENT_COLORS.default
  const getAgentIcon = (name: string) => AGENT_ICONS[name] || AGENT_ICONS.default

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-white/30 text-sm">Loading agents...</div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-red-400 text-sm">Error: {error}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">AI Agents</h1>
            <p className="text-white/40 text-sm">
              {vps 
                ? `Connected to ${vps.name}` 
                : 'No VPS connected yet'}
            </p>
          </div>
          {vps && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
              <div className={`w-2 h-2 rounded-full ${vps.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`} />
              <span className="text-white/60 text-xs">{vps.status}</span>
            </div>
          )}
        </div>

        {/* No VPS */}
        {!vps && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🤖</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No agents yet</h2>
            <p className="text-white/50 text-sm mb-6">
              Complete your setup to launch your AI agents
            </p>
            <Link 
              href="/dashboard/tools"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors"
            >
              Connect Tools First →
            </Link>
          </div>
        )}

        {/* No Agents but has VPS */}
        {vps && agents.length === 0 && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Agents syncing...</h2>
            <p className="text-white/50 text-sm mb-6">
              Your agents will appear here once they sync from your VPS
            </p>
            <div className="flex items-center justify-center gap-2 text-white/30 text-sm">
              <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
              Syncing from {vps.tunnel_url}
            </div>
          </div>
        )}

        {/* Agent Grid */}
        {agents.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {agents.map(agent => (
              <div 
                key={agent.id}
                className="bg-[#111] border border-white/7 rounded-2xl p-5 hover:border-white/15 transition-all cursor-pointer"
                onClick={() => setSelectedAgent(agent)}
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: getAgentColor(agent.agent_name) + '20' }}
                    >
                      <span style={{ color: getAgentColor(agent.agent_name) }}>
                        {getAgentIcon(agent.agent_name)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-bold">{agent.agent_name}</p>
                      <p className="text-white/40 text-xs">{agent.agent_role || 'AI Agent'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${
                    agent.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-white/10 text-white/40'
                  }`}>
                    {agent.status === 'active' ? '● Active' : '○ Stopped'}
                  </span>
                </div>

                {/* Tools */}
                <div className="mb-4">
                  <p className="text-white/30 text-[10px] mb-2 uppercase tracking-wider">Tools</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.tools && agent.tools.length > 0 ? (
                      agent.tools.slice(0, 4).map((tool: string) => (
                        <span key={tool} className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-white/60">
                          {tool}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-white/30">No tools assigned</span>
                    )}
                    {agent.tools && agent.tools.length > 4 && (
                      <span className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-white/40">
                        +{agent.tools.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <Link 
                    href={`/dashboard/chat?agent=${agent.id}`}
                    className="flex-1 text-center text-xs py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Chat
                  </Link>
                  <Link 
                    href={`/dashboard/tasks?agent=${agent.id}`}
                    className="flex-1 text-center text-xs py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    Tasks
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Agent Detail Modal */}
        {selectedAgent && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedAgent(null)}
          >
            <div 
              className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: getAgentColor(selectedAgent.agent_name) + '20' }}
                  >
                    <span style={{ color: getAgentColor(selectedAgent.agent_name) }}>
                      {getAgentIcon(selectedAgent.agent_name)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedAgent.agent_name}</h2>
                    <p className="text-white/40 text-sm">{selectedAgent.agent_role}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Status</p>
                  <p className="text-white">{selectedAgent.status}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Hermes ID</p>
                  <p className="text-white/60 text-sm font-mono">{selectedAgent.hermes_agent_id}</p>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Last Seen</p>
                  <p className="text-white">
                    {selectedAgent.last_seen 
                      ? new Date(selectedAgent.last_seen).toLocaleString() 
                      : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Assigned Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.tools && selectedAgent.tools.map((tool: string) => (
                      <span key={tool} className="text-xs px-2 py-1 bg-white/5 rounded text-white/60">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-white/5 flex gap-3">
                <Link 
                  href={`/dashboard/chat?agent=${selectedAgent.id}`}
                  className="flex-1 text-center py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors"
                >
                  Chat with Agent
                </Link>
                <button 
                  onClick={() => setSelectedAgent(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 text-sm rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
