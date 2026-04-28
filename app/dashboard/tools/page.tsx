'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  X, Search, RefreshCw, AlertCircle, CheckCircle2, Loader2,
  Zap, Globe, Puzzle, Link2, ChevronRight
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserConnection {
  id: string
  app_name: string
  connected: boolean
  connected_account_id: string | null
  connected_at: string | null
}

interface CatalogTool {
  id: string
  slug: string
  name: string
  category: string
  description: string
  icon: string
  isFeatured: boolean
  color?: string
}

interface CatalogResponse {
  tools: CatalogTool[]
  total: number
  source: 'composio' | 'fallback'
  categories: string[]
}

// ─── Category color map ───────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  'CRM':         '#FF7A59',
  'Email':       '#EA4335',
  'Dev':         '#6B7280',
  'Docs':        '#ffffff',
  'Messaging':   '#26A5E4',
  'Productivity':'#4285F4',
  'Payments':    '#635BFF',
  'Social':      '#1DA1F2',
  'Support':     '#E8662C',
  'Database':    '#F97316',
  'Cloud':       '#FF9900',
  'E-Commerce':  '#96BF48',
  'Project Mgmt':'#7B61FF',
  'SMS':         '#10B981',
  'Marketing':   '#EC4899',
  'Analytics':   '#3B82F6',
  'Integration': '#8B5CF6',
}

// ─── Featured tool definitions ────────────────────────────────────────────────

