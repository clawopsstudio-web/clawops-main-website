'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const guides = [
  {
    slug: 'ghl-mcp',
    icon: '📊',
    title: 'GoHighLevel (GHL) MCP',
    description: 'Connect your GHL CRM to power AI agents with contact search, pipeline management, and workflow triggers.',
    steps: 5,
    time: '5 min',
    difficulty: 'Easy',
    category: 'CRM',
    color: '#FF6B35',
    href: '/guides/ghl-mcp',
  },
  {
    slug: 'n8n-setup',
    icon: '⚙️',
    title: 'n8n Workflow Automation',
    description: 'Connect n8n to give AI agents the power to trigger automations, query databases, and orchestrate complex workflows.',
    steps: 4,
    time: '4 min',
    difficulty: 'Easy',
    category: 'Automation',
    color: '#FF9A3C',
    href: '/guides/n8n-setup',
  },
  {
    slug: 'google-workspace',
    icon: '📁',
    title: 'Google Workspace',
    description: 'Connect Gmail, Drive, Docs, Sheets, and Calendar. AI agents can read emails, create docs, and manage your calendar.',
    steps: 4,
    time: '5 min',
    difficulty: 'Easy',
    category: 'Productivity',
    color: '#4285F4',
    href: '/guides/google-workspace',
  },
  {
    slug: 'chrome-vnc',
    icon: '🌐',
    title: 'Browser Automation (Chrome VNC)',
    description: 'Give AI agents a real browser. Scrape any website, fill forms, take screenshots, and automate any web workflow.',
    steps: 3,
    time: '2 min',
    difficulty: 'Easy',
    category: 'Browser',
    color: '#00D4FF',
    href: '/guides/chrome-vnc',
  },
  {
    slug: 'mcp-servers',
    icon: '🔌',
    title: 'MCP Servers',
    description: 'Connect any Model Context Protocol server. Browse tools, add endpoints, and extend your AI agents capabilities.',
    steps: 3,
    time: '3 min',
    difficulty: 'Intermediate',
    category: 'Developer',
    color: '#6600FF',
    href: '/guides/mcp-servers',
  },
  {
    slug: 'skills-library',
    icon: '🧠',
    title: 'Skills & Plugins Library',
    description: 'Install pre-built skills for GHL, Google Workspace, n8n, and more. One-click setup, zero configuration needed.',
    steps: 2,
    time: '2 min',
    difficulty: 'Easy',
    category: 'AI Skills',
    color: '#10b981',
    href: '/guides/skills-library',
  },
]

const categories = ['All', 'CRM', 'Automation', 'Productivity', 'Browser', 'Developer', 'AI Skills']

export default function GuidesClient() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = guides.filter(g => {
    const matchCategory = activeCategory === 'All' || g.category === activeCategory
    const matchSearch = !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="min-h-screen py-32 px-4" style={{ background: '#0a0a0f' }}>
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
            style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)' }}>
            📚 Setup Guides
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything you need to{' '}
            <span style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              get started
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Step-by-step guides for every integration. From GHL to n8n to browser automation — get your AI agents running in minutes.
          </p>
        </motion.div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search guides..."
              className="w-full rounded-xl px-4 py-3 pl-11 text-sm text-white placeholder-gray-500 outline-none"
              style={{ background: '#1a1a2e', border: '1px solid #2d2d44' }}
            />
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="rounded-full px-4 py-2 text-xs font-medium transition-all"
                style={{
                  background: activeCategory === cat ? 'linear-gradient(135deg, #00D4FF, #6600FF)' : '#1a1a2e',
                  color: activeCategory === cat ? 'white' : '#9ca3af',
                  border: `1px solid ${activeCategory === cat ? 'transparent' : '#2d2d44'}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex gap-6 mb-8 px-1">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>📖</span>
            <span>{guides.length} guides</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>⏱️</span>
            <span>&lt;5 min each</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>🆓</span>
            <span>Free to set up</span>
          </div>
        </div>

        {/* Guide Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No guides match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((guide, i) => (
              <motion.div
                key={guide.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link
                  href={guide.href}
                  className="group block h-full rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                  style={{ background: '#1a1a2e', border: '1px solid #2d2d44' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2d2d44')}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-3xl">{guide.icon}</span>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{ background: `${guide.color}22`, color: guide.color }}>
                        {guide.category}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[#00D4FF] transition-colors">
                    {guide.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {guide.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{guide.steps} steps</span>
                      <span>•</span>
                      <span>{guide.time}</span>
                      <span>•</span>
                      <span>{guide.difficulty}</span>
                    </div>
                    <span className="text-[#00D4FF] text-sm group-hover:translate-x-1 transition-transform">
                      View →
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 text-center rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(102,0,255,0.08))', border: '1px solid rgba(0,212,255,0.15)' }}>
          <h3 className="text-xl font-semibold text-white mb-2">Need help getting started?</h3>
          <p className="text-gray-400 text-sm mb-6">Check the Quick Start guide to get everything running in 5 minutes.</p>
          <Link href="/quick-start" className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)', boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}>
            ⚡ Go to Quick Start
          </Link>
        </div>
      </div>
    </div>
  )
}
