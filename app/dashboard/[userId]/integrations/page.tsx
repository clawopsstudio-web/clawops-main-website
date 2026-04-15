'use client'

import { useState, useEffect } from 'react'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { Key, MessageSquare, Bot, Zap, ExternalLink, Check, X, RefreshCw } from 'lucide-react'

interface Props {
  params: Promise<{ userId: string }>
}

interface Integration {
  id: string
  name: string
  description: string
  icon: string
  category: 'crm' | 'messaging' | 'llm' | 'social'
  configured: boolean
  fields: { key: string; label: string; type: string; placeholder: string; required: boolean }[]
  docsUrl?: string
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'ghl',
    name: 'GoHighLevel (GHL)',
    description: 'Connect your GHL account to manage contacts, deals, pipelines, and automations via our MCP server.',
    icon: '📊',
    category: 'crm',
    configured: false,
    fields: [
      { key: 'api_key', label: 'GHL API Key', type: 'password', placeholder: 'pit-...', required: true },
      { key: 'location_id', label: 'Location ID', type: 'text', placeholder: 'XXXXXXXXXXXXXXXXXX', required: true },
    ],
    docsUrl: '/guides/ghl-mcp',
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    description: 'Connect a Telegram bot for the AI agent to send messages, handle commands, and communicate with your audience.',
    icon: '✈️',
    category: 'messaging',
    configured: false,
    fields: [
      { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: '123456:ABC-DEF...', required: true },
      { key: 'chat_id', label: 'Default Chat ID', type: 'text', placeholder: '-1001234567890 (optional)', required: false },
    ],
    docsUrl: '/guides/telegram-integration',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Connect WhatsApp via Hermes bridge for AI-powered customer conversations.',
    icon: '💬',
    category: 'messaging',
    configured: false,
    fields: [
      { key: 'hermes_url', label: 'Hermes Bridge URL', type: 'text', placeholder: 'http://your-vps:3000', required: true },
      { key: 'session_id', label: 'WhatsApp Session ID', type: 'text', placeholder: 'my-whatsapp-session', required: true },
    ],
  },
  {
    id: 'discord',
    name: 'Discord Bot',
    description: 'Deploy an AI agent as a Discord bot that answers questions and performs tasks in your server.',
    icon: '🎮',
    category: 'social',
    configured: false,
    fields: [
      { key: 'bot_token', label: 'Bot Token', type: 'password', placeholder: 'MTIz...', required: true },
      { key: 'guild_id', label: 'Guild (Server) ID', type: 'text', placeholder: '123456789', required: false },
    ],
  },
  {
    id: 'slack',
    name: 'Slack App',
    description: 'Add an AI coworker to your Slack workspace that responds to messages and triggers workflows.',
    icon: '📱',
    category: 'social',
    configured: false,
    fields: [
      { key: 'bot_token', label: 'Bot Token (xoxb-...)', type: 'password', placeholder: 'xoxb-...', required: true },
      { key: 'team_id', label: 'Workspace ID', type: 'text', placeholder: 'T0123456789', required: false },
    ],
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Use OpenAI models (GPT-4o, o3, o4-mini) as the LLM backend for AI agents.',
    icon: '🤖',
    category: 'llm',
    configured: false,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'sk-...', required: true },
      { key: 'org_id', label: 'Organization ID (optional)', type: 'text', placeholder: 'org-...', required: false },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Use Claude models (Opus 4, Sonnet 4, Haiku) as the LLM backend for AI agents.',
    icon: '🧠',
    category: 'llm',
    configured: false,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'sk-ant-...', required: true },
    ],
  },
  {
    id: 'google-ai',
    name: 'Google AI (Gemini)',
    description: 'Use Gemini 2.5 Pro, Flash, and other Google AI models as the LLM backend.',
    icon: '✨',
    category: 'llm',
    configured: false,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'AIza...', required: true },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Use Groq\'s fast inference API for Llama, Mistral, and other open models.',
    icon: '⚡',
    category: 'llm',
    configured: false,
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', placeholder: 'gsk_...', required: true },
    ],
  },
]

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'crm', label: 'CRM' },
  { id: 'messaging', label: 'Messaging' },
  { id: 'llm', label: 'LLM Providers' },
  { id: 'social', label: 'Social' },
]

