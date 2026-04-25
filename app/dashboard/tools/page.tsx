'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Search } from 'lucide-react'

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

interface ComposioApp {
  name: string
  description?: string
  categories?: string[]
  logo?: string
  key?: string
}

const CATEGORIES = ['All', 'Communication', 'CRM', 'Dev', 'Data', 'Productivity']

function BrowseModal({
  onClose,
  onConnect,
  loading,
}: {
  onClose: () => void
  onConnect: (composioApp: string) => void
  loading: string | null
}) {
  const [apps, setApps] = useState<ComposioApp[]>([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [apiError, setApiError] = useState(false)

  useEffect(() => {
    const fetchApps = async () => {
      setLoadingApps(true)
      try {
        const res = await fetch(
          'https://api.composio.dev/v2/tools/apps?limit=100',
          { headers: { 'x-api-key': process.env.NEXT_PUBLIC_COMPOSIO_API_KEY ?? '' } }
        )
        if (!res.ok) throw new Error('API error')
        const data = await res.json()
        const items: ComposioApp[] = data.items ?? data.apps ?? []
        setApps(items)
      } catch {
        setApiError(true)
        // Fallback to featured tools
        setApps(FEATURED_TOOLS.map(t => ({
          name: t.name,
          description: `Connect ${t.name} to enable agent actions`,
          categories: [t.cat],
          key: t.id,
        })))
      } finally {
        setLoadingApps(false)
      }
    }
    fetchApps()
  }, [])

  const filtered = apps.filter(app => {
    const matchSearch = search === '' ||
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.description ?? '').toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' ||
      (app.categories ?? []).some(c => c.toLowerCase().includes(category.toLowerCase()))
    return matchSearch && matchCat
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/7">
          <div>
            <h2 className="text-white font-bold text-base">Browse Integrations</h2>
            <p className="text-white/30 text-xs mt-0.5">
              {loadingApps ? 'Loading...' : `${apps.length}+ tools available`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search + Filters */}
        <div className="px-6 pt-4 pb-3 space-y-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white/70 text-xs placeholder:text-white/25 focus:outline-none focus:border-white/20"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 text-[10px] font-semibold rounded-full transition-colors ${
                  category === cat
                    ? 'bg-[#e8ff47] text-black'
                    : 'bg-white/7 text-white/40 hover:text-white/70'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* App grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {loadingApps ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-[#111] border border-white/7 rounded-xl p-4 animate-pulse">
                  <div className="w-8 h-8 bg-white/10 rounded-lg mb-3" />
                  <div className="h-3 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-2 bg-white/10 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-white/30 text-sm">No tools found</p>
              <p className="text-white/15 text-xs mt-1">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filtered.map((app) => {
                const appKey = app.key ?? app.name.toLowerCase().replace(/[^a-z0-9]/g, '')
                const isLoading = loading === appKey
                const cat = app.categories?.[0] ?? 'Integration'
                return (
                  <div
                    key={appKey}
                    className="bg-[#111] border border-white/7 rounded-xl p-4 hover:border-white/15 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center mb-3">
                      <span className="text-white/70 text-sm font-bold">
                        {app.name[0]}
                      </span>
                    </div>
                    <p className="text-white font-semibold text-xs mb-0.5 truncate">{app.name}</p>
                    <p className="text-white/25 text-[10px] mb-2 truncate">{cat}</p>
                    {app.description && (
                      <p className="text-white/20 text-[9px] mb-3 leading-relaxed line-clamp-2">
                        {app.description}
                      </p>
                    )}
                    <button
                      onClick={() => onConnect(app.name.toUpperCase())}
                      disabled={isLoading}
                      className="w-full text-[10px] px-2 py-1.5 rounded-lg text-center bg-white/8 hover:bg-white/12 text-white/50 hover:text-white/80 transition-colors border border-white/8 disabled:opacity-40"
                    >
                      {isLoading ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
          {apiError && (
            <p className="text-center text-[10px] text-white/20 mt-3">
              Could not load all tools — showing available connections
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

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
  const [showBrowse, setShowBrowse] = useState(false)

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

  // Handle OAuth redirect ?connected=true param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('connected') === 'true') {
      // Refetch connections after OAuth redirect
      fetch('/api/tools/connections')
        .then(res => res.json())
        .then(json => {
          const map: Record<string, UserConnection> = {}
          for (const row of (json.connections as UserConnection[])) {
            map[row.app_name.toLowerCase()] = row
          }
          setConnections(map)
        })
        .catch(console.error)
      // Clean URL without reload
      window.history.replaceState({}, '', window.location.pathname)
    }
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
        <div className="mb-3 flex items-center gap-2">
          <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">Featured Integrations</span>
          <button
            onClick={() => setShowBrowse(true)}
            className="text-[10px] px-2.5 py-1 rounded-full bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold transition-colors"
          >
            + Browse 850+ Tools
          </button>
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

      {showBrowse && (
        <BrowseModal
          onClose={() => setShowBrowse(false)}
          onConnect={handleFeaturedConnect}
          loading={loading}
        />
      )}
    </div>
  )
}
