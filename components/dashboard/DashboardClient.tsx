'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  status: string
  priority: string
  created_at: string
}

interface Instance {
  id: string
  name: string
  ip_v4: string
  product_id: string
  status: string
}

interface Profile {
  full_name: string
  company: string
  avatar_url: string
}

interface AgentInfo {
  name: string
  sessionCount: number
  lastSeen: string
  model: string
}

interface OpenClawData {
  agents: AgentInfo[]
  totalAgents: number
  activeAgents: number
  system: {
    cpuUsage?: number
    memory?: { used_mb?: number; total_mb?: number }
    diskUsage?: string
    uptime?: string
  }
  cronJobs: any[]
  openclawVersion: string
}

interface DashboardData {
  profile: Profile | null
  tasks: Task[]
  tasksTotal: number
  pendingTasks: number
  completedTasks: number
  instances: Instance[]
  activeAgents: number
  openclaw: OpenClawData | null
  userEmail?: string
  userId?: string
}

// Agent roster — matches OpenClaw gateway config (agents.list in openclaw.json)
const AGENT_TEAM = [
  { name: 'Henry', role: 'Co-Founder & Chief AI Officer', color: '#00D4FF', topic: 'Telegram DM', model: 'gemini-3.1-flash-lite' },
  { name: 'Ryan', role: 'Sales Pipeline', color: '#22c55e', topic: 'Telegram #25', model: 'gpt-5.4' },
  { name: 'Arjun', role: 'Market Research', color: '#f59e0b', topic: 'Telegram #26', model: 'gpt-5.4' },
  { name: 'Dev', role: 'Core Build & Coding', color: '#a855f7', topic: 'Telegram #27', model: 'gpt-5.4' },
  { name: 'Dave', role: 'DevOps & Backend', color: '#ef4444', topic: 'Telegram #29', model: 'gpt-5.4' },
  { name: 'Kyle', role: 'Frontend & Web', color: '#3b82f6', topic: 'Telegram #30', model: 'gpt-5.4' },
  { name: 'Tyler', role: 'Marketing & SEO', color: '#ec4899', topic: 'Telegram #31', model: 'gpt-5.4' },
  { name: 'Hermes', role: 'Customer Support', color: '#10b981', topic: 'Dashboard Chat', model: 'TBD' },
]

// Real models from our openclaw.json config
const MODEL_OPTIONS = [
  { name: 'Claude Opus 4.6', provider: 'CodeMax Pro', color: '#FF6B35', context: '180K' },
  { name: 'Claude Sonnet 4.6', provider: 'CodeMax Pro', color: '#FF6B35', context: '180K' },
  { name: 'gemini-3.1-flash-lite', provider: 'Google AI', color: '#00D4FF', context: '128K' },
  { name: 'GPT-5.4', provider: 'OpenAI Codex', color: '#10b981', context: '128K' },
  { name: 'minimax-m2.7', provider: 'NVIDIA', color: '#76B900', context: '16K' },
  { name: 'DeepSeek V3.2', provider: 'NVIDIA', color: '#FF4B4B', context: '16K' },
  { name: 'GLM-4.7-flash', provider: 'OpenRouter', color: '#6600FF', context: '128K' },
  { name: 'Qwen3 Coder', provider: 'OpenRouter', color: '#EC4899', context: '32K' },
]

const PRIORITY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  high:   { text: 'text-red-400',    bg: 'bg-red-500/15',    border: 'border-red-500/30' },
  medium: { text: 'text-yellow-400', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30' },
  low:    { text: 'text-green-400',  bg: 'bg-green-500/15',  border: 'border-green-500/30' },
}

const STATUS_BADGES: Record<string, string> = {
  pending:     'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  in_progress: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  completed:   'bg-green-500/15 text-green-400 border-green-500/30',
  tracked:     'bg-gray-500/15 text-gray-400 border-gray-500/30',
  running:     'bg-green-500/15 text-green-400 border-green-500/30',
}

