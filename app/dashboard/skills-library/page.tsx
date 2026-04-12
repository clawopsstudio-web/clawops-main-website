'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '@/lib/store'
import { supabase } from '@/lib/supabase/client'
import catalogData from '@/data/skills-catalog.json'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Skill {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  category: string
  icon: string
  color: string
  platforms: string[]
  install_method: string
  install_path: string
  install_command: string | null
  prerequisites: string[]
  tools: string[]
  config_fields: { name: string; label: string; type: string; required: boolean }[]
  docs_url: string
  status: string
  featured: boolean
}

interface UserSkill {
  skill_slug: string
  status: string
  config_data: Record<string, string>
  installed_at: string
}

// ─── Category badge colors ───────────────────────────────────────────────────

const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  CRM:         { bg: 'bg-orange-500/20', text: 'text-orange-400' },
  Productivity:{ bg: 'bg-blue-500/20',   text: 'text-blue-400'   },
  Automation:  { bg: 'bg-pink-500/20',   text: 'text-pink-400'   },
  Marketing:  { bg: 'bg-sky-500/20',     text: 'text-sky-400'    },
  AI:         { bg: 'bg-purple-500/20',  text: 'text-purple-400' },
}

const STATUS_BADGE: Record<string, { label: string; color: string }> = {
  stable: { label: 'Stable', color: 'bg-emerald-500/20 text-emerald-400' },
  beta:   { label: 'Beta',  color: 'bg-yellow-500/20 text-yellow-400' },
}

// ─── Install Modal ───────────────────────────────────────────────────────────

