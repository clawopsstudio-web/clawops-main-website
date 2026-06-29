'use client'
import { useState, useEffect } from 'react'

interface Plugin {
  name: string; desc: string; source: string; status: 'available' | 'coming_soon'; category?: string
}

const STATIC_PLUGINS: Plugin[] = [
  { name: 'Web Scraper', desc: 'Scrape any URL and return structured data', source: 'firecrawl-py', status: 'available', category: 'Data' },
  { name: 'Email Parser', desc: 'Extract structured data from raw email content', source: 'mailparser', status: 'available', category: 'Communication' },
  { name: 'PDF Reader', desc: 'Extract and summarise PDF content', source: 'pymupdf', status: 'available', category: 'Documents' },
  { name: 'Code Executor', desc: 'Run Python snippets in a sandboxed environment', source: 'e2b', status: 'available', category: 'Development' },
  { name: 'Calendar Sync', desc: 'Read and write Google Calendar events', source: 'gcal-mcp', status: 'coming_soon', category: 'Productivity' },
  { name: 'LinkedIn Scraper', desc: 'Fetch public LinkedIn profile data', source: 'proxycurl', status: 'coming_soon', category: 'Sales' },
  { name: 'Telegram Sender', desc: 'Send messages and files via Telegram bot', source: 'python-telegram-bot', status: 'available', category: 'Communication' },
  { name: 'SearXNG Search', desc: 'Private web search via self-hosted SearXNG', source: 'searxng', status: 'available', category: 'Search' },
]

const CATEGORY_COLORS: Record<string, string> = {
  Data: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Communication: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  Documents: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Development: 'bg-green-500/20 text-green-400 border-green-500/30',
  Productivity: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Sales: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  Search: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
}

function SubmitModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', repo: '', category: 'Data', desc: '' })
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const set = (k: keyof typeof form, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await fetch('/api/tools/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_name: `plugin_submission:${form.name}`,
          connected: true,
        }),
      })
    } catch (_) {}
    setSubmitting(false)
    setDone(true)
  }

  const categories = ['Data', 'Communication', 'Documents', 'Development', 'Productivity', 'Sales', 'Search']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60">✕</button>

        {done ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-[#e8ff47] font-semibold mb-2">Thanks! We'll review your plugin.</p>
            <p className="text-white/40 text-sm">We'll reach out if it fits our library within 48 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-white font-bold text-base">Submit Plugin</h3>
            <div>
              <label className="text-white/50 text-xs block mb-1.5">Plugin name *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Web Scraper"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white/70 text-sm focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1.5">GitHub repo URL *</label>
              <input value={form.repo} onChange={e => set('repo', e.target.value)} required placeholder="https://github.com/you/plugin"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white/70 text-sm focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1.5">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-2.5 text-white/70 text-sm focus:outline-none">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1.5">Description *</label>
              <textarea value={form.desc} onChange={e => set('desc', e.target.value)} required rows={3} placeholder="What does this plugin do?"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white/70 text-sm focus:outline-none focus:border-white/20 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-white/10 text-white/50 rounded-xl text-sm hover:bg-white/5">Cancel</button>
              <button type="submit" disabled={submitting}
                className="flex-[2] py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-40 text-black font-bold rounded-xl text-sm">
                {submitting ? 'Submitting...' : 'Submit Plugin'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>(STATIC_PLUGINS)
  const [loading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [installed, setInstalled] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/clawopsstudio-web/plugins/main/plugins.json')
      .then(r => r.json())
      .then((data: Plugin[]) => { if (data?.length) setPlugins(data) })
      .catch(() => {})
  }, [])

  const install = async (name: string) => {
    if (installed.has(name)) return
    try {
      await fetch('/api/tools/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_name: `plugin:${name}`, connected: true }),
      })
    } catch (_) {}
    setInstalled(prev => new Set([...prev, name]))
  }

  const allCategories = ['all', ...new Set(plugins.map(p => p.category).filter(Boolean) as string[])]
  const filtered = filter === 'all' ? plugins : plugins.filter(p => p.category === filter)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-lg">Plugins</h1>
          <p className="text-white/30 text-xs mt-1">Extend your agents with open-source tools</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-xs rounded-xl transition-colors">
          + Submit Plugin
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {allCategories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filter === cat
                ? 'bg-[#e8ff47] text-black border-[#e8ff47]'
                : 'bg-white/5 text-white/40 hover:text-white/70 border-white/10 hover:border-white/15'
            }`}>
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      {/* Plugin grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(plugin => (
          <div key={plugin.name} className="bg-[#111] border border-white/7 rounded-xl p-5 hover:border-white/15 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <div>
                  <h3 className="text-white font-bold text-sm">{plugin.name}</h3>
                  {plugin.category && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${CATEGORY_COLORS[plugin.category] || 'bg-white/10 text-white/40 border-white/20'}`}>
                      {plugin.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-white/40 text-xs mb-4 leading-relaxed">{plugin.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/20 font-mono">via {plugin.source}</span>
              {plugin.status === 'available' ? (
                installed.has(plugin.name) ? (
                  <span className="text-xs font-medium text-emerald-400">Installed ✅</span>
                ) : (
                  <button onClick={() => install(plugin.name)}
                    className="text-xs font-medium text-[#e8ff47] hover:underline">
                    Install →
                  </button>
                )
              ) : (
                <span className="text-[10px] text-white/30">Coming Soon</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="text-center py-12 text-white/20 text-sm">No plugins in this category.</div>
      )}

      {showModal && <SubmitModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