const FEATURED_TOOLS = [
  { id: 'gmail',    name: 'Gmail',     cat: 'Email',       color: '#EA4335', bg: '#EA4335', composioApp: 'GMAIL',    icon: '📧' },
  { id: 'github',   name: 'GitHub',    cat: 'Dev',         color: '#ffffff', bg: '#24292e', composioApp: 'GITHUB',   icon: '🐙' },
  { id: 'hubspot',  name: 'HubSpot',   cat: 'CRM',         color: '#FF7A59', bg: '#FF7A59', composioApp: 'HUBSPOT',  icon: '🔶' },
  { id: 'notion',   name: 'Notion',    cat: 'Docs',        color: '#ffffff', bg: '#1a1a1a', composioApp: 'NOTION',   icon: '📓' },
  { id: 'slack',    name: 'Slack',     cat: 'Messaging',   color: '#4A154B', bg: '#4A154B', composioApp: 'SLACK',    icon: '💬' },
  { id: 'stripe',   name: 'Stripe',    cat: 'Payments',     color: '#635BFF', bg: '#635BFF', composioApp: 'STRIPE',   icon: '💳' },
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

// ─── BrowseModal ──────────────────────────────────────────────────────────────

type BrowseTab = 'featured' | 'all' | 'installed'

function BrowseModal({
  connections,
  onClose,
  onConnect,
  loading,
}: {
  connections: Record<string, UserConnection>
  onClose: () => void
  onConnect: (composioApp: string) => void
  loading: string | null
}) {
  const [tab, setTab] = useState<BrowseTab>('all')
  const [tools, setTools] = useState<CatalogTool[]>([])
  const [allCategories, setAllCategories] = useState<string[]>(['All'])
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading')
  const [source, setSource] = useState<'composio' | 'fallback'>('fallback')
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [retryCount, setRetryCount] = useState(0)
  const [pendingTool, setPendingTool] = useState<string | null>(null)

  const fetchCatalog = useCallback(async () => {
    setLoadingState('loading')
    try {
      const params = new URLSearchParams()
      if (tab === 'featured') params.set('featured', 'true')
      if (search) params.set('search', search)

      const res = await fetch(`/api/tools/catalog?${params}`)
      if (!res.ok) throw new Error('API error')

      const data: CatalogResponse = await res.json()
      setTools(data.tools)
      setAllCategories(data.categories)
      setSource(data.source)
      setLoadingState('success')
    } catch (err) {
      console.error('[BrowseModal] Failed to fetch catalog:', err)
      setLoadingState('error')
    }
  }, [tab, search, retryCount])

  useEffect(() => {
    fetchCatalog()
  }, [fetchCatalog])

  // Filter tools client-side based on search + category
  const displayedTools = tools.filter(tool => {
    if (tab === 'installed') {
      return connections[tool.slug.toLowerCase()]?.connected
    }
    if (tab === 'featured') {
      return tool.isFeatured
    }
    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory
    const matchesSearch = !search || [tool.name, tool.description, tool.category]
      .join(' ').toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const installedCount = Object.values(connections).filter(c => c.connected).length
  const totalTools = allCategories.length > 1 ? 30 + installedCount : 30 // estimated

  const handleConnect = (composioApp: string) => {
    setPendingTool(composioApp.toLowerCase())
    onConnect(composioApp)
  }

  const getCategoryColor = (cat: string) => {
    return CATEGORY_COLORS[cat] ?? '#8B5CF6'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl shadow-black/50">

        {/* Header */}
        <div className="px-6 py-4 border-b border-white/7 shrink-0 bg-gradient-to-r from-white/[0.02] to-transparent">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#e8ff47]/10 border border-[#e8ff47]/20 flex items-center justify-center">
                <Puzzle size={18} className="text-[#e8ff47]" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">Browse Integrations</h2>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-white/30 text-xs">
                    {loadingState === 'loading' && 'Loading tools...'}
                    {loadingState === 'success' && (
                      <span className="flex items-center gap-2">
                        <span className="text-white/60">{displayedTools.length} tools</span>
                        <span className="text-white/20">·</span>
                        <span className="text-emerald-400/60">{installedCount} connected</span>
                      </span>
                    )}
                    {loadingState === 'error' && (
                      <span className="flex items-center gap-1 text-red-400/60">
                        <AlertCircle size={12} />
                        Failed to load
                      </span>
                    )}
                  </span>
                  {source === 'fallback' && loadingState === 'success' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400/70 font-medium">
                      Static catalog
                    </span>
                  )}
                  {source === 'composio' && loadingState === 'success' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-400/70 font-medium flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-violet-400 animate-pulse" />
                      Composio live
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white/70 transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stats strip */}
          {loadingState === 'success' && (
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
              {[
                { label: 'Total', value: totalTools, icon: <Globe size={12} /> },
                { label: 'Connected', value: installedCount, icon: <Link2 size={12} /> },
                { label: 'Categories', value: allCategories.length - 1, icon: <Zap size={12} /> },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-1.5">
                  <span className="text-white/20">{stat.icon}</span>
                  <span className="text-white/40 text-[11px]">{stat.label}:</span>
                  <span className="text-white/70 text-[11px] font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 pb-2 border-b border-white/5 shrink-0">
          <div className="flex gap-1">
            {([
              ['all', 'All Tools'],
              ['featured', 'Featured'],
              ['installed', `Installed (${installedCount})`],
            ] as [BrowseTab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  tab === key
                    ? 'bg-[#e8ff47] text-black'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pt-3 pb-2 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search tools, categories..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white/70 text-xs placeholder:text-white/20 focus:outline-none focus:border-[#e8ff47]/40 focus:bg-[#111] transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {allCategories.slice(0, 10).map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setTab('all') }}
                className={`px-2.5 py-1 text-[10px] font-semibold rounded-full border transition-all ${
                  activeCategory === cat
                    ? 'border-current'
                    : 'border-transparent bg-white/7 text-white/35 hover:bg-white/10 hover:text-white/60'
                }`}
                style={activeCategory === cat ? { color: getCategoryColor(cat), borderColor: getCategoryColor(cat) + '60', backgroundColor: getCategoryColor(cat) + '12' } : undefined}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Loading skeleton */}
          {loadingState === 'loading' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-[#111] border border-white/7 rounded-xl p-4 animate-pulse">
                  <div className="w-10 h-10 bg-white/8 rounded-xl mb-3" />
                  <div className="h-3 bg-white/8 rounded w-3/4 mb-2" />
                  <div className="h-2 bg-white/5 rounded w-1/2 mb-3" />
                  <div className="h-6 bg-white/5 rounded-lg" />
                </div>
              ))}
            </div>
          )}

          {/* Error state */}
          {loadingState === 'error' && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <AlertCircle size={22} className="text-red-400" />
              </div>
              <p className="text-white/60 text-sm font-medium mb-1">Could not load integrations</p>
              <p className="text-white/30 text-xs mb-5 max-w-xs">
                There was a problem connecting to Composio. Check your connection and try again.
              </p>
              <button
                onClick={() => setRetryCount(c => c + 1)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/8 hover:bg-white/12 text-white/70 hover:text-white border border-white/10 rounded-xl text-xs font-medium transition-colors"
              >
                <RefreshCw size={13} />
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {loadingState === 'success' && displayedTools.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-4xl mb-3 opacity-30">🔍</div>
              <p className="text-white/50 text-sm font-medium mb-1">
                {tab === 'installed' ? 'No integrations installed yet' : 'No tools found'}
              </p>
              <p className="text-white/25 text-xs mb-4">
                {tab === 'installed' ? 'Connect your first tool to get started' : 'Try a different search or category'}
              </p>
              {tab === 'installed' && (
                <button
                  onClick={() => { setTab('all'); setSearch(''); setActiveCategory('All') }}
                  className="px-4 py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-xs rounded-xl transition-colors"
                >
                  Browse All Tools →
                </button>
              )}
              {(search || activeCategory !== 'All') && (
                <button
                  onClick={() => { setSearch(''); setActiveCategory('All') }}
                  className="px-4 py-2 bg-white/8 hover:bg-white/12 text-white/60 border border-white/10 rounded-xl text-xs transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}

          {/* Tool grid */}
          {loadingState === 'success' && displayedTools.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 pt-2">
              {displayedTools.map((tool) => {
                const slug = tool.slug.toLowerCase()
                const isConnected = connections[slug]?.connected
                const isPending = loading === slug || pendingTool === slug

                return (
                  <div
                    key={tool.id}
                    className="bg-[#111] border border-white/7 rounded-xl p-3.5 hover:border-white/15 hover:bg-[#131313] transition-all group relative"
                  >
                    {/* Connected badge */}
                    {isConnected && (
                      <div className="absolute top-2.5 right-2.5">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: (tool.color ?? getCategoryColor(tool.category)) + '20' }}
                      title={tool.name}
                    >
                      {tool.icon}
                    </div>

                    {/* Info */}
                    <div className="mb-2.5">
                      <p className="text-white font-semibold text-xs mb-0.5">{tool.name}</p>
                      <p
                        className="text-[10px] font-medium mb-1"
                        style={{ color: getCategoryColor(tool.category) + '99' }}
                      >
                        {tool.category}
                      </p>
                      {tool.description && (
                        <p className="text-white/20 text-[9px] leading-relaxed line-clamp-2">
                          {tool.description}
                        </p>
                      )}
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => handleConnect(tool.name.toUpperCase())}
                      disabled={isPending}
                      className={`w-full text-[10px] px-2.5 py-1.5 rounded-lg text-center font-medium transition-all disabled:opacity-40 flex items-center justify-center gap-1 ${
                        isConnected
                          ? 'bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-white/7 hover:bg-white/12 text-white/50 hover:text-white border border-transparent hover:border-white/10'
                      }`}
                    >
                      {isPending ? (
                        <>
                          <Loader2 size={10} className="animate-spin" />
                          {isConnected ? 'Removing...' : 'Connecting...'}
                        </>
                      ) : isConnected ? (
                        <>
                          <CheckCircle2 size={9} />
                          Connected
                        </>
                      ) : (
                        <>
                          Connect
                          <ChevronRight size={9} />
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Featured Tool Card ───────────────────────────────────────────────────────

function FeaturedToolCard({
  tool,
  connected,
  connectedAt,
  onConnect,
  loading,
}: {
  tool: typeof FEATURED_TOOLS[0]
  connected: boolean
  connectedAt: string | null
  onConnect: (toolId: string) => void
  loading: string | null
}) {
  const isLoading = loading === tool.id

  return (
    <div className="bg-[#111] border border-white/7 rounded-2xl p-5 hover:border-white/15 transition-all group relative overflow-hidden">
      {/* Subtle glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${tool.color}15, transparent 60%)` }}
      />

      <div className="relative z-10">
        {/* Header: icon + connected badge */}
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
            style={{ backgroundColor: tool.color + '20', boxShadow: `0 4px 12px ${tool.color}25` }}
          >
            {tool.icon}
          </div>
          {connected && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mb-4">
          <p className="text-white font-bold text-sm mb-0.5">{tool.name}</p>
          <p
            className="text-[11px] font-medium"
            style={{ color: tool.color + '99' }}
          >
            {tool.cat}
          </p>
        </div>

        {/* Action */}
        {connected ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-[10px] font-medium">
              <CheckCircle2 size={12} />
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
              className="w-full text-[10px] text-white/25 hover:text-red-400/70 transition-colors py-1 disabled:opacity-30"
            >
              {isLoading ? 'Removing...' : 'Disconnect'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => onConnect(tool.id)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-bold transition-all disabled:opacity-40"
            style={{
              backgroundColor: tool.color + '15',
              border: `1px solid ${tool.color}30`,
              color: tool.color,
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={11} className="animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Connect
                <ChevronRight size={11} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Messaging Card ──────────────────────────────────────────────────────────

function MessagingCard({
  tool,
  connected,
  connectedAt,
  onConnect,
  loading,
}: {
  tool: typeof MESSAGING_TOOLS[0]
  connected: boolean
  connectedAt: string | null
  onConnect: (toolId: string, value: string) => void
  loading: string | null
}) {
  const isLoading = loading === tool.id
  const [showHow, setShowHow] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleSave = () => {
    if (!inputValue.trim()) return
    onConnect(tool.id, inputValue.trim())
  }

  return (
    <div className="bg-[#111] border border-white/7 rounded-2xl p-5 hover:border-white/12 transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-md"
          style={{ backgroundColor: tool.color + '20' }}
        >
          {tool.id === 'telegram' ? '✈' : tool.id === 'whatsapp' ? '📱' : '🎮'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-white font-bold text-sm">{tool.name}</p>
            {connected && (
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1 font-semibold">
                <CheckCircle2 size={9} />
                Connected
              </span>
            )}
          </div>
          <p className="text-white/30 text-xs">{tool.desc}</p>
        </div>
      </div>

      {/* Token/URL input */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder={tool.placeholder}
          className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-xl px-3.5 py-2.5 text-white/55 text-xs focus:outline-none focus:border-white/20 placeholder:text-white/20 transition-colors disabled:opacity-40"
          disabled={isLoading}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
        />
        <button
          onClick={handleSave}
          disabled={!inputValue.trim() || isLoading}
          className="px-5 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-30 text-black font-bold text-xs rounded-xl shrink-0 transition-colors flex items-center gap-1.5"
        >
          {isLoading ? <Loader2 size={11} className="animate-spin" /> : null}
          Save
        </button>
      </div>

      {/* How to get */}
      <button
        onClick={() => setShowHow(h => !h)}
        className="text-white/20 hover:text-white/40 text-[10px] transition-colors flex items-center gap-1.5"
      >
        <span className="text-white/30">{showHow ? '▲' : '▶'}</span>
        How to get this
      </button>

      {showHow && (
        <pre className="mt-3 text-white/30 text-[10px] leading-relaxed font-mono bg-[#0d0d0d] rounded-xl p-4 border border-white/5 whitespace-pre-wrap">
          {tool.howToGet}
        </pre>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ToolsPage() {
  const [connections, setConnections] = useState<Record<string, UserConnection>>({})
  const [loading, setLoading] = useState<string | null>(null)
  const [showBrowse, setShowBrowse] = useState(false)

  // Load connections
  useEffect(() => {
    createClient().auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id
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

  // Handle OAuth redirect back from Composio
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('connected') === 'true') {
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
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const connectedCount = Object.values(connections).filter(c => c.connected).length

  // Featured tool: Composio OAuth connect/disconnect
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
      const res = await fetch('/api/tools/connect', {
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

  // Messaging tool: save token directly
  const handleMessagingConnect = async (toolId: string, value: string) => {
    const tool = MESSAGING_TOOLS.find(t => t.id === toolId)
    if (!tool) return
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

  // Browse modal: connect handler
  const handleBrowseConnect = async (composioApp: string) => {
    const slug = composioApp.toLowerCase()
    const existing = connections[slug]

    if (existing?.connected) {
      setLoading(slug)
      await fetch('/api/tools/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_name: composioApp, connected: false }),
      })
      setConnections(prev => {
        const n = { ...prev }
        if (n[slug]) n[slug] = { ...n[slug]!, connected: false }
        return n
      })
      setLoading(null)
      return
    }

    setLoading(slug)
    try {
      const res = await fetch('/api/tools/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName: composioApp }),
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

  return (
    <div className="p-6 space-y-8 max-w-6xl">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg bg-[#e8ff47]/10 border border-[#e8ff47]/20 flex items-center justify-center">
              <Puzzle size={14} className="text-[#e8ff47]" />
            </div>
            <h1 className="text-white font-black text-lg">Tools</h1>
          </div>
          <p className="text-white/30 text-xs ml-9">
            Connect your apps. Agents use these to work on your behalf.
          </p>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-4 bg-[#111] border border-white/7 rounded-xl px-4 py-2">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${connectedCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
            <span className="text-white/50 text-[11px]">Connected:</span>
            <span className="text-white/80 text-[11px] font-semibold">{connectedCount}</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="text-white/50 text-[11px]">Agents:</span>
            <span className="text-white/80 text-[11px] font-semibold">3 active</span>
          </div>
        </div>
      </div>

      {/* Featured Integrations */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">
              Featured Integrations
            </h2>
            <p className="text-white/20 text-[10px]">
              Popular tools your agents use most
            </p>
          </div>
          <button
            onClick={() => setShowBrowse(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-[11px] transition-colors"
          >
            <Search size={12} />
            Browse 850+ Tools
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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

      {/* Messaging Channels */}
      <div>
        <div className="mb-4">
          <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">
            Messaging Channels
          </h2>
          <p className="text-white/20 text-[10px]">
            Where agents send alerts, updates, and notifications
          </p>
        </div>
        <div className="space-y-3 max-w-2xl">
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

      {/* Recently Connected */}
      {connectedCount > 0 && (
        <div>
          <div className="mb-4">
            <h2 className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">
              Active Connections
            </h2>
            <p className="text-white/20 text-[10px]">
              {connectedCount} integration{connectedCount !== 1 ? 's' : ''} ready for your agents
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(connections)
              .filter(([, c]) => c.connected)
              .map(([slug, conn]) => {
                const tool = [...FEATURED_TOOLS, ...MESSAGING_TOOLS].find(
                  t => t.id === slug || t.composioApp.toLowerCase() === slug
                )
                return (
                  <div
                    key={slug}
                    className="flex items-center gap-2 px-3 py-2 bg-[#111] border border-emerald-500/20 rounded-xl"
                  >
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    <span className="text-white/70 text-xs font-medium">{conn.app_name}</span>
                    {conn.connected_at && (
                      <span className="text-white/20 text-[9px]">
                        {new Date(conn.connected_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* Browse modal */}
      {showBrowse && (
        <BrowseModal
          connections={connections}
          onClose={() => setShowBrowse(false)}
          onConnect={handleBrowseConnect}
          loading={loading}
        />
      )}
    </div>
  )
}
