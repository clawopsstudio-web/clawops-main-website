'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Column names match user_connections table (RLS-protected, accessed via /api/tools/connections)
interface UserConnection {
  id: string
  app_name: string
  connected: boolean
  connected_account_id: string | null
  connected_at: string | null
}

const FEATURED_TOOLS = [
  { id: 'gmail',    name: 'Gmail',    cat: 'Email',   color: '#EA4335', composioApp: 'GMAIL' },
  { id: 'github',   name: 'GitHub',   cat: 'Dev',     color: '#ffffff', composioApp: 'GITHUB' },
  { id: 'hubspot',  name: 'HubSpot', cat: 'CRM',    color: '#FF7A59', composioApp: 'HUBSPOT' },
  { id: 'notion',   name: 'Notion',   cat: 'Docs',    color: '#ffffff', composioApp: 'NOTION' },
]

const MESSAGING_TOOLS = [
  {
    id: 'telegram',
    name: 'Telegram',
    desc: 'Agents send/receive messages here',
    color: '#26A5E4',
    composioApp: 'TELEGRAM',
    howToGet: '1. Open Telegram\n2. Message @BotFather\n3. Type /newbot\n4. Copy the bot token',
    type: 'token',
    placeholder: 'e.g. 123456789:ABC...',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    desc: 'Receive alerts and notifications',
    color: '#25D366',
    composioApp: 'WHATSAPP',
    howToGet: '1. Get WhatsApp Business API from Meta for Developers\n2. Paste your access token here',
    type: 'token',
    placeholder: 'Paste WhatsApp Business API token',
  },
  {
    id: 'slack',
    name: 'Slack',
    desc: 'Post updates to Slack channels',
    color: '#4A154B',
    composioApp: 'SLACK',
    howToGet: '1. Open Slack workspace settings\n2. Go to Apps → Incoming Webhooks\n3. Create webhook → copy URL',
    type: 'url',
    placeholder: 'https://hooks.slack.com/...',
  },
  {
    id: 'discord',
    name: 'Discord',
    desc: 'Send alerts to Discord channels',
    color: '#5865F2',
    composioApp: 'DISCORD',
    howToGet: '1. Open Discord server\n2. Channel settings → Integrations → Webhooks\n3. Create webhook → copy URL',
    type: 'url',
    placeholder: 'https://discord.com/api/webhooks/...',
  },
]

interface ToolCardProps {
  tool: typeof FEATURED_TOOLS[0]
  connected: boolean
  connectedAt: string | null
  onConnect: (toolId: string) => void
  loading: string | null
}

function FeaturedToolCard({ tool, connected, connectedAt, onConnect, loading }: ToolCardProps) {
  const isLoading = loading === tool.id
  return (
    <div className="bg-[#111] border border-white/7 rounded-xl p-4 hover:border-white/15 transition-all">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: tool.color + '22' }}>
        <span className="text-white/80 text-sm font-bold">{tool.name[0]}</span>
      </div>
      <p className="text-white font-semibold text-xs mb-0.5">{tool.name}</p>
      <p className="text-white/30 text-[10px] mb-3">{tool.cat}</p>

      {connected ? (
        <div className="space-y-1.5">
          <div className="text-[10px] px-2 py-1 rounded-lg text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Connected
          </div>
          {connectedAt && (
            <p className="text-white/20 text-[9px] text-center">
              Since {new Date(connectedAt).toLocaleDateString()}
            </p>
          )}
          <button
            onClick={() => onConnect(tool.id)}
            disabled={isLoading}
            className="w-full text-[10px] text-white/30 hover:text-red-400 transition-colors py-0.5"
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => onConnect(tool.id)}
          disabled={isLoading}
          className="w-full text-[10px] px-2 py-1.5 rounded-lg text-center bg-white/8 hover:bg-white/12 text-white/50 hover:text-white/80 transition-colors border border-white/8"
        >
          {isLoading ? 'Connecting...' : 'Connect'}
        </button>
      )}
    </div>
  )
}

interface MessagingCardProps {
  tool: typeof MESSAGING_TOOLS[0]
  connected: boolean
  connectedAt: string | null
  onConnect: (toolId: string, value: string) => void
  loading: string | null
}