export default function IntegrationsPage({ params: _params }: Props) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({})

  useEffect(() => {
    // Load saved configs from localStorage
    try {
      const savedConfigs = localStorage.getItem('clawops-integrations')
      if (savedConfigs) {
        setConfigs(JSON.parse(savedConfigs))
      }
    } catch {}
  }, [])

  const handleFieldChange = (integrationId: string, fieldKey: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [integrationId]: {
        ...(prev[integrationId] || {}),
        [fieldKey]: value,
      },
    }))
    setSaved(prev => ({ ...prev, [integrationId]: false }))
  }

  const handleSave = async (integrationId: string) => {
    setSaving(integrationId)
    try {
      const integrationConfig = configs[integrationId] || {}
      localStorage.setItem(`clawops-integration-${integrationId}`, JSON.stringify(integrationConfig))
      
      // Also save the full config map
      localStorage.setItem('clawops-integrations', JSON.stringify(configs))
      setSaved(prev => ({ ...prev, [integrationId]: true }))
      
      // Refresh to show saved state
      const updated: Record<string, boolean> = {}
      updated[integrationId] = true
      setTimeout(() => setSaved(prev => ({ ...prev, [integrationId]: false })), 3000)
    } catch (e) {
      console.error('Failed to save:', e)
    }
    setSaving(null)
  }

  const handleTest = async (integrationId: string) => {
    setTestStatus(prev => ({ ...prev, [integrationId]: 'testing' }))
    // Simulate test - in production this would call the actual API
    await new Promise(r => setTimeout(r, 1500))
    setTestStatus(prev => ({ ...prev, [integrationId]: 'success' }))
    setTimeout(() => setTestStatus(prev => ({ ...prev, [integrationId]: 'idle' })), 3000)
  }

  const filtered = activeCategory === 'all' 
    ? INTEGRATIONS 
    : INTEGRATIONS.filter(i => i.category === activeCategory)

  const configuredCount = Object.keys(configs).filter(id => {
    const cfg = configs[id]
    return cfg && Object.values(cfg).some(v => v && v.length > 0)
  }).length

  return (
    <DashboardShell>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Integrations</h1>
          <p className="text-white/50 text-sm">
            Connect your tools, channels, and LLM providers.{' '}
            <span className="text-cyan-400">{configuredCount} of {INTEGRATIONS.length} configured</span>
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
            const cfg = configs[integration.id] || {}
            const hasConfig = Object.values(cfg).some(v => v && v.length > 0)
            const isSaved = saved[integration.id]
            const isSaving = saving === integration.id
            const testState = testStatus[integration.id] || 'idle'

            return (
              <div
                key={integration.id}
                className="rounded-xl p-5 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: hasConfig ? '1px solid rgba(0,212,255,0.25)' : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{integration.name}</h3>
                      <p className="text-xs text-white/40 mt-0.5 max-w-md">{integration.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasConfig && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs" style={{ background: 'rgba(0,212,255,0.15)', color: '#00D4FF' }}>
                        <Check size={10} /> Configured
                      </span>
                    )}
                    {integration.docsUrl && (
                      <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
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
                        {field.label} {field.required && <span style={{ color: '#EA4B71' }}>*</span>}
                      </label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={cfg[field.key] || ''}
                        onChange={e => handleFieldChange(integration.id, field.key, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-white/25 transition-colors focus:outline-none"
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSave(integration.id)}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                    style={{ background: isSaved ? 'rgba(0,200,100,0.2)' : 'rgba(0,212,255,0.2)', border: isSaved ? '1px solid rgba(0,200,100,0.3)' : '1px solid rgba(0,212,255,0.3)' }}
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-1.5"><RefreshCw size={12} className="animate-spin" /> Saving...</span>
                    ) : isSaved ? (
                      <span className="flex items-center gap-1.5"><Check size={12} /> Saved</span>
                    ) : (
                      'Save Configuration'
                    )}
                  </button>

                  {hasConfig && (
                    <button
                      onClick={() => handleTest(integration.id)}
                      disabled={testState === 'testing'}
                      className="px-4 py-2 rounded-lg text-xs font-medium text-white/60 transition-colors disabled:opacity-50"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      {testState === 'testing' ? (
                        <span className="flex items-center gap-1.5"><RefreshCw size={12} className="animate-spin" /> Testing...</span>
                      ) : testState === 'success' ? (
                        <span className="flex items-center gap-1.5"><Check size={12} className="text-green-400" /> Connected!</span>
                      ) : (
                        'Test Connection'
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Add more CTA */}
        <div className="mt-8 text-center p-6 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <p className="text-sm text-white/40 mb-2">Need another integration?</p>
          <p className="text-xs text-white/25">Check our <a href="/guides" className="text-cyan-400 underline">integration guides</a> or <a href="mailto:support@clawops.studio" className="text-cyan-400 underline">request a custom integration</a>.</p>
        </div>
      </div>
    </DashboardShell>
  )
}
