'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import DashboardSidebar from '@/components/ui/DashboardSidebar'
import { motion } from 'framer-motion'

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

interface DashboardData {
  profile: Profile | null
  tasks: Task[]
  tasksTotal: number
  pendingTasks: number
  completedTasks: number
  instances: Instance[]
  activeAgents: number
  userEmail?: string
}

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-400',
  medium: 'text-yellow-400',
  low: 'text-green-400',
}

const STATUS_BADGES: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  in_progress: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
  tracked: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  running: 'bg-green-500/20 text-green-400 border-green-500/30',
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  const [tasks, setTasks] = useState<Task[]>(data.tasks)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState('medium')
  const [addingTask, setAddingTask] = useState(false)
  const [instances] = useState<Instance[]>(data.instances)

  const pendingTasks = tasks.filter((t) => t.status === 'pending').length

  const addTask = async () => {
    if (!newTaskTitle.trim()) return
    setAddingTask(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        title: newTaskTitle.trim(),
        priority: newTaskPriority,
        status: 'pending',
      })
      .select()
      .single()
    
    if (!error && task) {
      setTasks([task, ...tasks])
      setNewTaskTitle('')
    }
    setAddingTask(false)
  }

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const { data: updated, error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id)
      .select()
      .single()
    
    if (!error && updated) {
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)))
    }
  }

  const quickLinks = [
    { label: 'Chrome DevTools', href: 'https://vmi3094584-1.tailec7a72.ts.net/chrome/', color: 'cyan' },
    { label: 'n8n Workflows', href: 'https://vmi3094584-1.tailec7a72.ts.net/n8n/', color: 'purple' },
    { label: 'Paperclip', href: 'http://localhost:3100', color: 'orange' },
    { label: 'Gateway', href: 'https://vmi3094584-1.tailec7a72.ts.net/gateway/', color: 'gray' },
  ]

  const colorClasses: Record<string, string> = {
    cyan: 'bg-cyan-600 hover:bg-cyan-500',
    purple: 'bg-purple-600 hover:bg-purple-500',
    orange: 'bg-orange-600 hover:bg-orange-500',
    gray: 'bg-gray-700 hover:bg-gray-600',
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <DashboardSidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            {data.profile?.full_name 
              ? `Welcome back, ${data.profile.full_name.split(' ')[0]}` 
              : 'Welcome to your Dashboard'}
          </h1>
          {data.profile?.company && (
            <p className="text-gray-400 mt-1">{data.profile.company}</p>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Active Agents" value={data.activeAgents} icon="🤖" />
          <StatCard label="Pending Tasks" value={pendingTasks} icon="📋" color="yellow" />
          <StatCard label="Completed" value={data.completedTasks} icon="✅" color="green" />
          <StatCard label="VPS Instances" value={instances.length} icon="🖥️" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Task */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold mb-3">Quick Add Task</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTask()}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-cyan-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button
                  onClick={addTask}
                  disabled={addingTask || !newTaskTitle.trim()}
                  className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {addingTask ? '...' : 'Add'}
                </button>
              </div>
            </motion.div>

            {/* Task List */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
              {tasks.length === 0 ? (
                <p className="text-gray-500 text-sm">No tasks yet. Add one above to get started.</p>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors group"
                    >
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                          task.status === 'completed'
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-600 hover:border-cyan-500'
                        }`}
                      >
                        {task.status === 'completed' && (
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className={`flex-1 text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
                        {task.priority}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_BADGES[task.status] || STATUS_BADGES.pending}`}>
                        {task.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* VPS Instances */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold mb-4">VPS Instances</h3>
              {instances.length === 0 ? (
                <div>
                  <p className="text-gray-500 text-sm mb-3">No instances tracked yet.</p>
                  <a href="/dashboard/mission-control" className="text-cyan-400 text-sm hover:underline">
                    Add your first instance →
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {instances.map((inst) => (
                    <div key={inst.id} className="p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{inst.name || 'Unnamed'}</span>
                        <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_BADGES[inst.status] || STATUS_BADGES.tracked}`}>
                          {inst.status}
                        </span>
                      </div>
                      {inst.ip_v4 && (
                        <p className="text-xs text-gray-500 font-mono">{inst.ip_v4}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5"
            >
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${colorClasses[link.color]} px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, icon, color = 'cyan' }: { label: string; value: number; icon: string; color?: string }) {
  const colorMap: Record<string, string> = {
    cyan: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20',
    yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-500/20',
    green: 'from-green-500/10 to-green-500/5 border-green-500/20',
    gray: 'from-gray-500/10 to-gray-500/5 border-gray-500/20',
  }
  const textMap: Record<string, string> = {
    cyan: 'text-cyan-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    gray: 'text-gray-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-5`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${textMap[color]}`}>{value}</p>
    </motion.div>
  )
}
