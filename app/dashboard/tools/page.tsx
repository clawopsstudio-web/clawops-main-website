'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

// Real tool icons using simple SVG paths
const TOOL_ICONS: Record<string, string> = {
  gmail: 'M Gmail',
  'google-calendar': 'M Calendar',
  'google-drive': 'M Drive',
  'google-sheets': 'M Sheets',
  slack: 'M Slack',
  telegram: 'M Telegram',
  discord: 'M Discord',
  whatsapp: 'M WhatsApp',
  github: 'M GitHub',
  notion: 'M Notion',
  hubspot: 'M HubSpot',
  salesforce: 'M SF',
  stripe: 'M Stripe',
  jira: 'M Jira',
  asana: 'M Asana',
  trello: 'M Trello',
  shopify: 'M Shopify',
  twitter: 'M Twitter',
  linkedin: 'M LinkedIn',
  youtube: 'M YouTube',
  zoom: 'M Zoom',
  figma: 'M Figma',
  default: 'M Tools',
}

// Popular tools to show
const AVAILABLE_TOOLS = [
  { slug: 'gmail', name: 'Gmail', category: 'Email', description: 'Send and receive emails' },
  { slug: 'google-calendar', name: 'Google Calendar', category: 'Productivity', description: 'Manage schedules' },
  { slug: 'google-drive', name: 'Google Drive', category: 'Storage', description: 'Access files' },
  { slug: 'slack', name: 'Slack', category: 'Messaging', description: 'Team communication' },
  { slug: 'telegram', name: 'Telegram', category: 'Messaging', description: 'Bot messaging' },
  { slug: 'discord', name: 'Discord', category: 'Messaging', description: 'Server messaging' },
  { slug: 'whatsapp', name: 'WhatsApp', category: 'Messaging', description: 'Business messages' },
  { slug: 'github', name: 'GitHub', category: 'Dev', description: 'Code repositories' },
  { slug: 'notion', name: 'Notion', category: 'Docs', description: 'Notes and docs' },
  { slug: 'hubspot', name: 'HubSpot', category: 'CRM', description: 'Sales CRM' },
  { slug: 'salesforce', name: 'Salesforce', category: 'CRM', description: 'Enterprise CRM' },
  { slug: 'stripe', name: 'Stripe', category: 'Payments', description: 'Payment processing' },
  { slug: 'jira', name: 'Jira', category: 'Project', description: 'Issue tracking' },
  { slug: 'asana', name: 'Asana', category: 'Project', description: 'Task management' },
  { slug: 'trello', name: 'Trello', category: 'Project', description: 'Kanban boards' },
  { slug: 'shopify', name: 'Shopify', category: 'E-Commerce', description: 'Online store' },
  { slug: 'twitter', name: 'Twitter/X', category: 'Social', description: 'Social posts' },
  { slug: 'linkedin', name: 'LinkedIn', category: 'Social', description: 'Professional network' },
  { slug: 'youtube', name: 'YouTube', category: 'Social', description: 'Video platform' },
  { slug: 'zoom', name: 'Zoom', category: 'Video', description: 'Video calls' },
  { slug: 'figma', name: 'Figma', category: 'Design', description: 'Design tool' },
  { slug: 'intercom', name: 'Intercom', category: 'Support', description: 'Customer chat' },
  { slug: 'zendesk', name: 'Zendesk', category: 'Support', description: 'Help desk' },
  { slug: 'mailchimp', name: 'Mailchimp', category: 'Marketing', description: 'Email marketing' },
  { slug: 'sendgrid', name: 'SendGrid', category: 'Email', description: 'Email API' },
  { slug: 'twilio', name: 'Twilio', category: 'SMS', description: 'SMS API' },
  { slug: 'airtable', name: 'Airtable', category: 'Database', description: 'Low-code DB' },
  { slug: 'postgres', name: 'PostgreSQL', category: 'Database', description: 'SQL database' },
  { slug: 'firebase', name: 'Firebase', category: 'Dev', description: 'Google backend' },
  { slug: 'aws', name: 'AWS', category: 'Cloud', description: 'Cloud platform' },
  { slug: 'vercel', name: 'Vercel', category: 'Dev', description: 'Deploy platform' },
  { slug: 'shopify', name: 'Shopify', category: 'E-Commerce', description: 'E-commerce platform' },
  { slug: 'woocommerce', name: 'WooCommerce', category: 'E-Commerce', description: 'WordPress shop' },
  { slug: 'calendly', name: 'Calendly', category: 'Scheduling', description: 'Meeting bookings' },
  { slug: 'typeform', name: 'Typeform', category: 'Forms', description: 'Online forms' },
  { slug: 'hotjar', name: 'Hotjar', category: 'Analytics', description: 'User analytics' },
  { slug: 'mixpanel', name: 'Mixpanel', category: 'Analytics', description: 'Product analytics' },
  { slug: 'segment', name: 'Segment', category: 'Analytics', description: 'Customer data' },
]

const CATEGORIES = ['All', 'Email', 'Messaging', 'CRM', 'Productivity', 'Dev', 'Payments', 'Marketing', 'Social', 'Project', 'Support', 'Database', 'Cloud', 'E-Commerce']

interface ConnectedTool {
  id: string
  tool_slug: string
  tool_name: string
  status: string
  connected_at: string
}