function MessagingCard({ tool, connected, connectedAt, onConnect, loading }: MessagingCardProps) {
  const isLoading = loading === tool.id
  const [showHow, setShowHow] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleSave = () => {
    if (!inputValue.trim()) return
    onConnect(tool.id, inputValue.trim())
  }

  return (
    <div className="bg-[#111] border border-white/7 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm" style={{ background: tool.color + '22', color: tool.color }}>
          {tool.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-white font-semibold text-sm">{tool.name}</p>
            {connected && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Connected</span>
            )}
          </div>
          <p className="text-white/30 text-xs">{tool.desc}</p>
        </div>
      </div>

      {/* Input + button */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={tool.placeholder}
          className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-white/60 text-xs focus:outline-none focus:border-white/20"
          disabled={isLoading}
        />
        <button
          onClick={handleSave}
          disabled={!inputValue.trim() || isLoading}
          className="px-4 py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-30 text-black font-bold text-xs rounded-lg shrink-0 transition-colors"
        >
          {isLoading ? '...' : 'Save'}
        </button>
      </div>

      {/* How to get */}
      <button onClick={() => setShowHow(h => !h)} className="text-white/20 hover:text-white/40 text-[10px] transition-colors flex items-center gap-1">
        <span>{showHow ? '▲' : '▶'}</span> How to get this
      </button>
      {showHow && (
        <pre className="mt-2 text-white/30 text-[10px] leading-relaxed font-mono bg-[#0d0d0d] rounded-lg p-3 border border-white/5 whitespace-pre-wrap">
          {tool.howToGet}
        </pre>
      )}
    </div>
  )
}

export default function ToolsPage() {
  const [userId, setUserId] = useState('')
  const [connections, setConnections] = useState<Record<string, UserConnection>>({})
  const [loading, setLoading] = useState<string | null>(null)

  // Load connections via API route (bypasses RLS)
  useEffect(() => {
    createClient().auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id ?? ''
      setUserId(uid)
      if (!uid) return

      const res = await fetch('/api/tools/connections')
      if (res.ok) {
        const json = await res.json()
        const map: Record<string, UserConnection> = {}
        for (const row of (json.connections as UserConnection[])) {
          map[row.app_name.toLowerCase()] = row
        }
        setConnections(map)
      }
    })
  }, [])

  // ── Featured tool: Composio OAuth ──
  const handleFeaturedConnect = async (toolId: string) => {
    const tool = FEATURED_TOOLS.find(t => t.id === toolId)
    if (!tool) return
    const existing = connections[toolId]

    if (existing?.connected) {
      setLoading(toolId)
      await fetch('/api/tools/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_name: tool.composioApp, connected: false }),
      })
      setConnections(prev => {
        const n = { ...prev }
        if (n[toolId]) n[toolId] = { ...n[toolId]!, connected: false }
        return n
      })
      setLoading(null)
      return
    }

    setLoading(toolId)
    try {
      const res = await fetch('/api/composio/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName: tool.composioApp }),
      })
      const data = await res.json()
      if (data.connectUrl) {
        window.location.href = data.connectUrl
      } else if (data.error) {
        alert('Connection failed: ' + data.error)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  // ── Messaging tool: save token directly ──
  const handleMessagingConnect = async (toolId: string, value: string) => {
    const tool = MESSAGING_TOOLS.find(t => t.id === toolId)
    if (!tool || !userId) return
    setLoading(toolId)
    try {
      const res = await fetch('/api/tools/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_name: tool.composioApp,
          connected: true,
          connected_account_id: value,
          connected_at: new Date().toISOString(),
        }),
      })
      if (res.ok) {
        const json = await res.json()
        setConnections(prev => ({ ...prev, [toolId]: json.connection }))
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-white font-black text-lg">Tools</h1>
        <p className="text-white/30 text-xs mt-1">Connect your apps. Agents use these to work on your behalf.</p>
      </div>

      {/* Featured */}
      <div>
        <div className="mb-3">
          <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">Featured Integrations</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {FEATURED_TOOLS.map(tool => (
            <FeaturedToolCard
              key={tool.id}
              tool={tool}
              connected={connections[tool.id]?.connected ?? false}
              connectedAt={connections[tool.id]?.connected_at ?? null}
              onConnect={handleFeaturedConnect}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Messaging */}
      <div>
        <div className="mb-3">
          <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">Messaging Channels</span>
        </div>
        <div className="space-y-3 max-w-xl">
          {MESSAGING_TOOLS.map(tool => (
            <MessagingCard
              key={tool.id}
              tool={tool}
              connected={connections[tool.id]?.connected ?? false}
              connectedAt={connections[tool.id]?.connected_at ?? null}
              onConnect={handleMessagingConnect}
              loading={loading}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
