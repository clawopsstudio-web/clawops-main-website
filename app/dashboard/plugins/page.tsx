'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Plugin {
  name: string
  desc: string
  source: string
  status: 'available' | 'coming_soon'
  category?: string
}

const STATIC_PLUGINS = [
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

interface SubmitModalProps {
  onClose: () => void
}

function SubmitModal({ onClose }: SubmitModalProps) {
  const [form, setForm] = useState({ name: '', repo: '', desc: '' })
  const [done, setDone] = useState(false)
  const set = (k: keyof typeof form, v: string) => setForm(prev => ({ ...prev, [k]: v }))
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white/60">✕</button>
        {done ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-[#e8ff47] font-semibold mb-2">Thanks! We&apos;ll review your plugin.</p>
            <p className="text-white/40 text-sm">We&apos;ll reach out if it fits our library.</p>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setDone(true) }} className="space-y-4">
            <div>
              <label className="text-white/60 text-xs block mb-1.5">Plugin name</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Web Scraper"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-white/70 text-sm focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="text-white/60 text-xs block mb-1.5">GitHub repo URL</label>
              <input value={form.repo} onChange={e => set('repo', e.target.value)} required placeholder="https://github.com/you/plugin"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-white/70 text-sm focus:outline-none focus:border-white/20" />
            </div>
            <div>
              <label className="text-white/60 text-xs block mb-1.5">Description</label>
              <textarea value={form.desc} onChange={e => set('desc', e.target.value)} required rows={3} placeholder="What does this plugin do?"
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2.5 text-white/70 text-sm focus:outline-none focus:border-white/20 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 border border-white/10 text-white/50 rounded-xl text-sm hover:bg-white/5">Cancel</button>
              <button type="submit"
                className="flex-1 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold rounded-xl text-sm">Submit Plugin</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function PluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>(STATIC_PLUGINS as Plugin[])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [installed, setInstalled] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/clawopsstudio-web/plugins/main/plugins.json')
      .then(r => r.json())
      .then((data: Plugin[]) => { if (data?.length) setPlugins(data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const categories = ['all']
  const filtered = filter === 'all' ? plugins : plugins.filter(p => (p.category || 'Other') === filter)

  const install = (name: string) => setInstalled(prev => new Set([...prev, name]))

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-black text-xl">Plugins</h1>
          <p className="text-white/40 text-sm mt-1">Extend your agent with open-source tools</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="text-xs text-white/40 hover:text-white/70 border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg transition-colors">
          + Submit Plugin
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === cat
                ? 'bg-[#e8ff47] text-[#0a0a0a]'
                : 'bg-white/5 text-white/40 hover:text-white/70 border border-white/10'
            }`}
          >
            {cat === 'all' ? 'All' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(plugin => (
          <div key={plugin.name} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <h3 className="text-white font-semibold text-sm">{plugin.name}</h3>
              </div>
              {plugin.category && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[plugin.category] || 'bg-white/10 text-white/40 border-white/20'}`}>
                  {plugin.category}
                </span>
              )}
            </div>
            <p className="text-white/40 text-xs mb-4 leading-relaxed">{plugin.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/25 font-mono">via {plugin.source}</span>
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
        <div className="text-center py-12 text-white/30 text-sm">No plugins in this category yet.</div>
      )}

      {showModal && <SubmitModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