export default function ToolsPage() {
  const [connectedTools, setConnectedTools] = useState<ConnectedTool[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [connecting, setConnecting] = useState<string | null>(null)
  const [showCatalog, setShowCatalog] = useState(false)

  useEffect(() => {
    async function loadTools() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setLoading(false)
          return
        }

        const { data: toolsData } = await supabase
          .from('user_tools')
          .select('*')
          .eq('user_id', user.id)

        if (toolsData) {
          setConnectedTools(toolsData)
        }
      } catch (err: any) {
        console.error('[tools] Error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTools()
  }, [])

  const connectTool = async (slug: string, name: string) => {
    setConnecting(slug)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { error } = await supabase
        .from('user_tools')
        .upsert({
          user_id: user.id,
          tool_slug: slug,
          tool_name: name,
          status: 'connected',
        }, {
          onConflict: 'user_id,tool_slug',
        })

      if (!error) {
        setConnectedTools(prev => {
          const existing = prev.find(t => t.tool_slug === slug)
          if (existing) return prev
          return [...prev, {
            id: Date.now().toString(),
            tool_slug: slug,
            tool_name: name,
            status: 'connected',
            connected_at: new Date().toISOString(),
          }]
        })
      }
    } catch (err: any) {
      console.error('[tools] Connect error:', err)
    } finally {
      setConnecting(null)
    }
  }

  const disconnectTool = async (slug: string) => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      await supabase
        .from('user_tools')
        .delete()
        .eq('user_id', user.id)
        .eq('tool_slug', slug)

      setConnectedTools(prev => prev.filter(t => t.tool_slug !== slug))
    } catch (err: any) {
      console.error('[tools] Disconnect error:', err)
    }
  }

  const filteredTools = AVAILABLE_TOOLS.filter(tool => {
    const matchesCategory = category === 'All' || tool.category === category
    const matchesSearch = !search || 
      tool.name.toLowerCase().includes(search.toLowerCase()) ||
      tool.description.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const isConnected = (slug: string) => connectedTools.some(t => t.tool_slug === slug)

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-white/30 text-sm">Loading tools...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Tools & Integrations</h1>
            <p className="text-white/40 text-sm">
              Connect tools to give your agents superpowers
            </p>
          </div>
          <button
            onClick={() => setShowCatalog(true)}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 text-sm rounded-lg transition-colors"
          >
            Browse {data?.total || 100}+ Tools →
          </button>
        </div>

        {/* Connected Tools */}
        <div className="mb-8">
          <h2 className="text-white font-semibold text-sm mb-4">
            Connected ({connectedTools.length})
          </h2>
          {connectedTools.length === 0 ? (
            <div className="bg-[#111] border border-white/10 rounded-xl p-8 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔌</span>
              </div>
              <p className="text-white/50 text-sm">No tools connected yet</p>
              <p className="text-white/30 text-xs mt-1">Connect tools below to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {connectedTools.map(tool => (
                <div 
                  key={tool.id}
                  className="bg-[#111] border border-emerald-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-white/60">
                        {TOOL_ICONS[tool.tool_slug]?.[0] || 'T'}
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                      Connected
                    </span>
                  </div>
                  <p className="text-white font-medium text-sm">{tool.tool_name}</p>
                  <button
                    onClick={() => disconnectTool(tool.tool_slug)}
                    className="text-white/30 hover:text-red-400 text-xs mt-2 transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Connect */}
        <div>
          <h2 className="text-white font-semibold text-sm mb-4">Quick Connect</h2>
          <div className="grid grid-cols-4 gap-3">
            {AVAILABLE_TOOLS.slice(0, 8).map(tool => (
              <div 
                key={tool.slug}
                className="bg-[#111] border border-white/7 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-bold text-white/60">
                      {TOOL_ICONS[tool.slug]?.[0] || 'T'}
                    </span>
                  </div>
                  {isConnected(tool.slug) ? (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                      ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => connectTool(tool.slug, tool.name)}
                      disabled={connecting === tool.slug}
                      className="text-[10px] bg-white/10 hover:bg-white/20 text-white/60 px-2 py-0.5 rounded-full transition-colors disabled:opacity-50"
                    >
                      {connecting === tool.slug ? '...' : 'Connect'}
                    </button>
                  )}
                </div>
                <p className="text-white font-medium text-sm">{tool.name}</p>
                <p className="text-white/30 text-xs">{tool.category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tool Catalog Modal */}
        {showCatalog && (
          <div 
            className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto"
            onClick={() => setShowCatalog(false)}
          >
            <div 
              className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#141414] z-10">
                <div>
                  <h2 className="text-xl font-bold text-white">Tool Catalog</h2>
                  <p className="text-white/40 text-sm">{AVAILABLE_TOOLS.length} tools available</p>
                </div>
                <button
                  onClick={() => setShowCatalog(false)}
                  className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Search & Filter */}
              <div className="p-4 border-b border-white/5">
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-white/30"
                />
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
                        category === cat 
                          ? 'bg-white text-black' 
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tools Grid */}
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-3 gap-3">
                  {filteredTools.map(tool => (
                    <div 
                      key={tool.slug}
                      className="bg-[#1a1a1a] border border-white/7 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                          <span className="text-sm font-bold text-white/60">
                            {TOOL_ICONS[tool.slug]?.[0] || 'T'}
                          </span>
                        </div>
                        {isConnected(tool.slug) ? (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">
                            Connected
                          </span>
                        ) : (
                          <button
                            onClick={() => connectTool(tool.slug, tool.name)}
                            disabled={connecting === tool.slug}
                            className="text-[10px] bg-[#e8ff47] hover:bg-[#d4eb3a] text-black px-2 py-0.5 rounded-full font-medium transition-colors disabled:opacity-50"
                          >
                            {connecting === tool.slug ? 'Connecting...' : 'Connect'}
                          </button>
                        )}
                      </div>
                      <p className="text-white font-bold text-sm">{tool.name}</p>
                      <p className="text-white/30 text-xs mb-2">{tool.category}</p>
                      <p className="text-white/50 text-xs">{tool.description}</p>
                    </div>
                  ))}
                </div>
                {filteredTools.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-white/40">No tools found matching your search</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
