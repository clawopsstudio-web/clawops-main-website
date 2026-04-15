'use client'

import { useState, useEffect } from 'react'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { ExternalLink, Check, X, RefreshCw, Loader2 } from 'lucide-react'

const INTEGRATIONS = [
  {
    id: 'ghl',
    name: 'GoHighLevel (GHL)',
    description: 'Connect your GHL account to manage contacts, deals, pipelines, and automations via our MCP server.',
    icon: '📊',
    category: 'crm' as const,
    fields: [
      { key: 'api_key', label: 'GHL API Key', type: 'password', placeholder: 'pit-...', required: true },
      { key: 'location_id', label: 'Location ID', type: 'text', placeholder: 'XXXXXXXXXXXXXXXXXX', required: true },
    ],
    docsUrl: '/guides/ghl-mcp',
    testFn: async (creds: Record<string, string>) => {
      const res = await fetch(`https://services.leadconnectorhq.com/mcp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'tools/list',
          id: 1,
          params: { authorization: `Bearer ${creds.api_key}` },
        }),
      })
      return res.ok
    },
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    description: 'Connect a Telegram bot for the AI agent to send messages, handle commands, and communicate with your audience.',
    icon: '✈️',
    category: 'messaging' as const,
    fields: [
      { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: '123456:ABC-DEF...', required: true },
      { key: 'chat_id', label: 'Default Chat ID', type: 'text', placeholder: '-1001234567890 (optional)', required: false },
    ],
    docsUrl: '/guides/telegram-integration',
    testFn: async (creds: Record<string, string>) => {
      const res = await fetch(`https://api.telegram.org/bot${creds.bot_token}/getMe`)
      return res.ok
    },
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Connect WhatsApp via Hermes bridge for AI-powered customer conversations.',
    icon: '💬',
    category: 'messaging' as const,
    fields: [
      { key: 'hermes_url', label: 'Hermes Bridge URL', type: 'text', placeholder: 'http://your-vps:3000', required: true },
      { key: 'session_id', label: 'WhatsApp Session ID', type: 'text', placeholder: 'my-whatsapp-session', required: true },
    ],
    testFn: async (creds: Record<string, string>) => {
      const res = await fetch(`${creds.hermes_url}/health`)
      return res.ok
    },
  },
  {
    id: 'discord',
    name: 'Discord Bot',
    description: 'Deploy an AI agent as a Discord bot that answers questions and performs tasks in your server.',
    icon: '🎮',
    category: 'social' as const,
    fields: [
      { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: 'MTIz...', required: true },
      { key: 'guild_id', label: 'Guild (Server) ID', type: 'text', placeholder: '123456789', required: false },
    ],
    testFn: async (creds: Record<string, string>) => {
      const res = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bot ${creds.bot_token}` },
      })
      return res.ok
    },
  },
  {
    id: 'slack',
    name: 'Slack App',
    description: 'Add an AI coworker to your Slack workspace that responds to messages and triggers workflows.',
    icon: '📱',
    category: 'social' as const,
    fields: [
      { key: 'bot_token', label: 'Bot Token (xoxb-...)', type: 'password', placeholder: 'xoxb-...', required: true },
      { key: 'team_id', label: 'Workspace ID', type: 'text', placeholder: 'T0123456789', required: false },
    ],
    testFn: async (creds: Record<string, string>) => {
      const res = await fetch('https://slack.com/api/auth.test', {
        headers: { Authorization: `Bearer ${creds.bot_token}` },
      })
      if (!res.ok) return false
      const data = await res.json()
      return data.ok === true
    },
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Use OpenAI models (GPT-4o, o3, o4-mini) as the LLM backend for AI agents.',
    icon: '🤖',
    category: 'llm' as const,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'sk-...', required: true },
      { key: 'org_id', label: 'Organization ID (optional)', type: 'text', placeholder: 'org-...', required: false },
    ],
    testFn: async (creds: Record<string, string>) => {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${creds.api_key}` },
      })
      return res.ok
    },
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Use Claude models (Opus 4, Sonnet 4, Haiku) as the LLM backend for AI agents.',
    icon: '🧠',
    category: 'llm' as const,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'sk-ant-...', required: true },
    ],
    testFn: async (creds: Record<string, string>) => {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': creds.api_key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 1, messages: [] }),
      })
      return res.status === 400 // Anthropic returns 400 for empty messages but validates the key
    },
  },
  {
    id: 'google-ai',
    name: 'Google AI (Gemini)',
    description: 'Use Gemini 2.5 Pro, Flash, and other Google AI models as the LLM backend.',
    icon: '✨',
    category: 'llm' as const,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'AIza...', required: true },
    ],
    testFn: async (creds: Record<string, string>) => {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${creds.api_key}`
      )
      return res.ok
    },
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Use Groq\'s fast inference API for Llama, Mistral, and other open models.',
    icon: '⚡',
    category: 'llm' as const,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'gsk_...', required: true },
    ],
    testFn: async (creds: Record<string, string>) => {
      const res = await fetch('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${creds.api_key}` },
      })
      return res.ok
    },
  },
]

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'crm', label: 'CRM' },
  { id: 'messaging', label: 'Messaging' },
  { id: 'llm', label: 'LLM Providers' },
  { id: 'social', label: 'Social' },
]

