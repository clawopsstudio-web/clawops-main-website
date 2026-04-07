'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import DashboardSidebar from '@/components/ui/DashboardSidebar'
import { motion } from 'framer-motion'

interface AgentConfig {
  id: string
  agent_name: string
  agent_type: string
  skills: any
  status: string
  created_at: string
}

const AGENT_TYPES = [
  { value: 'devops', label: 'DevOps', icon: '🔧', description: 'Infrastructure, CI/CD, deployments' },
  { value: 'frontend', label: 'Frontend', icon: '🎨', description: 'UI/UX, landing pages, dashboards' },
  { value: 'backend', label: 'Backend', icon: '⚙️', description: 'APIs, databases, integrations' },
  { value: 'sales', label: 'Sales', icon: '💰', description: 'Lead gen, outreach, pipeline' },
  { value: 'marketing', label: 'Marketing', icon: '📢', description: 'Content, social, paid ads' },
  { value: 'support', label: 'Support', icon: '🎧', description: 'Customer support, tickets, chat' },
]

export default function MissionControlPage() {
  const [agents, setAgents] = useState<AgentConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newAgent, setNewAgent] = useState({ agent_name: '', agent_type: 'devops' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('agent_configs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setAgents(data || [])
    setLoading(false)
  }

  const addAgent = async () => {
    if (!newAgent.agent_name.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: agent } = await supabase
      .from('agent_configs')
      .insert({
        user_id: user.id,
        agent_name: newAgent.agent_name.trim(),
        agent_type: newAgent.agent_type,
        status: 'active',
      })
      .select()
      .single()
    if (agent) {
      setAgents([agent, ...agents])
      setNewAgent({ agent_name: '', agent_type: 'devops' })
      setShowAdd(false)
    }
    setSaving(false)
  }

  const toggleAgent = async (agent: AgentConfig) => {
    const newStatus = agent.status === 'active' ? 'paused' : 'active'
    const { data: updated } = await supabase
      .from('agent_configs')
      .update({ status: newStatus })
      .eq('id', agent.id)
      .select()
      .single()
    if (updated) {
      setAgents(agents.map((a) => (a.id === agent.id ? updated : a)))
    }
  }

  const deleteAgent = async (agent: AgentConfig) => {
    if (!confirm(`Delete "${agent.agent_name}"?`)) return
    await supabase.from('agent_configs').delete().eq('id', agent.id)
    setAgents(agents.filter((a) => a.id !== agent.id))
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <DashboardSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Mission Control</h1>
            <p className="text-gray-400 mt-1">Manage your AI agents</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Add Agent
          </button>
        </div>

        {/* Add Agent Modal */}
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6"
          >
            <h3 className="text-lg font-semibold mb-4">Add New Agent</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Agent Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dave (DevOps)"
                  value={newAgent.agent_name}
                  onChange={(e) => setNewAgent({ ...newAgent, agent_name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Agent Type</label>
                <select
                  value={newAgent.agent_type}
                  onChange={(e) => setNewAgent({ ...newAgent, agent_type: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                >
                  {AGENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={addAgent}
                disabled={saving || !newAgent.agent_name.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {saving ? 'Creating...' : 'Create Agent'}
              </button>
              <button
                onClick={() => { setShowAdd(false); setNewAgent({ agent_name: '', agent_type: 'devops' }) }}
                className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Agent Cards */}
        {loading ? (
          <div className="text-gray-500">Loading agents...</div>
        ) : agents.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <p className="text-4xl mb-4">🤖</p>
            <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
            <p className="text-gray-500 mb-4">Add your first AI agent to get started.</p>
            <button
              onClick={() => setShowAdd(true)}
              className="bg-cyan-600 hover:bg-cyan-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Add your first agent
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => {
              const typeInfo = AGENT_TYPES.find((t) => t.value === agent.agent_type)
              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{typeInfo?.icon || '🤖'}</span>
                      <div>
                        <h4 className="font-semibold">{agent.agent_name}</h4>
                        <p className="text-xs text-gray-500">{typeInfo?.description || agent.agent_type}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border ${
                      agent.status === 'active'
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => toggleAgent(agent)}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        agent.status === 'active'
                          ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      }`}
                    >
                      {agent.status === 'active' ? '⏸ Pause' : '▶ Activate'}
                    </button>
                    <button
                      onClick={() => deleteAgent(agent)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Agent Type Reference */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Available Agent Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {AGENT_TYPES.map((t) => (
              <div key={t.value} className="bg-gray-900 border border-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">{t.icon}</div>
                <div className="text-sm font-medium">{t.label}</div>
                <div className="text-xs text-gray-500 mt-1">{t.description}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
