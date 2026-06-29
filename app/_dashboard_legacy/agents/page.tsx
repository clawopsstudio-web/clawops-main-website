'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import AddAgentForm from './add-agent-form'

interface Agent {
  id: string
  workspace_id: string
  name: string
  role: string
  model: string | null
  profile: string
  status: string
  system_prompt: string | null
  description: string | null
  color: string
  tools: Array<{
    id: string
    name: string
    display_name: string
    icon: string
    category: string
  }>
  created_at: string
  updated_at: string
}

interface VPS {
  id: string
  name: string
  hermes_url: string
  status: string
}

interface Workspace {
  id: string
  name: string
  slug: string
}

const AGENT_ICONS: Record<string, string> = {
  sales: '💼',
  research: '🔬',
  marketing: '📣',
  devops: '⚡',
  general: '🤖',
}

const ROLE_LABELS: Record<string, string> = {
  sales: 'Sales Agent',
  research: 'Research Agent',
  marketing: 'Marketing Agent',
  devops: 'DevOps Agent',
  general: 'General Assistant',
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [vps, setVps] = useState<VPS | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const supabase = createClient()

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Not logged in')
        setLoading(false)
        return
      }

      // Get user's workspace
      const { data: workspaceData } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .single()

      if (!workspaceData) {
        setError('No workspace found')
        setLoading(false)
        return
      }
      setWorkspace(workspaceData)

      // Get VPS instance
      const { data: vpsData } = await supabase
        .from('vps_instances')
        .select('*')
        .eq('workspace_id', workspaceData.id)
        .limit(1)
        .single()

      if (vpsData) setVps(vpsData)

      // Fetch workspace agents with tools
      const response = await fetch(`/api/agents?workspaceId=${workspaceData.id}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load agents')
      }

      setAgents(data.agents || [])

    } catch (err: any) {
      console.error('[agents] Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleAgentCreated = () => {
    setShowAddForm(false)
    loadData()
  }

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent?')) return

    setDeleting(agentId)
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete agent')
      }

      setAgents(prev => prev.filter(a => a.id !== agentId))
      setSelectedAgent(null)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setDeleting(null)
    }
  }

  const getAgentIcon = (role: string) => AGENT_ICONS[role] || AGENT_ICONS.general
  const getRoleLabel = (role: string) => ROLE_LABELS[role] || role

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-white/30 text-sm flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        Loading agents...
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
        <p className="text-red-400 text-sm">Error: {error}</p>
        <button onClick={loadData} className="text-white/50 text-xs mt-2 hover:text-white">
          Try again
        </button>
      </div>
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
              {workspace ? `${agents.length} agent${agents.length !== 1 ? 's' : ''} in ${workspace.name}` : 'Manage your AI workforce'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {vps && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
                <div className={`w-2 h-2 rounded-full ${vps.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                <span className="text-white/60 text-xs">{vps.status}</span>
              </div>
            )}
            {workspace && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors"
              >
                <span className="text-lg">+</span>
                Add Agent
              </button>
            )}
          </div>
        </div>

        {/* No Workspace */}
        {!workspace && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🏢</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No workspace</h2>
            <p className="text-white/50 text-sm mb-6">
              Create a workspace first to start adding agents
            </p>
            <Link 
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors"
            >
              Go to Dashboard →
            </Link>
          </div>
        )}

        {/* No VPS */}
        {workspace && !vps && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🖥️</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No VPS connected</h2>
            <p className="text-white/50 text-sm mb-6">
              Connect your VPS to enable AI agents
            </p>
            <Link 
              href="/dashboard/tools"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors"
            >
              Connect VPS →
            </Link>
          </div>
        )}

        {/* No Agents but has VPS */}
        {workspace && vps && agents.length === 0 && (
          <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No agents yet</h2>
            <p className="text-white/50 text-sm mb-6">
              Create your first AI agent to get started
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors"
            >
              Create First Agent →
            </button>
          </div>
        )}

        {/* Agent Grid */}
        {agents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map(agent => (
              <div 
                key={agent.id}
                className="bg-[#111] border border-white/7 rounded-2xl p-5 hover:border-white/15 transition-all cursor-pointer group"
                onClick={() => setSelectedAgent(agent)}
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: (agent.color || '#6366f1') + '20' }}
                    >
                      <span style={{ color: agent.color || '#6366f1' }}>
                        {getAgentIcon(agent.role)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-bold">{agent.name}</p>
                      <p className="text-white/40 text-xs">{getRoleLabel(agent.role)}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-1 rounded-full ${
                    agent.status === 'active' 
                      ? 'bg-emerald-500/10 text-emerald-400' 
                      : 'bg-white/10 text-white/40'
                  }`}>
                    {agent.status === 'active' ? '● Active' : '○ Inactive'}
                  </span>
                </div>

                {/* Description */}
                {agent.description && (
                  <p className="text-white/40 text-sm mb-4 line-clamp-2">
                    {agent.description}
                  </p>
                )}

                {/* Model & Profile */}
                <div className="flex items-center gap-2 mb-4 text-xs text-white/30">
                  {agent.model && <span>Model: {agent.model}</span>}
                  {agent.model && agent.profile !== 'default' && <span>•</span>}
                  {agent.profile !== 'default' && <span>Profile: {agent.profile}</span>}
                </div>

                {/* Tools */}
                <div className="mb-4">
                  <p className="text-white/30 text-[10px] mb-2 uppercase tracking-wider">Tools</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.tools && agent.tools.length > 0 ? (
                      agent.tools.slice(0, 4).map(tool => (
                        <span key={tool.id} className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-white/60 flex items-center gap-1">
                          <span>{tool.icon}</span>
                          <span>{tool.display_name}</span>
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
                    style={{ backgroundColor: (selectedAgent.color || '#6366f1') + '20' }}
                  >
                    <span style={{ color: selectedAgent.color || '#6366f1' }}>
                      {getAgentIcon(selectedAgent.role)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white">{selectedAgent.name}</h2>
                    <p className="text-white/40 text-sm">{getRoleLabel(selectedAgent.role)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedAgent(null)}
                    className="text-white/40 hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Status</p>
                    <p className={`text-sm ${selectedAgent.status === 'active' ? 'text-emerald-400' : 'text-white/60'}`}>
                      {selectedAgent.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Profile</p>
                    <p className="text-sm text-white/60">{selectedAgent.profile}</p>
                  </div>
                  {selectedAgent.model && (
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Model</p>
                      <p className="text-sm text-white/60">{selectedAgent.model}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Created</p>
                    <p className="text-sm text-white/60">
                      {new Date(selectedAgent.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {selectedAgent.description && (
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-1">Description</p>
                    <p className="text-sm text-white/60">{selectedAgent.description}</p>
                  </div>
                )}

                {selectedAgent.system_prompt && (
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-1">System Prompt</p>
                    <p className="text-sm text-white/60 whitespace-pre-wrap bg-white/5 rounded-lg p-3">
                      {selectedAgent.system_prompt}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Assigned Tools</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAgent.tools && selectedAgent.tools.length > 0 ? (
                      selectedAgent.tools.map(tool => (
                        <span key={tool.id} className="text-xs px-2 py-1 bg-white/5 rounded-lg text-white/60 flex items-center gap-1">
                          <span>{tool.icon}</span>
                          <span>{tool.display_name}</span>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-white/30">No tools assigned</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-white/5 flex gap-3">
                <Link 
                  href={`/dashboard/chat?agent=${selectedAgent.id}`}
                  className="flex-1 text-center py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors"
                >
                  Chat with Agent
                </Link>
                <button
                  onClick={() => handleDeleteAgent(selectedAgent.id)}
                  disabled={deleting === selectedAgent.id}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-xl transition-colors disabled:opacity-50"
                >
                  {deleting === selectedAgent.id ? 'Deleting...' : 'Delete'}
                </button>
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

        {/* Add Agent Form */}
        {showAddForm && workspace && (
          <AddAgentForm
            workspaceId={workspace.id}
            onSuccess={handleAgentCreated}
            onCancel={() => setShowAddForm(false)}
          />
        )}

      </div>
    </div>
  )
}