export default function IntegrationsPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  // configured = integrationId → credentials that are saved in DB
  const [configured, setConfigured] = useState<Record<string, Record<string, string>>>({})
  // editing = integrationId → current form values (may be unsaved)
  const [editing, setEditing] = useState<Record<string, Record<string, string>>>({})
  // loading state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({})
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Load saved configs from Supabase
  useEffect(() => {
    fetch('/api/integrations')
      .then(r => r.json())
      .then(data => {
        if (data.apiKeys || data.channels) {
          // Merge LLM api_keys and messaging channels into one map
          const saved: Record<string, Record<string, string>> = {}
          if (data.apiKeys) {
            for (const [provider, val] of Object.entries(data.apiKeys as Record<string, { key: string }>)) {
              saved[provider] = { api_key: val.key }
            }
          }
          if (data.channels) {
            for (const [channel, creds] of Object.entries(data.channels as Record<string, Record<string, string>>)) {
              saved[channel] = creds
            }
          }
          setConfigured(saved)
          setEditing(saved)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const notify = (type: 'success' | 'error', msg: string) => {
    setNotification({ type, msg })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleFieldChange = (id: string, key: string, value: string) => {
    setEditing(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [key]: value },
    }))
  }

  const handleSave = async (id: string) => {
    const creds = editing[id]
    if (!creds) return

    // Check required fields
    const integration = INTEGRATIONS.find(i => i.id === id)
    const missing = integration?.fields
      .filter(f => f.required && !creds[f.key])
      .map(f => f.label)

    if (missing?.length) {
      notify('error', `Missing: ${missing.join(', ')}`)
      return
    }

    setSaving(id)
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integrationId: id, credentials: creds }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')

      // Update configured state
      setConfigured(prev => ({ ...prev, [id]: { ...creds } }))
      notify('success', `${integration?.name} saved successfully`)
    } catch (e: any) {
      notify('error', e.message)
    } finally {
      setSaving(null)
    }
  }

  const handleTest = async (id: string) => {
    const creds = configured[id]
    const integration = INTEGRATIONS.find(i => i.id === id)
    if (!creds || !integration?.testFn) {
      // First save, then test
      await handleSave(id)
      if (configured[id]) {
        await handleTestAfterSave(id, integration!)
      }
      return
    }
    await handleTestAfterSave(id, integration)
  }

  const handleTestAfterSave = async (id: string, integration: typeof INTEGRATIONS[0]) => {
    const creds = configured[id]
    if (!creds || !integration?.testFn) return

    setTestStatus(prev => ({ ...prev, [id]: 'testing' }))
    try {
      const ok = await integration.testFn(creds)
      setTestStatus(prev => ({ ...prev, [id]: ok ? 'success' : 'error' }))
      if (ok) notify('success', `${integration.name} connection verified`)
    } catch {
      setTestStatus(prev => ({ ...prev, [id]: 'error' }))
    }
    setTimeout(() => setTestStatus(prev => ({ ...prev, [id]: 'idle' })), 3000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`Remove ${INTEGRATIONS.find(i => i.id === id)?.name}?`)) return
    try {
      await fetch(`/api/integrations?integrationId=${id}`, { method: 'DELETE' })
      setConfigured(prev => { const n = { ...prev }; delete n[id]; return n })
      setEditing(prev => { const n = { ...prev }; delete n[id]; return n })
      notify('success', 'Integration removed')
    } catch {
      notify('error', 'Failed to remove')
    }
  }

  const filtered = activeCategory === 'all'
    ? INTEGRATIONS
    : INTEGRATIONS.filter(i => i.category === activeCategory)

  const configuredCount = Object.keys(configured).filter(id => {
    const cfg = configured[id]
    return cfg && Object.values(cfg).some(v => v && v.length > 0)
  }).length

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Notification */}
        {notification && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-green-500/15 border border-green-500/30 text-green-400'
              : 'bg-red-500/15 border border-red-500/30 text-red-400'
          }`}>
            {notification.type === 'success' ? <Check size={16} /> : <X size={16} />}
            {notification.msg}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Integrations</h1>
          <p className="text-white/50 text-sm">
            Connect your tools, channels, and LLM providers.{' '}
            {configuredCount > 0 && (
              <span className="text-cyan-400">{configuredCount} of {INTEGRATIONS.length} configured</span>
            )}
          </p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeCategory === cat.id ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.05)',
                color: activeCategory === cat.id ? '#00D4FF' : 'rgba(255,255,255,0.5)',
                border: activeCategory === cat.id ? '1px solid rgba(0,212,255,0.3)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Integration cards */}
        <div className="space-y-4">
          {filtered.map(integration => {
            const cfg = configured[integration.id] || {}
            const edit = editing[integration.id] || {}
            const hasConfig = Object.values(cfg).some(v => v && v.length > 0)
            const isSaving = saving === integration.id
            const testState = testStatus[integration.id] || 'idle'

            return (
              <div
                key={integration.id}
                className="rounded-xl p-5 transition-all"
                style={{
                  background: hasConfig ? 'rgba(0,212,255,0.04)' : 'rgba(255,255,255,0.02)',
                  border: hasConfig ? '1px solid rgba(0,212,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{integration.name}</h3>
                      <p className="text-xs text-white/40 mt-0.5 max-w-md">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {hasConfig && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ background: 'rgba(0,212,255,0.15)', color: '#00D4FF' }}>
                        <Check size={10} /> Connected
                      </span>
                    )}
                    {integration.docsUrl && (
                      <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Fields */}
                <div className="grid gap-3 mb-4">
                  {integration.fields.map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-medium text-white/60 mb-1.5">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-0.5">*</span>}
                      </label>
                      <input
                        type={field.type}
                        value={edit[field.key] || ''}
                        onChange={e => handleFieldChange(integration.id, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 border transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          borderColor: 'rgba(255,255,255,0.08)',
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSave(integration.id)}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-50"
                    style={{
                      background: 'linear-gradient(135deg, #00D4FF, #6600FF)',
                      boxShadow: '0 0 15px rgba(0,212,255,0.2)',
                    }}
                  >
                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>

                  {hasConfig && (
                    <>
                      <button
                        onClick={() => handleTest(integration.id)}
                        disabled={testState === 'testing'}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                        style={{
                          background: testState === 'success' ? 'rgba(34,197,94,0.15)' : testState === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                          color: testState === 'success' ? '#22c55e' : testState === 'error' ? '#ef4444' : 'rgba(255,255,255,0.5)',
                          border: `1px solid ${testState === 'success' ? 'rgba(34,197,94,0.3)' : testState === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
                        }}
                      >
                        {testState === 'testing' ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : testState === 'success' ? (
                          <Check size={12} />
                        ) : testState === 'error' ? (
                          <X size={12} />
                        ) : (
                          <RefreshCw size={12} />
                        )}
                        {testState === 'testing' ? 'Testing...' : testState === 'success' ? 'Connected' : testState === 'error' ? 'Failed' : 'Test'}
                      </button>

                      <button
                        onClick={() => handleDelete(integration.id)}
                        className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400/60 hover:text-red-400 transition-colors"
                        style={{ border: '1px solid rgba(239,68,68,0.15)' }}
                      >
                        <X size={12} />
                        Remove
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardShell>
  )
}
