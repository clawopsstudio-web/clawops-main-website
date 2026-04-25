'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

const ROLES = ['Sales', 'Support', 'Research', 'Marketing', 'Operations', 'Custom']
const MODELS = [
  { id: 'moonshotai/kimi-k2-thinking', label: 'Kimi K2 (default)' },
  { id: 'openai/gpt-4o', label: 'GPT-4o' },
  { id: 'anthropic/claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
]
const TOOLS = [
  { id: 'gmail',    label: 'Gmail',    connected: true },
  { id: 'telegram', label: 'Telegram', connected: true },
  { id: 'notion',   label: 'Notion',   connected: false },
  { id: 'hubspot',  label: 'HubSpot',  connected: false },
  { id: 'slack',    label: 'Slack',    connected: false },
  { id: 'github',   label: 'GitHub',   connected: false },
]
const PERSONALITIES = ['Professional', 'Friendly', 'Direct']
const LANGUAGES = ['English', 'English (US)', 'English (UK)', 'Hindi', 'Spanish', 'French', 'German']
const AVATAR_COLORS = ['#e8ff47', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6']

const DEMO_AGENTS = [
  { id: 'demo-ryan',   name: 'Ryan',   role: 'Sales Agent',    status: 'running', system_prompt: 'You are Ryan, the sales pipeline agent. Find leads, qualify prospects, and manage outreach campaigns.', toolsConnected: 3, lastRan: '3 min ago', description: 'Ryan manages the entire sales pipeline — from lead generation to qualified demos.' },
  { id: 'demo-arjun',  name: 'Arjun',  role: 'Research Agent',  status: 'running', system_prompt: 'You are Arjun, the market research agent. Monitor competitors, analyze pricing, and synthesize market intelligence.', toolsConnected: 2, lastRan: '15 min ago', description: 'Arjun handles all research, competitive analysis, and market intelligence.' },
  { id: 'demo-helena', name: 'Helena', role: 'Support Agent', status: 'running', system_prompt: 'You are Helena, the customer support agent. Handle ticket triage, resolve common issues, and escalate when needed.', toolsConnected: 2, lastRan: '28 min ago', description: 'Helena handles support tickets, triage, and customer communication.' },
]

const CONFIG_TABS = ['Identity', 'Behaviour', 'Skills & Tools', 'Channels', 'Missions'] as const
type ConfigTab = typeof CONFIG_TABS[number]

interface AgentRecord {
  id: string; name: string; role: string; status?: string
  system_prompt?: string; description?: string; personality?: string; language?: string
  channels?: { dashboard: boolean; telegram: boolean; whatsapp: boolean; slack: boolean }
  tools?: string[]
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentRecord[]>([])
  const [showModal, setShowModal] = useState(false)
  const [configAgent, setConfigAgent] = useState<AgentRecord | null>(null)
  const [configTab, setConfigTab] = useState<ConfigTab>('Identity')

  // New agent form state
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('Sales')
  const [newPrompt, setNewPrompt] = useState('')
  const [newModel, setNewModel] = useState(MODELS[0].id)
  const [selectedTools, setSelectedTools] = useState<string[]>(['gmail'])
  const [creating, setCreating] = useState(false)
  const [createStep, setCreateStep] = useState<'idle' | 'creating' | 'initializing' | 'done'>('idle')

  // Config form state
  const [cfgName, setCfgName] = useState('')
  const [cfgRole, setCfgRole] = useState('')
  const [cfgColor, setCfgColor] = useState(AVATAR_COLORS[0])
  const [cfgDesc, setCfgDesc] = useState('')
  const [cfgPrompt, setCfgPrompt] = useState('')
  const [cfgPersonality, setCfgPersonality] = useState('Professional')
  const [cfgLanguage, setCfgLanguage] = useState('English')
  const [cfgTools, setCfgTools] = useState<string[]>([])
  const [cfgChannels, setCfgChannels] = useState({ dashboard: true, telegram: false, whatsapp: false, slack: false })
  const [cfgSaved, setCfgSaved] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id !== ADMIN_USER_ID) return
      supabase.from('agents').select('id, name, role, status, system_prompt').then(({ data }) => setAgents(data ?? []))
    })
  }, [])

  const openConfigModal = (agent: AgentRecord) => {
    setConfigAgent(agent)
    setConfigTab('Identity')
    setCfgName(agent.name)
    setCfgRole(agent.role ?? 'Sales')
    setCfgColor(AVATAR_COLORS[agent.name.charCodeAt(0) % AVATAR_COLORS.length])
    setCfgDesc(agent.description ?? '')
    setCfgPrompt(agent.system_prompt ?? '')
    setCfgPersonality(agent.personality ?? 'Professional')
    setCfgLanguage(agent.language ?? 'English')
    setCfgTools(agent.tools ?? ['gmail'])
    setCfgChannels(agent.channels ?? { dashboard: true, telegram: false, whatsapp: false, slack: false })
    setCfgSaved(false)
  }

  const toggleTool = (id: string) => {
    setCfgTools(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
  }

  const saveConfig = async () => {
    if (!configAgent) return
    const { error } = await supabase.from('agents').update({
      name: cfgName,
      role: cfgRole,
      system_prompt: cfgPrompt,
      description: cfgDesc,
      personality: cfgPersonality,
      language: cfgLanguage,
      tools: cfgTools,
      channels: cfgChannels,
    }).eq('id', configAgent.id)
    if (!error) {
      setAgents(prev => prev.map(a => a.id === configAgent.id ? { ...a, name: cfgName, role: cfgRole, system_prompt: cfgPrompt, description: cfgDesc, personality: cfgPersonality, language: cfgLanguage, tools: cfgTools, channels: cfgChannels } : a))
      setCfgSaved(true)
      setTimeout(() => setCfgSaved(false), 2000)
    }
  }

  const toggleToolNew = (id: string) => {
    setSelectedTools(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
  }

  const defaultPrompt = (name: string, role: string) =>
    `You are ${name || 'the agent'}, a ${role.toLowerCase()} AI agent. You work autonomously, prioritizing tasks and reporting back clearly.`

  const handleCreateAgent = async () => {
    if (!newName.trim()) return
    setCreating(true)
    setCreateStep('creating')
    const { data, error } = await supabase.from('agents').insert({
      name: newName.trim(), role: newRole, status: 'initializing',
      system_prompt: newPrompt || defaultPrompt(newName, newRole),
      model: newModel, tools: selectedTools,
    }).select().single()
    if (error || !data) { setCreating(false); setCreateStep('idle'); return }
    setCreateStep('initializing')
    await new Promise(r => setTimeout(r, 3000))
    await supabase.from('agents').update({ status: 'active' }).eq('id', data.id)
    setAgents(prev => [...prev.filter(a => a.id !== data.id), data])
    setCreateStep('done')
    await new Promise(r => setTimeout(r, 600))
    closeNewModal()
  }

  const closeNewModal = () => {
    setShowModal(false); setCreating(false); setCreateStep('idle')
    setNewName(''); setNewRole('Sales'); setNewPrompt(''); setNewModel(MODELS[0].id); setSelectedTools(['gmail'])
  }

  const getCardColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

  const displayAgents = agents.length > 0 ? agents : []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-lg">Agents</h1>
          <p className="text-white/30 text-xs mt-1">{displayAgents.length} agent{displayAgents.length !== 1 ? 's' : ''} active</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-xs rounded-xl transition-colors">
          + New Agent
        </button>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-3 gap-4">
        {displayAgents.map(a => {
          const demo = DEMO_AGENTS.find(d => d.name === a.name)
          const color = getCardColor(a.name)
          return (
            <div key={a.id} className="bg-[#111] border border-white/7 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-black text-sm" style={{ backgroundColor: color }}>{a.name[0]}</div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  a.status === 'running' || a.status === 'active' ? 'bg-emerald-950 text-emerald-400' :
                  a.status === 'initializing' ? 'bg-yellow-950 text-yellow-400 animate-pulse' : 'bg-white/8 text-white/40'
                }`}>
                  {a.status === 'initializing' ? 'initializing...' : (a.status ?? 'idle')}
                </span>
              </div>
              <p className="text-white font-bold text-sm mb-0.5">{a.name}</p>
              <p className="text-white/30 text-xs">{a.role ?? 'General'}</p>
              {demo && <p className="text-white/20 text-[10px] mt-1">Last ran: {demo.lastRan}</p>}
              <div className="flex gap-2 mt-4">
                <Link href="/dashboard/chat" className="text-[10px] text-white/40 hover:text-white/70">Chat →</Link>
                <button onClick={() => openConfigModal(a)} className="text-[10px] text-white/40 hover:text-white/70">Config</button>
                <button className="text-[10px] text-red-400/50 hover:text-red-400">Delete</button>
              </div>
            </div>
          )
        })}
        {/* Placeholder */}
        {Array.from({ length: Math.max(0, 3 - displayAgents.length) }).map((_, i) => (
          <button key={i} onClick={() => setShowModal(true)} className="bg-[#111] border border-dashed border-white/8 rounded-xl p-5 text-center hover:border-white/15 transition-colors">
            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3 text-white/20 text-xl">+</div>
            <p className="text-white/30 text-xs">Add agent</p>
          </button>
        ))}
      </div>

      {/* ── AGENT CONFIG MODAL (5 tabs) ── */}
      {configAgent && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-stretch justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-black font-black text-sm" style={{ backgroundColor: cfgColor }}>{cfgName[0]}</div>
                <div>
                  <h3 className="text-white font-bold text-sm">{cfgName} Configuration</h3>
                  <p className="text-white/30 text-[10px]">{cfgRole}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {cfgSaved && <span className="text-emerald-400 text-xs">✓ Saved</span>}
                <button onClick={() => setConfigAgent(null)} className="text-white/30 hover:text-white text-lg">✕</button>
              </div>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-white/5 shrink-0 px-4">
              {CONFIG_TABS.map(tab => (
                <button key={tab} onClick={() => setConfigTab(tab)}
                  className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                    configTab === tab ? 'text-white border-[#e8ff47]' : 'text-white/40 border-transparent hover:text-white/70'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Identity */}
              {configTab === 'Identity' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/50 text-xs block mb-1.5">Name</label>
                      <input value={cfgName} onChange={e => setCfgName(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-white/80 text-sm focus:outline-none focus:border-white/20" />
                    </div>
                    <div>
                      <label className="text-white/50 text-xs block mb-1.5">Role</label>
                      <select value={cfgRole} onChange={e => setCfgRole(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-white/80 text-sm focus:outline-none">
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs block mb-2">Avatar colour</label>
                    <div className="flex gap-2">
                      {AVATAR_COLORS.map(c => (
                        <button key={c} onClick={() => setCfgColor(c)}
                          className={`w-7 h-7 rounded-full transition-transform ${cfgColor === c ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs block mb-1.5">Description / Purpose</label>
                    <textarea value={cfgDesc} onChange={e => setCfgDesc(e.target.value)} rows={3}
                      placeholder="What does this agent do?"
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm focus:outline-none focus:border-white/20 resize-none" />
                  </div>
                </div>
              )}

              {/* Behaviour */}
              {configTab === 'Behaviour' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-white/50 text-xs block mb-1.5">System Prompt</label>
                    <textarea value={cfgPrompt} onChange={e => setCfgPrompt(e.target.value)} rows={7}
                      placeholder="You are Ryan, a sales agent who..."
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm focus:outline-none focus:border-white/20 resize-none font-mono" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/50 text-xs block mb-1.5">Personality</label>
                      <select value={cfgPersonality} onChange={e => setCfgPersonality(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-white/80 text-sm focus:outline-none">
                        {PERSONALITIES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-white/50 text-xs block mb-1.5">Language</label>
                      <select value={cfgLanguage} onChange={e => setCfgLanguage(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl px-3 py-2.5 text-white/80 text-sm focus:outline-none">
                        {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills & Tools */}
              {configTab === 'Skills & Tools' && (
                <div className="space-y-4">
                  <p className="text-white/40 text-xs">Toggle which tools this agent has access to.</p>
                  <div className="space-y-2">
                    {TOOLS.map(tool => {
                      const enabled = cfgTools.includes(tool.id)
                      return (
                        <div key={tool.id} className="flex items-center justify-between bg-[#111] border border-white/8 rounded-xl px-4 py-3">
                          <div>
                            <p className="text-white/80 text-sm font-medium">{tool.label}</p>
                            <p className="text-white/30 text-[10px]">{tool.connected ? 'Connected' : 'Not connected — connect in Tools first'}</p>
                          </div>
                          <button
                            onClick={() => tool.connected ? toggleTool(tool.id) : null}
                            className={`w-10 h-6 rounded-full transition-colors relative ${enabled && tool.connected ? 'bg-[#e8ff47]' : tool.connected ? 'bg-white/15' : 'bg-white/5 cursor-not-allowed'}`}
                            disabled={!tool.connected}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full transition-all shadow-sm ${enabled && tool.connected ? 'left-5 bg-black' : 'left-1 bg-white/40'}`} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                  {!TOOLS.some(t => t.connected) && (
                    <Link href="/dashboard/tools" className="block text-center text-[#e8ff47]/70 hover:text-[#e8ff47] text-xs border border-[#e8ff47]/20 rounded-xl py-2">
                      Connect tools in Tools page →
                    </Link>
                  )}
                </div>
              )}

              {/* Channels */}
              {configTab === 'Channels' && (
                <div className="space-y-3">
                  {[
                    { key: 'dashboard' as const, label: 'Dashboard Chat', desc: 'Chat with this agent from the web dashboard', enabled: cfgChannels.dashboard, onChange: (v: boolean) => setCfgChannels(p => ({ ...p, dashboard: v })) },
                    { key: 'telegram' as const, label: 'Telegram', desc: 'Receive messages via Telegram bot', enabled: cfgChannels.telegram, onChange: (v: boolean) => setCfgChannels(p => ({ ...p, telegram: v })) },
                    { key: 'whatsapp' as const, label: 'WhatsApp', desc: 'Receive updates via WhatsApp', enabled: cfgChannels.whatsapp, onChange: (v: boolean) => setCfgChannels(p => ({ ...p, whatsapp: v })) },
                    { key: 'slack' as const, label: 'Slack', desc: 'Post updates to Slack channels', enabled: cfgChannels.slack, onChange: (v: boolean) => setCfgChannels(p => ({ ...p, slack: v })) },
                  ].map(ch => (
                    <div key={ch.key} className="flex items-center justify-between bg-[#111] border border-white/8 rounded-xl px-4 py-3">
                      <div>
                        <p className="text-white/80 text-sm font-medium">{ch.label}</p>
                        <p className="text-white/30 text-[10px]">{ch.desc}</p>
                      </div>
                      <button
                        onClick={() => ch.onChange(!ch.enabled)}
                        className={`w-10 h-6 rounded-full transition-colors relative ${ch.enabled ? 'bg-[#e8ff47]' : 'bg-white/15'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all shadow-sm ${ch.enabled ? 'left-5 bg-black' : 'left-1 bg-white/40'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Missions */}
              {configTab === 'Missions' && (
                <div className="space-y-4">
                  <div className="bg-[#111] border border-white/8 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">Daily Lead Digest</p>
                        <p className="text-white/30 text-[10px]">CRON · 08:00 daily</p>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">Support Ticket Monitor</p>
                        <p className="text-white/30 text-[10px]">TRIGGER · On new Gmail</p>
                      </div>
                      <span className="text-[10px] bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full">Running</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm font-medium">Weekly Report</p>
                        <p className="text-white/30 text-[10px]">CRON · Monday 09:00</p>
                      </div>
                      <span className="text-[10px] bg-white/8 text-white/40 px-2 py-0.5 rounded-full">Paused</span>
                    </div>
                  </div>
                  <Link href="/dashboard/missions"
                    className="block text-center py-2.5 border border-white/10 rounded-xl text-white/40 hover:text-white/70 hover:border-white/15 text-xs transition-colors">
                    + Create new mission for {cfgName} →
                  </Link>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-white/5 shrink-0">
              <button onClick={() => setConfigAgent(null)} className="px-4 py-2.5 text-white/40 text-sm hover:text-white/70 transition-colors">Cancel</button>
              <button onClick={saveConfig} className="px-5 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors">
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW AGENT MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="text-white font-bold">Create new agent</h3>
              <button onClick={closeNewModal} className="text-white/30 hover:text-white text-lg">✕</button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {createStep === 'idle' || createStep === 'creating' ? (
                <>
                  <div>
                    <label className="text-white/50 text-xs block mb-1.5">Agent name *</label>
                    <input value={newName} onChange={e => { setNewName(e.target.value); if (!newPrompt) setNewPrompt(defaultPrompt(e.target.value, newRole)) }}
                      placeholder="e.g. Ryan" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none focus:border-white/20" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs block mb-1.5">Role</label>
                    <select value={newRole} onChange={e => { setNewRole(e.target.value); if (!newPrompt) setNewPrompt(defaultPrompt(newName, e.target.value)) }}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs block mb-1.5">System prompt</label>
                    <textarea value={newPrompt} onChange={e => setNewPrompt(e.target.value)} rows={4}
                      placeholder="You are Ryan, a sales agent who..."
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm focus:outline-none focus:border-white/20 resize-none font-mono" />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs block mb-1.5">Model</label>
                    <select value={newModel} onChange={e => setNewModel(e.target.value)}
                      className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none">
                      {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-white/50 text-xs block mb-2">Tools access</label>
                    <div className="grid grid-cols-3 gap-2">
                      {TOOLS.map(tool => (
                        <button key={tool.id} onClick={() => toggleToolNew(tool.id)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs transition-colors ${
                            selectedTools.includes(tool.id) ? 'bg-[#e8ff47]/10 border-[#e8ff47]/30 text-[#e8ff47]/80' : 'bg-[#111] border-white/8 text-white/40 hover:border-white/15'
                          }`}>
                          <span className="text-[10px]">{selectedTools.includes(tool.id) ? '☑' : '☐'}</span>{tool.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#e8ff47]/10 border border-[#e8ff47]/20 flex items-center justify-center mx-auto text-2xl animate-pulse">⚙</div>
                  <div>
                    <p className="text-white font-semibold text-sm">{newName || 'Agent'} is initializing...</p>
                    <p className="text-white/40 text-xs mt-1">Setting up on your VPS. About 30 seconds.</p>
                  </div>
                  <div className="flex justify-center gap-1.5">
                    {[0, 150, 300].map(delay => (
                      <div key={delay} className="w-1.5 h-1.5 rounded-full bg-[#e8ff47] animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 px-6 py-4 border-t border-white/5">
              <button onClick={closeNewModal} className="flex-1 py-2.5 text-white/40 text-sm hover:text-white/70 text-center">Cancel</button>
              {createStep === 'idle' && (
                <button onClick={handleCreateAgent} disabled={!newName.trim() || creating}
                  className="flex-[2] py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-40 text-black font-bold text-sm rounded-xl text-center transition-colors">
                  Create Agent
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
