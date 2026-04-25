'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

const ROLES = ['Sales', 'Support', 'Research', 'Marketing', 'Operations', 'Custom']
const MODELS = [
  { id: 'moonshotai/kimi-k2-thinking', label: 'Kimi K2 (default)' },
  { id: 'openai/gpt-4o', label: 'GPT-4o' },
  { id: 'anthropic/claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
]
const TOOLS = [
  { id: 'gmail', label: 'Gmail' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'notion', label: 'Notion' },
  { id: 'hubspot', label: 'HubSpot' },
  { id: 'slack', label: 'Slack' },
]

const AGENT_COLORS = ['#e8ff47', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6']

const DEMO_AGENTS = [
  { id: 'demo-ryan', name: 'Ryan', role: 'Sales Agent', status: 'running', system_prompt: 'You are Ryan, the sales pipeline agent. Find leads, qualify prospects, and manage outreach campaigns.', toolsConnected: 3, lastRan: '3 min ago' },
  { id: 'demo-arjun', name: 'Arjun', role: 'Research Agent', status: 'running', system_prompt: 'You are Arjun, the market research agent. Monitor competitors, analyze pricing, and synthesize market intelligence.', toolsConnected: 2, lastRan: '15 min ago' },
  { id: 'demo-helena', name: 'Helena', role: 'Support Agent', status: 'running', system_prompt: 'You are Helena, the customer support agent. Handle ticket triage, resolve common issues, and escalate when needed.', toolsConnected: 2, lastRan: '28 min ago' },
]

interface AgentRecord { id: string; name: string; role: string; status?: string }

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentRecord[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editModal, setEditModal] = useState<typeof DEMO_AGENTS[0] | null>(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('Sales')
  const [newPrompt, setNewPrompt] = useState('')
  const [newModel, setNewModel] = useState(MODELS[0].id)
  const [selectedTools, setSelectedTools] = useState<string[]>(['gmail'])
  const [creating, setCreating] = useState(false)
  const [createStep, setCreateStep] = useState<'idle' | 'creating' | 'initializing' | 'done'>('idle')
  const [userId, setUserId] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? '')
    })
  }, [])

  useEffect(() => {
    supabase.from('agents').select('id, name, role, status').then(({ data }) => setAgents(data ?? []))
  }, [])

  const displayAgents = agents

  const openEditModal = (agent: typeof DEMO_AGENTS[0]) => {
    setEditModal(agent)
    setEditPrompt(agent.system_prompt)
  }

  const toggleTool = (id: string) => {
    setSelectedTools(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
  }

  const defaultPrompt = (name: string, role: string) =>
    `You are ${name || 'the agent'}, a ${role.toLowerCase()} AI agent. You work autonomously, prioritizing tasks and reporting back clearly.`

  const handleCreateAgent = async () => {
    if (!newName.trim()) return
    setCreating(true)
    setCreateStep('creating')

    // Step 1: Insert into DB
    const { data, error } = await supabase
      .from('agents')
      .insert({
        name: newName.trim(),
        role: newRole,
        status: 'initializing',
        system_prompt: newPrompt || defaultPrompt(newName, newRole),
        model: newModel,
        tools: selectedTools,
      })
      .select()
      .single()

    if (error || !data) {
      setCreating(false)
      setCreateStep('idle')
      return
    }

    // Step 2: Simulate VPS initialization (3s)
    setCreateStep('initializing')
    await new Promise(r => setTimeout(r, 3000))

    // Step 3: Mark active in DB
    await supabase.from('agents').update({ status: 'active' }).eq('id', data.id)

    setAgents(prev => [...prev.filter(a => a.id !== data.id), data])
    setCreateStep('done')

    await new Promise(r => setTimeout(r, 600))
    closeModal()
  }

  const closeModal = () => {
    setShowModal(false)
    setCreating(false)
    setCreateStep('idle')
    setNewName('')
    setNewRole('Sales')
    setNewPrompt('')
    setNewModel(MODELS[0].id)
    setSelectedTools(['gmail'])
  }

  const getCardColor = (name: string) => {
    const idx = name.charCodeAt(0) % AGENT_COLORS.length
    return AGENT_COLORS[idx]
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-lg">Agents</h1>
          <p className="text-white/30 text-xs mt-1">{displayAgents.length} agent{displayAgents.length !== 1 ? 's' : ''} active</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-xs rounded-xl transition-colors"
        >
          + New Agent
        </button>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-3 gap-4">
        {displayAgents.map(a => {
          const demoAgent = DEMO_AGENTS.find(d => d.id === a.id)
          const color = getCardColor(a.name)
          return (
            <div key={a.id} className="bg-[#111] border border-white/7 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-black text-sm"
                  style={{ backgroundColor: color }}
                >
                  {a.name[0]}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  a.status === 'running' || a.status === 'active' ? 'bg-emerald-950 text-emerald-400' :
                  a.status === 'initializing' ? 'bg-yellow-950 text-yellow-400 animate-pulse' :
                  'bg-white/8 text-white/40'
                }`}>
                  {a.status === 'initializing' ? 'initializing...' : (a.status ?? 'idle')}
                </span>
              </div>
              <p className="text-white font-bold text-sm mb-0.5">{a.name}</p>
              <p className="text-white/30 text-xs">{a.role ?? 'General'}</p>
              {demoAgent && (
                <div className="mt-2 flex items-center gap-3 text-[10px] text-white/30">
                  <span>Last ran: {demoAgent.lastRan}</span>
                  <span className="text-white/20">·</span>
                  <span>{demoAgent.toolsConnected} tools</span>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button className="text-[10px] text-white/40 hover:text-white/70">Chat →</button>
                {demoAgent ? (
                  <button onClick={() => openEditModal(demoAgent)} className="text-[10px] text-white/40 hover:text-white/70">Edit</button>
                ) : (
                  <button className="text-[10px] text-white/40 hover:text-white/70">Config</button>
                )}
                {!demoAgent && (
                  <button className="text-[10px] text-red-400/50 hover:text-red-400">Delete</button>
                )}
              </div>
            </div>
          )
        })}
        {/* Placeholder cards */}
        {Array.from({ length: Math.max(0, 3 - displayAgents.length) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setShowModal(true)}
            className="bg-[#111] border border-dashed border-white/8 rounded-xl p-5 text-center hover:border-white/15 transition-colors"
          >
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 text-white/20 text-xl">+</div>
            <p className="text-white/30 text-xs">Add agent</p>
          </button>
        ))}
      </div>

      {/* Edit Agent modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold">{editModal.name} — System Prompt</h3>
              <button onClick={() => setEditModal(null)} className="text-white/30 hover:text-white text-lg">✕</button>
            </div>
            <p className="text-white/40 text-xs">This defines how {editModal.name} thinks and operates. Edit with care — changes apply immediately.</p>
            <textarea
              value={editPrompt}
              onChange={e => setEditPrompt(e.target.value)}
              rows={8}
              className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm focus:outline-none focus:border-white/20 resize-none font-mono"
              placeholder="System prompt..."
            />
            <div className="flex gap-2 pt-2">
              <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 text-white/50 text-sm hover:text-white/80">Cancel</button>
              <button onClick={() => setEditModal(null)} className="flex-1 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* New Agent modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-5">

            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-base">Create new agent</h3>
              <button onClick={closeModal} className="text-white/30 hover:text-white text-lg">✕</button>
            </div>

            {createStep === 'idle' || createStep === 'creating' ? (
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-white/60 text-xs block mb-1.5">Agent name *</label>
                  <input
                    value={newName}
                    onChange={e => {
                      setNewName(e.target.value)
                      if (!newPrompt) setNewPrompt(defaultPrompt(e.target.value, newRole))
                    }}
                    placeholder="e.g. Ryan"
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none focus:border-white/20"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-white/60 text-xs block mb-1.5">Role</label>
                  <select
                    value={newRole}
                    onChange={e => {
                      setNewRole(e.target.value)
                      if (!newPrompt) setNewPrompt(defaultPrompt(newName, e.target.value))
                    }}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* System prompt */}
                <div>
                  <label className="text-white/60 text-xs block mb-1.5">System prompt</label>
                  <textarea
                    value={newPrompt}
                    onChange={e => setNewPrompt(e.target.value)}
                    rows={5}
                    placeholder="You are Ryan, a sales agent who..."
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm focus:outline-none focus:border-white/20 resize-none font-mono"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="text-white/60 text-xs block mb-1.5">Model</label>
                  <select
                    value={newModel}
                    onChange={e => setNewModel(e.target.value)}
                    className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none"
                  >
                    {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>

                {/* Tools */}
                <div>
                  <label className="text-white/60 text-xs block mb-2">Tools access</label>
                  <div className="grid grid-cols-3 gap-2">
                    {TOOLS.map(tool => (
                      <button
                        key={tool.id}
                        onClick={() => toggleTool(tool.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors ${
                          selectedTools.includes(tool.id)
                            ? 'bg-[#e8ff47]/10 border-[#e8ff47]/30 text-[#e8ff47]/80'
                            : 'bg-[#111] border-white/8 text-white/40 hover:border-white/15'
                        }`}
                      >
                        <span className="text-[10px]">{selectedTools.includes(tool.id) ? '☑' : '☐'}</span>
                        {tool.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Initializing state */
              <div className="py-6 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#e8ff47]/10 border border-[#e8ff47]/20 flex items-center justify-center mx-auto text-xl animate-pulse">
                  ⚙
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">Initializing {newName || 'agent'}...</p>
                  <p className="text-white/40 text-xs">Setting up on your VPS. This takes about 30 seconds.</p>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e8ff47] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e8ff47] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#e8ff47] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button onClick={closeModal} className="flex-1 py-2.5 text-white/50 text-sm hover:text-white/80 text-center">
                Cancel
              </button>
              {createStep === 'idle' && (
                <button
                  onClick={handleCreateAgent}
                  disabled={!newName.trim() || creating}
                  className="flex-[2] py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-40 text-black font-bold text-sm rounded-xl text-center"
                >
                  {creating ? 'Creating...' : 'Create Agent'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
