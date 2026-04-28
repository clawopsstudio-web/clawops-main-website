'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Task {
  id: string
  agent_id: string
  title: string
  status: string
  created_at: string
  completed_at: string | null
}

interface Agent {
  id: string
  agent_name: string
  agent_role: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [agents, setAgents] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch agents
        const { data: agentsData } = await supabase.from('vps_agents').select('id, agent_name')
        if (agentsData) {
          const map: Record<string, string> = {}
          agentsData.forEach(a => { map[a.id] = a.agent_name })
          setAgents(map)
        }

        // Fetch tasks from mission_logs
        const { data: tasksData } = await supabase
          .from('mission_logs')
          .select('*')
          .order('started_at', { ascending: false })
          .limit(50)
        
        if (tasksData) {
          setTasks(tasksData.map(t => ({
            id: t.id,
            agent_id: t.agent_id || '',
            title: t.mission_type || 'Task',
            status: t.status || 'pending',
            created_at: t.started_at || t.created_at,
            completed_at: t.completed_at,
          })))
        }
      } catch (e) {
        console.log('No tasks yet')
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400'
      case 'running': return 'bg-blue-500/10 text-blue-400'
      case 'failed': return 'bg-red-500/10 text-red-400'
      default: return 'bg-white/10 text-white/50'
    }
  }

  const getAgentName = (agentId: string) => agents[agentId] || 'Agent'

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  if (loading) return (
    <div className="p-6 text-white/50 text-sm">Loading tasks...</div>
  )

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-white font-bold text-xl">Tasks</h1>
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
          {['all', 'running', 'completed', 'failed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs capitalize ${
                filter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/70'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#111] border border-white/10 rounded-xl p-12 text-center">
            <div className="text-4xl mb-3">📋</div>
            <h3 className="text-white font-semibold mb-1">No tasks yet</h3>
            <p className="text-white/40 text-sm">Create a task by chatting with your agents</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="bg-[#111] border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${
                  task.status === 'completed' ? 'bg-emerald-400' :
                  task.status === 'running' ? 'bg-blue-400 animate-pulse' :
                  task.status === 'failed' ? 'bg-red-400' : 'bg-white/30'
                }`} />
                <div>
                  <p className="text-white font-medium text-sm">{task.title}</p>
                  <p className="text-white/40 text-xs">{getAgentName(task.agent_id)} • {timeAgo(task.created_at)}</p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full ${statusBadge(task.status)}`}>
                {task.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