function InstallModal({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const { user } = useAuthStore()
  const [step, setStep] = useState<'command' | 'config' | 'done'>('command')
  const [configValues, setConfigValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const hasConfig = skill.config_fields && skill.config_fields.length > 0

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/skills/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: skill.slug,
          user_id: user.id,
          status: hasConfig && Object.values(configValues).some(v => v) ? 'needs_config' : 'installed',
          config_data: configValues,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Install failed')
      setStep('done')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCopy = () => {
    if (skill.install_command) {
      navigator.clipboard.writeText(skill.install_command)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a2e] border border-[#2d2d44] rounded-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-[#2d2d44]">
          <span className="text-4xl">{skill.icon}</span>
          <div>
            <h2 className="text-xl font-semibold">{skill.name}</h2>
            <p className="text-gray-400 text-sm">{skill.tagline}</p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-white text-xl">×</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {step === 'command' && (
            <>
              {skill.prerequisites.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-yellow-400 text-sm font-medium mb-2">⚠️ Prerequisites</p>
                  <ul className="text-xs text-yellow-300/80 space-y-1">
                    {skill.prerequisites.map((p, i) => <li key={i}>• {p}</li>)}
                  </ul>
                </div>
              )}

              {skill.install_command ? (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Run this command to install:</p>
                  <div className="bg-[#0f0f1a] rounded-lg p-3 flex items-center gap-3">
                    <code className="text-emerald-400 text-xs flex-1 break-all">{skill.install_command}</code>
                    <button
                      onClick={handleCopy}
                      className="text-xs bg-[#2d2d44] hover:bg-[#3d3d54] text-gray-300 px-3 py-1.5 rounded-lg shrink-0"
                    >
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-blue-400 text-sm">This skill is already configured via mcporter.</p>
                  <p className="text-xs text-gray-400 mt-1">No additional installation needed.</p>
                </div>
              )}

              {hasConfig && (
                <button
                  onClick={() => setStep('config')}
                  className="w-full bg-[#00D4FF] hover:bg-[#00b8e6] text-black font-semibold py-2.5 rounded-lg transition-colors"
                >
                  Configure →
                </button>
              )}

              <button
                onClick={() => { setStep('done'); handleSave() }}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                Mark as Installed ✓
              </button>
            </>
          )}

          {step === 'config' && (
            <>
              <p className="text-gray-300 text-sm font-medium">Configuration</p>
              {skill.config_fields.map(field => (
                <div key={field.name}>
                  <label className="text-xs text-gray-400 mb-1 block">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  {field.type === 'password' ? (
                    <input
                      type="password"
                      value={configValues[field.name] || ''}
                      onChange={e => setConfigValues(v => ({ ...v, [field.name]: e.target.value }))}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full bg-[#0f0f1a] border border-[#2d2d44] rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-[#00D4FF] focus:outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={configValues[field.name] || ''}
                      onChange={e => setConfigValues(v => ({ ...v, [field.name]: e.target.value }))}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                      className="w-full bg-[#0f0f1a] border border-[#2d2d44] rounded-lg px-3 py-2 text-sm text-gray-200 focus:border-[#00D4FF] focus:outline-none"
                    />
                  )}
                </div>
              ))}

              {error && <p className="text-red-400 text-sm">❌ {error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('command')}
                  className="flex-1 bg-[#2d2d44] hover:bg-[#3d3d54] text-white py-2.5 rounded-lg transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-2.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Config'}
                </button>
              </div>
            </>
          )}

          {step === 'done' && (
            <div className="text-center py-6">
              <span className="text-6xl mb-4 block">🎉</span>
              <h3 className="text-xl font-semibold mb-2">{skill.name} Installed!</h3>
              <p className="text-gray-400 text-sm mb-6">
                {hasConfig
                  ? 'Configuration saved. Your AI agent can now use this skill.'
                  : 'The skill has been added to your workspace.'}
              </p>
              <button
                onClick={onClose}
                className="bg-[#00D4FF] hover:bg-[#00b8e6] text-black font-semibold px-8 py-2.5 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Skill Card ─────────────────────────────────────────────────────────────

function SkillCard({ skill, isInstalled, onInstall }: {
  skill: Skill
  isInstalled: boolean
  onInstall: (skill: Skill) => void
}) {
  const catStyle = CATEGORY_STYLES[skill.category] || { bg: 'bg-gray-500/20', text: 'text-gray-400' }
  const statusStyle = STATUS_BADGE[skill.status] || STATUS_BADGE.stable

  return (
    <div className={`rounded-xl border transition-all hover:scale-[1.01] ${
      isInstalled
        ? 'bg-[#0a1a0f] border-emerald-500/40'
        : 'bg-[#1a1a2e] border-[#2d2d44] hover:border-[#00D4FF]/50'
    }`}>
      {/* Top row */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{skill.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{skill.name}</h3>
                {skill.featured && (
                  <span className="text-[10px] bg-[#00D4FF]/20 text-[#00D4FF] px-1.5 py-0.5 rounded font-medium">
                    Featured
                  </span>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded ${catStyle.bg} ${catStyle.text}`}>
                {skill.category}
              </span>
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded ${statusStyle.color}`}>
            {statusStyle.label}
          </span>
        </div>

        {/* Tagline */}
        <p className="text-gray-300 text-sm font-medium mb-2">{skill.tagline}</p>
        <p className="text-gray-500 text-xs mb-4 line-clamp-2">{skill.description}</p>

        {/* Platforms */}
        <div className="flex flex-wrap gap-1 mb-4">
          {skill.platforms.slice(0, 5).map(p => (
            <span key={p} className="text-[10px] bg-[#2d2d44] text-gray-400 px-1.5 py-0.5 rounded">
              {p}
            </span>
          ))}
        </div>

        {/* Tools */}
        <div className="bg-[#0f0f1a] rounded-lg p-2.5 mb-4">
          <p className="text-[10px] text-[#00D4FF] mb-1.5 uppercase tracking-wider">Capabilities</p>
          <div className="flex flex-wrap gap-1">
            {skill.tools.slice(0, 4).map(t => (
              <span key={t} className="text-[10px] text-gray-400 bg-[#1a1a2e] px-1.5 py-0.5 rounded">
                {t}
              </span>
            ))}
            {skill.tools.length > 4 && (
              <span className="text-[10px] text-gray-500">+{skill.tools.length - 4} more</span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Install button */}
      <div className="px-5 pb-5">
        {isInstalled ? (
          <div className="flex items-center justify-center gap-2 bg-emerald-500/20 text-emerald-400 py-2.5 rounded-lg text-sm font-medium">
            <span>✓</span> Installed
          </div>
        ) : (
          <button
            onClick={() => onInstall(skill)}
            className="w-full bg-[#2d2d44] hover:bg-[#00D4FF] hover:text-black text-gray-300 font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            Install Skill
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function SkillsLibrary() {
  const { user } = useAuthStore()
  const [skills] = useState<Skill[]>(catalogData.skills)
  const [categories] = useState(catalogData.categories)
  const [installedSlugs, setInstalledSlugs] = useState<Set<string>>(new Set())
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'browse' | 'installed'>('browse')
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [loading, setLoading] = useState(false)

  // Load installed skills from Supabase
  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetch(`/api/skills/user-installed?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.installed) {
          setInstalledSlugs(new Set(data.installed.map((s: any) => s.slug)))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const allPlatforms = useMemo(() => {
    const platforms = new Set<string>()
    skills.forEach(s => s.platforms.forEach(p => platforms.add(p)))
    return Array.from(platforms).sort()
  }, [skills])

  const filtered = useMemo(() => {
    return skills.filter(s => {
      if (filterCategory !== 'all' && s.category.toLowerCase() !== filterCategory.toLowerCase()) return false
      if (filterPlatform !== 'all' && !s.platforms.some(p => p.toLowerCase().includes(filterPlatform.toLowerCase()))) return false
      if (search) {
        const q = search.toLowerCase()
        if (!s.name.toLowerCase().includes(q) &&
            !s.description.toLowerCase().includes(q) &&
            !s.tagline.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [skills, filterCategory, filterPlatform, search])

  const featured = filtered.filter(s => s.featured)
  const nonFeatured = filtered.filter(s => !s.featured)

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Skills &amp; Plugins Library</h1>
        <p className="text-gray-400 text-sm">
          {skills.length} skills &amp; plugins — install in one-click to power up your AI agent teams
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#1a1a2e] p-1 rounded-xl w-fit">
        {[
          { key: 'browse', label: 'Browse', count: skills.length },
          { key: 'installed', label: 'Installed', count: installedSlugs.size },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[#00D4FF] text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {activeTab === 'browse' && (
        <>
          {/* Search + Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            {/* Search */}
            <div className="relative flex-1 min-w-[240px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search skills..."
                className="w-full bg-[#1a1a2e] border border-[#2d2d44] rounded-lg pl-9 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-[#00D4FF] focus:outline-none"
              />
            </div>

            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="bg-[#1a1a2e] border border-[#2d2d44] rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:border-[#00D4FF] focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>

            {/* Platform filter */}
            <select
              value={filterPlatform}
              onChange={e => setFilterPlatform(e.target.value)}
              className="bg-[#1a1a2e] border border-[#2d2d44] rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:border-[#00D4FF] focus:outline-none cursor-pointer"
            >
              <option value="all">All Platforms</option>
              {allPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="bg-[#1a1a2e] border border-[#2d2d44] rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl mb-4 block">🔍</span>
              <p className="text-gray-400">No skills match your filters.</p>
              <button
                onClick={() => { setSearch(''); setFilterCategory('all'); setFilterPlatform('all') }}
                className="mt-3 text-[#00D4FF] text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {/* Featured first */}
              {featured.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">⭐ Featured</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featured.map(skill => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        isInstalled={installedSlugs.has(skill.slug)}
                        onInstall={setSelectedSkill}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All others */}
              {nonFeatured.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">All Skills</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {nonFeatured.map(skill => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        isInstalled={installedSlugs.has(skill.slug)}
                        onInstall={setSelectedSkill}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {activeTab === 'installed' && (
        <div>
          {installedSlugs.size === 0 ? (
            <div className="text-center py-16">
              <span className="text-5xl mb-4 block">📦</span>
              <p className="text-gray-400 mb-2">No skills installed yet.</p>
              <p className="text-gray-600 text-sm">Browse the library and install skills to get started.</p>
              <button
                onClick={() => setActiveTab('browse')}
                className="mt-4 bg-[#00D4FF] text-black font-medium px-6 py-2.5 rounded-lg hover:bg-[#00b8e6] transition-colors"
              >
                Browse Skills
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.filter(s => installedSlugs.has(s.slug)).map(skill => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  isInstalled={true}
                  onInstall={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info footer */}
      <div className="mt-12 bg-[#1a1a2e] rounded-xl p-6 border border-[#2d2d44]">
        <h2 className="text-lg font-semibold mb-4">What Are Skills?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">📦 Pre-built capabilities</h3>
            <p className="text-gray-400 text-sm">
              Skills are pre-configured AI behaviors that extend what your agents can do — CRM integration, document creation, workflow monitoring, and more.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">🔒 Runs on your VPS</h3>
            <p className="text-gray-400 text-sm">
              Skills install directly onto your OpenClaw instance. Your credentials and data stay on your server — no third-party data sharing.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">⚡ One-click install</h3>
            <p className="text-gray-400 text-sm">
              Browse, click Install, run the command. Your agent gains new capabilities instantly. Configure API keys once, use everywhere.
            </p>
          </div>
        </div>
      </div>

      {/* Install Modal */}
      {selectedSkill && (
        <InstallModal
          skill={selectedSkill}
          onClose={() => {
            setSelectedSkill(null)
            // Refresh installed list
            if (user) {
              fetch(`/api/skills/user-installed?user_id=${user.id}`)
                .then(r => r.json())
                .then(data => {
                  if (data.installed) {
                    setInstalledSlugs(new Set(data.installed.map((s: any) => s.slug)))
                  }
                })
            }
          }}
        />
      )}
    </div>
  )
}