export default function DashboardClient({ data }: { data: DashboardData }) {

  const INTEGRATIONS = [
    { name: 'n8n', icon: '⚙️', color: '#EA4B71', desc: 'Workflow automation & webhooks', href: data.userId ? `/dashboard/${data.userId}/n8n` : '#', badge: 'Automation' },
    { name: 'Chrome Browser', icon: '🌐', color: '#00D4FF', desc: 'Visual browser + CDP automation', href: data.userId ? `/dashboard/${data.userId}/chrome` : '#', badge: 'Browser' },
    { name: 'Gateway', icon: '🤖', color: '#10b981', desc: 'OpenClaw Control UI & agents', href: data.userId ? `/dashboard/${data.userId}/metaclaw` : '#', badge: 'AI Gateway' },
  ]

  const quickLinks = [
    { label: 'n8n', href: data.userId ? `/dashboard/${data.userId}/n8n` : '#', color: '#EA4B71', desc: 'Workflows', icon: '⚙️' },
    { label: 'Chrome Browser', href: data.userId ? `/dashboard/${data.userId}/chrome` : '#', color: '#00D4FF', desc: 'Browser VNC', icon: '🌐' },
    { label: 'Ops Panel', href: '/ops/', color: '#FF6B35', desc: 'Health, logs, config', icon: '🚀', external: true },
    { label: 'Mission Control', href: '/dashboard/mission-control', color: '#10b981', desc: 'Gateway management', icon: '🎯' },
    { label: 'Skills Library', href: '/dashboard/skills-library', color: '#6600FF', desc: '5400+ skills', icon: '🧠' },
    { label: 'Guides', href: '/guides', color: '#4285F4', desc: 'Step-by-step docs', icon: '📚' },
  ]

  const [tasks, setTasks] = useState<Task[]>(data.tasks)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [addingTask, setAddingTask] = useState(false)
  const [instances] = useState<Instance[]>(data.instances)

  const pendingTasks = tasks.filter((t) => t.status === 'pending').length

  // Map real agent names to their role info
  const getAgentRole = (name: string) => AGENT_TEAM.find(a => a.name.toLowerCase() === name.toLowerCase())
  const isAgentActive = (name: string) =>
    data.openclaw?.agents.some(a => a.name.toLowerCase() === name.toLowerCase())

  const addTask = async () => {
    if (!newTaskTitle.trim()) return
    setAddingTask(true)
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({ title: newTaskTitle.trim(), priority: newTaskPriority, status: 'pending' })
      .select().single()
    if (!error && task) { setTasks([task, ...tasks]); setNewTaskTitle('') }
    setAddingTask(false)
  }

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const { data: updated, error } = await supabase
      .from('tasks').update({ status: newStatus }).eq('id', task.id).select().single()
    if (!error && updated) setTasks(tasks.map((t) => t.id === task.id ? updated : t))
  }

  const deleteTask = async (task: Task) => {
    await supabase.from('tasks').delete().eq('id', task.id)
    setTasks(tasks.filter((t) => t.id !== task.id))
  }

  return (
    <>
      {/* No <main> here — DashboardShell already provides the scrollable <main> wrapper */}
        {/* Header */}
        <div className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(4,4,12,0.8)] backdrop-blur-xl px-8 py-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-2xl font-bold text-white">
              {data.profile?.full_name ? `Welcome back, ${data.profile.full_name.split(' ')[0]}` : 'Your AI Dashboard'}
            </h1>
            <p className="mt-1 text-sm text-[rgba(255,255,255,0.4)]">
              {data.profile?.company ? `${data.profile.company} · ` : ''}{data.userEmail}
            </p>
          </motion.div>
        </div>

        <div className="px-8 py-6 space-y-6">

          {/* Agent Team — most important section */}
          <div>
            <h2 className="text-xs font-semibold text-[rgba(255,255,255,0.3)] uppercase tracking-wider mb-3">
              AI Team
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {AGENT_TEAM.map((agent, i) => {
                const active = isAgentActive(agent.name)
                return (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group rounded-xl border bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] transition-all overflow-hidden"
                    style={{ borderColor: `${agent.color}25` }}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: `${agent.color}20`, color: agent.color }}>
                            {agent.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{agent.name}</p>
                            <p className="text-[10px] text-[rgba(255,255,255,0.3)]">{agent.topic}</p>
                          </div>
                        </div>
                        <div className={`h-2 w-2 rounded-full flex-shrink-0 ${active ? 'bg-green-400' : 'bg-white/20'}`}
                          style={active ? { boxShadow: '0 0 6px #22c55e' } : {}} />
                      </div>
                      <p className="text-xs text-[rgba(255,255,255,0.4)]">{agent.role}</p>
                    </div>
                    <div className="px-4 py-2 border-t" style={{ borderColor: `${agent.color}15` }}>
                      <p className="text-[10px] text-[rgba(255,255,255,0.2)] font-mono truncate">{agent.model}</p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Integration Status */}
          <div>
            <h2 className="text-xs font-semibold text-[rgba(255,255,255,0.3)] uppercase tracking-wider mb-3">
              Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INTEGRATIONS.map((int, i) => (
                <motion.div
                  key={int.name}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                >
                  <Link href={int.href || '/dashboard/settings?tab=integrations'}>
                    <div className="group relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5 hover:border-[rgba(255,255,255,0.15)] transition-all hover:-translate-y-0.5 cursor-pointer">
                      <div className="pointer-events-none absolute inset-0 opacity-20"
                        style={{ background: `radial-gradient(circle at 100% 0%, ${int.color}30, transparent 60%)` }} />
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{int.icon}</span>
                            <div>
                              <p className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">{int.name}</p>
                              <p className="text-xs text-[rgba(255,255,255,0.4)]">{int.desc}</p>
                            </div>
                          </div>
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium border border-green-500/30">Connected</span>
                        </div>
                        <p className="text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Click to open →</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'AI Agents', value: data.openclaw?.activeAgents ?? data.activeAgents, icon: '🤖', color: '#00D4FF', sub: `of ${data.openclaw?.totalAgents ?? 8} total` },
              { label: 'Pending Tasks', value: pendingTasks, icon: '📋', color: '#FFB800', sub: '' },
              { label: 'Completed', value: data.completedTasks, icon: '✅', color: '#00FF88', sub: '' },
              { label: 'Skills Installed', value: 0, icon: '🧠', color: '#10b981', sub: '' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                className="relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5"
              >
                <div className="pointer-events-none absolute inset-0 opacity-30"
                  style={{ background: `radial-gradient(circle at 100% 0%, ${stat.color}15, transparent 60%)` }} />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{stat.icon}</span>
                    <span className="text-xs text-[rgba(255,255,255,0.4)]">{stat.label}</span>
                  </div>
                  <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  {stat.sub && <p className="text-[10px] text-[rgba(255,255,255,0.3)] mt-0.5">{stat.sub}</p>}
                </div>
              </motion.div>
            ))}
          </div>

          {/* AI Models */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
          >
            <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
              <h2 className="text-sm font-semibold text-white">AI Models Available</h2>
              <p className="text-xs text-[rgba(255,255,255,0.35)]">Configured in OpenClaw gateway — agents select the best model per task</p>
            </div>
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {MODEL_OPTIONS.map((model) => (
                <div key={model.name} className="flex items-center gap-2.5 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2.5">
                  <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: model.color, boxShadow: `0 0 6px ${model.color}` }} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">{model.name}</p>
                    <p className="text-[10px] text-[rgba(255,255,255,0.3)]">{model.provider} · {model.context} ctx</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* OpenClaw Gateway Status */}
          {data.openclaw && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
            >
              <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">Gateway Status</h2>
                  <p className="text-xs text-[rgba(255,255,255,0.35)]">
                    OpenClaw v{data.openclaw.openclawVersion} · {data.openclaw.system.uptime || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px #22c55e' }} />
                    {data.openclaw.activeAgents} active
                  </span>
                  <span className="text-white/20">·</span>
                  <span className="text-white/40">{data.openclaw.totalAgents} total</span>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="rounded-lg bg-white/3 px-3 py-2 text-center">
                    <p className="text-xs text-white/40 mb-0.5">CPU</p>
                    <p className="text-sm font-semibold" style={{ color: (data.openclaw.system.cpuUsage || 0) > 80 ? '#ef4444' : '#00D4FF' }}>
                      {data.openclaw.system.cpuUsage?.toFixed(1) || '—'}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/3 px-3 py-2 text-center">
                    <p className="text-xs text-white/40 mb-0.5">Memory</p>
                    <p className="text-sm font-semibold text-[#10b981]">
                      {data.openclaw.system.memory ? `${data.openclaw.system.memory.used_mb}/${data.openclaw.system.memory.total_mb}MB` : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/3 px-3 py-2 text-center">
                    <p className="text-xs text-white/40 mb-0.5">Disk</p>
                    <p className="text-sm font-semibold text-[#FFB800]">{data.openclaw.system.diskUsage || '—'}</p>
                  </div>
                </div>
                {data.openclaw.agents.length === 0 ? (
                  <p className="text-xs text-white/30 text-center py-4">No active agent sessions</p>
                ) : (
                  <div className="space-y-1.5">
                    {data.openclaw.agents.map((agent) => {
                      const role = getAgentRole(agent.name)
                      return (
                        <div key={agent.name} className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] px-3 py-2">
                          <div className="flex items-center gap-2.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-400 flex-shrink-0" style={{ boxShadow: '0 0 4px #22c55e' }} />
                            <span className="text-xs font-medium text-white">{agent.name}</span>
                            {role && <span className="text-[10px] text-[rgba(255,255,255,0.3)]">· {role.role}</span>}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-white/30">
                            <span>{agent.sessionCount} sessions</span>
                            {agent.model && agent.model !== 'default' && (
                              <span className="px-1.5 py-0.5 rounded bg-[#00D4FF]/10 text-[#00D4FF]/70">{agent.model}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                {data.openclaw.cronJobs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
                    <p className="text-[10px] text-white/30 mb-1.5">Active Cron Jobs</p>
                    {data.openclaw.cronJobs.filter((j: any) => j.enabled).slice(0, 3).map((job: any) => (
                      <div key={job.id} className="flex items-center gap-2 text-[10px] text-white/40 py-0.5">
                        <span className="h-1 w-1 rounded-full bg-[#FFB800]" />
                        {job.name} · {job.schedule?.expr || '—'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tasks */}
            <div className="lg:col-span-2 space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
              >
                <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
                  <h2 className="text-sm font-semibold text-white">Quick Add Task</h2>
                </div>
                <div className="p-5">
                  <div className="flex gap-2">
                    <input type="text" placeholder="What needs to be done?"
                      value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTask()}
                      className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[rgba(255,255,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors" />
                    <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors">
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </select>
                    <button onClick={addTask} disabled={addingTask || !newTaskTitle.trim()}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)' }}>
                      {addingTask ? '...' : 'Add'}
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
              >
                <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">Recent Tasks</h2>
                  <span className="text-xs text-[rgba(255,255,255,0.3)]">{tasks.length} total</span>
                </div>
                <div className="p-5">
                  {tasks.length === 0 ? (
                    <p className="text-sm text-[rgba(255,255,255,0.25)] text-center py-8">No tasks yet. Add one above to get started.</p>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence>
                        {tasks.slice(0, 8).map((task) => {
                          const p = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium
                          return (
                            <motion.div key={task.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                              className="group flex items-center gap-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3 hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                              <button onClick={() => toggleTaskStatus(task)}
                                className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-[rgba(255,255,255,0.2)] hover:border-[rgba(0,212,255,0.5)]'}`}>
                                {task.status === 'completed' && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </button>
                              <span className={`flex-1 text-sm ${task.status === 'completed' ? 'line-through text-[rgba(255,255,255,0.3)]' : 'text-white'}`}>{task.title}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded border ${p.bg} ${p.text} ${p.border}`}>{task.priority}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded border ${STATUS_BADGES[task.status] || STATUS_BADGES.pending}`}>{task.status}</span>
                              <button onClick={() => deleteTask(task)} className="opacity-0 group-hover:opacity-100 transition-opacity text-[rgba(255,255,255,0.2)] hover:text-red-400 text-xs">✕</button>
                            </motion.div>
                          )
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {/* Skills Library CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                className="overflow-hidden rounded-xl border border-[rgba(102,0,255,0.3)] bg-[rgba(102,0,255,0.05)]"
              >
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">🧠</span>
                    <h2 className="text-sm font-semibold text-white">Skills Library</h2>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[rgba(102,0,255,0.2)] text-purple-400 font-medium">5400+</span>
                  </div>
                  <p className="text-xs text-[rgba(255,255,255,0.4)] mb-3">Install pre-built AI skills for GHL, n8n, Google Workspace, and more.</p>
                  <Link href="/dashboard/skills-library"
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(135deg, #6600FF, #00D4FF)', boxShadow: '0 0 20px rgba(102,0,255,0.25)' }}>
                    Browse Skills →
                  </Link>
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.45 }}
                className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
              >
                <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-4">
                  <h2 className="text-sm font-semibold text-white">Quick Access</h2>
                </div>
                <div className="p-5 grid grid-cols-2 gap-2">
                  {quickLinks.map((link) => (
                    <a key={link.label} href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="group flex items-center gap-2.5 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] px-3 py-3 transition-all hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)] hover:-translate-y-0.5">
                      <span className="text-base">{link.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white group-hover:text-cyan-400 transition-colors">{link.label}</p>
                        <p className="text-[10px] text-[rgba(255,255,255,0.3)]">{link.desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* VPS Instances */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]"
              >
                <div className="border-b border-[rgba(255,255,255,0.06)] px-5 py-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">VPS Instances</h2>
                  <a href="/ops/" target="_blank" rel="noopener noreferrer" className="text-xs text-[#00D4FF] hover:underline">Manage →</a>
                </div>
                <div className="p-5">
                  {instances.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-[rgba(255,255,255,0.25)] mb-3">No instances tracked yet.</p>
                      <a href="/ops/" target="_blank" rel="noopener noreferrer" className="text-xs text-[#00D4FF] hover:underline">Open Ops Panel →</a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {instances.map((inst) => (
                        <div key={inst.id} className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-white">{inst.name || 'Unnamed'}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded border ${STATUS_BADGES[inst.status] || STATUS_BADGES.tracked}`}>{inst.status}</span>
                          </div>
                          {inst.ip_v4 && <p className="text-xs text-[rgba(255,255,255,0.3)] font-mono">{inst.ip_v4}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
    </>
  )
}
