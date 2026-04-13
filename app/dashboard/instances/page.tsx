'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Bot, Cpu, HardDrive, Wifi, WifiOff, Plus, Trash2, RefreshCw, ExternalLink } from 'lucide-react'

interface VPSInstance {
  id: string
  name: string
  tunnel_url: string
  status: string
  last_heartbeat: string
  openclaw_version: string
  agent_count: number
  specs: any
  created_at: string
}

export default function InstancesPage() {
  const [instances, setInstances] = useState<VPSInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [addMode, setAddMode] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadInstances()
  }, [])

  const loadInstances = async () => {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      window.location.href = '/auth/login'
      return
    }

    const { data, error } = await supabase
      .from('vps_instances')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      setMessage(`Database error: ${error.message}. Table may need migration.`)
      setInstances([])
    } else {
      setInstances(data || [])
    }
    setLoading(false)
  }

  const handleAddInstance = async () => {
    if (!newUrl.trim()) return
    setAdding(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Fetch real data from the tunnel URL to get specs
    let specs = {}
    let agentCount = 0
    let openclawVersion = ''
    try {
      const res = await fetch(`${newUrl.trim()}/api/openclaw-status/`)
      if (res.ok) {
        const d = await res.json()
        agentCount = (d.agents || []).filter((a: any) => a.isActive).length
        openclawVersion = d.openclaw?.version || ''
        specs = {
          cpu: d.system?.cpuUsage?.toFixed(1) + '%',
          ram_mb: d.system?.memory?.used_mb || 0,
          disk: d.system?.diskUsage || '—',
          openclaw_version: openclawVersion,
        }
      }
    } catch (e) {
      // VPS unreachable, add anyway
    }

    const { error } = await supabase
      .from('vps_instances')
      .insert({
        user_id: session.user.id,
        tunnel_url: newUrl.trim(),
        name: newName.trim() || 'VPS Instance',
        status: 'online',
        agent_count: agentCount,
        openclaw_version: openclawVersion,
        specs,
        last_heartbeat: new Date().toISOString(),
      })

    setAdding(false)
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('✅ Instance added!')
      setNewUrl('')
      setNewName('')
      setAddMode(false)
      loadInstances()
    }
    setTimeout(() => setMessage(''), 3000)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await supabase.from('vps_instances').delete().eq('id', id)
    setInstances(prev => prev.filter(i => i.id !== id))
    setDeleting(null)
  }

  const timeSince = (ts: string) => {
    if (!ts) return '—'
    const secs = Math.floor((Date.now() - new Date(ts).getTime()) / 1000)
    if (secs < 60) return `${secs}s ago`
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
    return `${Math.floor(secs / 3600)}h ago`
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(4,4,12,0.8)] backdrop-blur-xl px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">VPS Instances</h1>
          <p className="mt-1 text-sm text-[rgba(255,255,255,0.4)]">
            {instances.length} instance{instances.length !== 1 ? 's' : ''} connected
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadInstances}
            className="flex items-center gap-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => setAddMode(!addMode)}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)' }}
          >
            <Plus className="w-4 h-4" />
            Add Instance
          </button>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Add Instance Form */}
        {addMode && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[#00D4FF]/20 bg-[rgba(0,212,255,0.05)] p-6 mb-6"
          >
            <h3 className="text-sm font-semibold text-white mb-4">Add New VPS Instance</h3>
            <div className="space-y-3 max-w-xl">
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Instance Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Production VPS — Mumbai"
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#00D4FF]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Cloudflare Tunnel URL</label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  placeholder="https://your-vps.trycloudflare.com"
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#00D4FF]/50 transition-colors font-mono"
                />
              </div>
              {message && <p className="text-xs text-yellow-400">{message}</p>}
              <div className="flex gap-3">
                <button
                  onClick={handleAddInstance}
                  disabled={adding || !newUrl.trim()}
                  className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)' }}
                >
                  {adding ? 'Checking...' : 'Add Instance'}
                </button>
                <button
                  onClick={() => { setAddMode(false); setMessage(''); setNewUrl(''); setNewName('') }}
                  className="rounded-lg border border-[rgba(255,255,255,0.1)] px-5 py-2 text-sm text-white/60 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {message && !addMode && (
          <p className="text-sm text-yellow-400 mb-4">{message}</p>
        )}

        {/* Instances List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
          </div>
        ) : instances.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-12 text-center"
          >
            <p className="text-5xl mb-4">🖥️</p>
            <h3 className="text-lg font-semibold text-white mb-1">No Instances Yet</h3>
            <p className="text-sm text-[rgba(255,255,255,0.35)] mb-4">
              Add your VPS instance to see it here. Each VPS runs its own cloudflared tunnel.
            </p>
            <button
              onClick={() => setAddMode(true)}
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)' }}
            >
              <Plus className="w-4 h-4" />
              Add Your First Instance
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {instances.map((inst) => (
              <motion.div
                key={inst.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-white">{inst.name}</h3>
                      <span className={`flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full ${
                        inst.status === 'online'
                          ? 'bg-green-500/15 text-green-400'
                          : 'bg-red-500/15 text-red-400'
                      }`}>
                        {inst.status === 'online' ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {inst.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3 text-xs text-white/30 font-mono">
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate max-w-md">{inst.tunnel_url}</span>
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 flex-wrap">
                      {inst.openclaw_version && (
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                          <Bot className="w-3.5 h-3.5" />
                          v{inst.openclaw_version}
                        </div>
                      )}
                      {inst.specs?.cpu && (
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                          <Cpu className="w-3.5 h-3.5" />
                          CPU {inst.specs.cpu}
                        </div>
                      )}
                      {inst.specs?.ram_mb > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                          <HardDrive className="w-3.5 h-3.5" />
                          RAM {inst.specs.ram_mb}MB
                        </div>
                      )}
                      <div className="text-xs text-white/25">
                        Last seen {timeSince(inst.last_heartbeat)}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(inst.id)}
                    disabled={deleting === inst.id}
                    className="ml-4 flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/15 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deleting === inst.id ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
