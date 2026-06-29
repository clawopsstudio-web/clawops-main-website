'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

const ROLES = ['Sales', 'Support', 'Research', 'Marketing', 'Operations', 'Custom']
const PROVIDERS = [
  { id: 'custom-api-codemax-pro', name: 'Codemax (Claude)', models: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5-20251001'] },
  { id: 'openai-codex', name: 'OpenAI Codex', models: ['gpt-5.4', 'gpt-5.4-mini', 'gpt-5.3-codex'] },
  { id: 'openrouter', name: 'OpenRouter', models: ['openrouter/google/gemini-2.5-pro', 'openrouter/anthropic/claude-sonnet'] },
  { id: 'nvidia', name: 'NVIDIA', models: ['nvidia/llama-3.1-nemotron-70b', 'nvidia/mistral-nemo'] },
  { id: 'custom', name: 'Custom Provider', models: [] },
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

const CONFIG_TABS = ['Identity', 'Behaviour', 'Skills & Tools', 'Channels', 'Missions', 'Runtime'] as const
type ConfigTab = typeof CONFIG_TABS[number]

const DEFAULT_PROVIDER = 'custom-api-codemax-pro'
const DEFAULT_MODEL = 'claude-sonnet-4-6'
const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_MAX_TOKENS = 8192

interface AgentRecord {
  id: string
  name: string
  role: string
  status?: string
  sync_status?: 'synced' | 'not_synced' | 'sync_failed'
  system_prompt?: string
  description?: string
  personality?: string
  language?: string
  provider?: string
  model_id?: string
  temperature?: number
  max_tokens?: number
  channels?: { dashboard: boolean; telegram: boolean; whatsapp: boolean; slack: boolean }
  tools?: string[]
}

export default function AgentDetailPage() {
  const params = useParams()
  const agentId = params.id as string

  const [agent, setAgent] = useState<AgentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [configTab, setConfigTab] = useState<ConfigTab>('Identity')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [syncError, setSyncError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [role, setRole] = useState('Sales')
  const [color, setColor] = useState(AVATAR_COLORS[0])
  const [description, setDescription] = useState('')
  const [prompt, setPrompt] = useState('')
  const [provider, setProvider] = useState(DEFAULT_PROVIDER)
  const [modelId, setModelId] = useState(DEFAULT_MODEL)
  const [temperature, setTemperature] = useState(DEFAULT_TEMPERATURE)
  const [maxTokens, setMaxTokens] = useState(DEFAULT_MAX_TOKENS)
  const [personality, setPersonality] = useState('Professional')
  const [language, setLanguage] = useState('English')
  const [tools, setTools] = useState<string[]>([])
  const [channels, setChannels] = useState({ dashboard: true, telegram: false, whatsapp: false, slack: false })

  const supabase = createClient()

  useEffect(() => {
    loadAgent()
  }, [agentId])

  const loadAgent = async () => {
    setLoading(true)
    const { data } = await supabase.from('agents').select('*').eq('id', agentId).single()
    if (data) {
      setAgent(data)
      initializeForm(data)
    }
    setLoading(false)
  }

  const initializeForm = (a: AgentRecord) => {
    setName(a.name)
    setRole(a.role ?? 'Sales')
    setColor(AVATAR_COLORS[a.name.charCodeAt(0) % AVATAR_COLORS.length])
    setDescription(a.description ?? '')
    setPrompt(a.system_prompt ?? '')
    setProvider(a.provider ?? DEFAULT_PROVIDER)
    setModelId(a.model_id ?? DEFAULT_MODEL)
    setTemperature(a.temperature ?? DEFAULT_TEMPERATURE)
    setMaxTokens(a.max_tokens ?? DEFAULT_MAX_TOKENS)
    setPersonality(a.personality ?? 'Professional')
    setLanguage(a.language ?? 'English')
    setTools(a.tools ?? ['gmail'])
    setChannels(a.channels ?? { dashboard: true, telegram: false, whatsapp: false, slack: false })
  }

  const getModelsForProvider = (providerId: string) => {
    const p = PROVIDERS.find(p => p.id === providerId)
    return p?.models ?? []
  }

  const toggleTool = (id: string) => {
    setTools(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id])
  }

  const saveConfig = async () => {
    setSaving(true)
    const { error } = await supabase.from('agents').update({
      name, role, description, system_prompt: prompt, provider, model_id: modelId,
      temperature, max_tokens: maxTokens, personality, language, tools, channels,
    }).eq('id', agentId)
    setSaving(false)
    if (!error) {
      setAgent(prev => prev ? { ...prev, name, role, description, system_prompt: prompt, provider, model_id: modelId, temperature, max_tokens: maxTokens, personality, language, tools, channels } : null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const syncAgent = async () => {
    setSyncing(true)
    setSyncError(null)
    try {
      const res = await fetch('/api/agents/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_ids: [agentId] }),
      })
      const data = await res.json()
      if (res.ok) {
        setAgent(prev => prev ? { ...prev, sync_status: 'synced' } : null)
      } else {
        setSyncError(data.error || 'Sync failed')
        setAgent(prev => prev ? { ...prev, sync_status: 'sync_failed' } : null)
      }
    } catch {
      setSyncError('Network error')
      setAgent(prev => prev ? { ...prev, sync_status: 'sync_failed' } : null)
    }
    setSyncing(false)
  }

  const getSyncBadge = (status?: string) => {
    switch (status) {
      case 'synced':
        return <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Synced</span>
      case 'sync_failed':
        return <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Sync Failed</span>
      default:
        return <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Not Synced</span>
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-white/40 text-sm">Loading agent...</div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="p-6">
        <Link href="/dashboard/agents" className="text-white/40 hover:text-white text-sm">← Back to Agents</Link>
        <div className="mt-6 text-center text-white/40">Agent not found</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/agents" className="text-white/40 hover:text-white text-sm">← Back</Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-black font-black text-lg" style={{ backgroundColor: color }}>
              {name[0]}
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">{name}</h1>
              <p className="text-white/30 text-sm">{role}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-emerald-400 text-sm">✓ Saved</span>}
          {getSyncBadge(agent.sync_status)}
          <span className={`text-xs px-2 py-1 rounded-full ${
            agent.status === 'running' || agent.status === 'active' ? 'bg-emerald-950 text-emerald-400' :
            agent.status === 'initializing' ? 'bg-yellow-950 text-yellow-400' : 'bg-white/8 text-white/40'
          }`}>
            {agent.status ?? 'idle'}
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
        {CONFIG_TABS.map(tab => (
          <button key={tab} onClick={() => setConfigTab(tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              configTab === tab ? 'text-white border-[#e8ff47]' : 'text-white/40 border-transparent hover:text-white/70'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="space-y-5">
        {/* Identity */}
        {configTab === 'Identity' && (
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/50 text-xs block mb-1.5">Name</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none focus:border-white/20" />
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1.5">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none">
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-2">Avatar colour</label>
              <div className="flex gap-2">
                {AVATAR_COLORS.map(c => (
                  <button key={c} onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1.5">Description / Purpose</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                placeholder="What does this agent do?"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm focus:outline-none focus:border-white/20 resize-none" />
            </div>
          </div>
        )}

        {/* Behaviour */}
        {configTab === 'Behaviour' && (
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-white/50 text-xs block mb-1.5">System Prompt</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={8}
                placeholder="You are Ryan, a sales agent who..."
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm focus:outline-none focus:border-white/20 resize-none font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/50 text-xs block mb-1.5">Personality</label>
                <select value={personality} onChange={e => setPersonality(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none">
                  {PERSONALITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1.5">Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none">
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Skills & Tools */}
        {configTab === 'Skills & Tools' && (
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6 space-y-4">
            <p className="text-white/40 text-sm">Toggle which tools this agent has access to.</p>
            <div className="space-y-3">
              {TOOLS.map(tool => {
                const enabled = tools.includes(tool.id)
                return (
                  <div key={tool.id} className="flex items-center justify-between bg-[#1a1a1a] border border-white/8 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-white/80 text-sm font-medium">{tool.label}</p>
                      <p className="text-white/30 text-xs">{tool.connected ? 'Connected' : 'Not connected — connect in Tools first'}</p>
                    </div>
                    <button
                      onClick={() => tool.connected ? toggleTool(tool.id) : null}
                      className={`w-11 h-6 rounded-full transition-colors relative ${enabled && tool.connected ? 'bg-[#e8ff47]' : tool.connected ? 'bg-white/15' : 'bg-white/5 cursor-not-allowed'}`}
                      disabled={!tool.connected}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all shadow-sm ${enabled && tool.connected ? 'left-6 bg-black' : 'left-1 bg-white/40'}`} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Channels */}
        {configTab === 'Channels' && (
          <div className="space-y-3">
            {[
              { key: 'dashboard' as const, label: 'Dashboard Chat', desc: 'Chat with this agent from the web dashboard' },
              { key: 'telegram' as const, label: 'Telegram', desc: 'Receive messages via Telegram bot' },
              { key: 'whatsapp' as const, label: 'WhatsApp', desc: 'Receive updates via WhatsApp' },
              { key: 'slack' as const, label: 'Slack', desc: 'Post updates to Slack channels' },
            ].map(ch => (
              <div key={ch.key} className="flex items-center justify-between bg-[#111] border border-white/8 rounded-xl px-5 py-4">
                <div>
                  <p className="text-white/80 text-sm font-medium">{ch.label}</p>
                  <p className="text-white/30 text-xs">{ch.desc}</p>
                </div>
                <button
                  onClick={() => setChannels(p => ({ ...p, [ch.key]: !p[ch.key] }))}
                  className={`w-11 h-6 rounded-full transition-colors relative ${channels[ch.key] ? 'bg-[#e8ff47]' : 'bg-white/15'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all shadow-sm ${channels[ch.key] ? 'left-6 bg-black' : 'left-1 bg-white/40'}`} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Missions */}
        {configTab === 'Missions' && (
          <div className="bg-[#111] border border-white/8 rounded-2xl p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-[#1a1a1a] rounded-xl px-4 py-3">
                <div>
                  <p className="text-white/80 text-sm font-medium">Daily Lead Digest</p>
                  <p className="text-white/30 text-xs">CRON · 08:00 daily</p>
                </div>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between bg-[#1a1a1a] rounded-xl px-4 py-3">
                <div>
                  <p className="text-white/80 text-sm font-medium">Support Ticket Monitor</p>
                  <p className="text-white/30 text-xs">TRIGGER · On new Gmail</p>
                </div>
                <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-0.5 rounded-full">Running</span>
              </div>
            </div>
            <Link href="/dashboard/missions"
              className="block text-center py-3 border border-white/10 rounded-xl text-white/40 hover:text-white/70 hover:border-white/15 text-sm transition-colors">
              + Create new mission for {name} →
            </Link>
          </div>
        )}

        {/* Runtime Tab */}
        {configTab === 'Runtime' && (
          <div className="space-y-5">
            <div className="bg-[#111] border border-white/8 rounded-2xl p-6 space-y-4">
              <h3 className="text-white/80 font-medium">Provider Configuration</h3>
              
              <div>
                <label className="text-white/50 text-xs block mb-1.5">Provider</label>
                <select 
                  value={provider} 
                  onChange={e => { 
                    setProvider(e.target.value)
                    const models = getModelsForProvider(e.target.value)
                    if (models.length > 0) setModelId(models[0])
                  }}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none focus:border-white/20"
                >
                  {PROVIDERS.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-white/50 text-xs block mb-1.5">Model ID</label>
                {getModelsForProvider(provider).length > 0 ? (
                  <select 
                    value={modelId} 
                    onChange={e => setModelId(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none focus:border-white/20"
                  >
                    {getModelsForProvider(provider).map(m => (
                      <option key={m} value={m}>{m.split('/').pop()}</option>
                    ))}
                  </select>
                ) : (
                  <input 
                    value={modelId} 
                    onChange={e => setModelId(e.target.value)} 
                    placeholder="custom-model-id"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none focus:border-white/20"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/50 text-xs block mb-1.5">
                    Temperature: <span className="text-white/70">{temperature}</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={temperature} 
                    onChange={e => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-[#e8ff47]"
                  />
                  <div className="flex justify-between text-[10px] text-white/30 mt-1">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>
                <div>
                  <label className="text-white/50 text-xs block mb-1.5">Max Tokens</label>
                  <input 
                    type="number" 
                    value={maxTokens} 
                    onChange={e => setMaxTokens(parseInt(e.target.value) || 8192)}
                    min="256"
                    max="200000"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none focus:border-white/20"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#111] border border-white/8 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white/80 font-medium">Sync to Runtime</h3>
                  <p className="text-white/40 text-xs mt-0.5">Push configuration changes to Hermes VPS</p>
                </div>
                {getSyncBadge(agent.sync_status)}
              </div>

              {syncError && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-xs">
                  {syncError}
                </div>
              )}

              <button 
                onClick={syncAgent}
                disabled={syncing}
                className="w-full py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-50 text-black font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {syncing ? (
                  <>
                    <span className="animate-spin">⟳</span>
                    Syncing to Hermes...
                  </>
                ) : (
                  'Sync to Hermes'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-white/5">
        <Link href="/dashboard/agents" className="px-5 py-2.5 text-white/40 text-sm hover:text-white/70 transition-colors">
          Cancel
        </Link>
        <button onClick={saveConfig} disabled={saving}
          className="px-6 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-50 text-black font-bold text-sm rounded-xl transition-colors">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
