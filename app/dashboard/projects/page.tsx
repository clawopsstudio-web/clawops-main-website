'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Users, Hash, Bot, MoreHorizontal, X, Trash2, Archive, ExternalLink, ChevronRight } from 'lucide-react'
import ChannelSidebar from '@/app/dashboard/components/channel-sidebar'

interface Project {
  id: string
  name: string
  description: string
  color: string
  status: string
  channel_count: number
  member_count: number
  created_at: string
  updated_at: string
}

const PROJECT_COLORS = ['#e8ff47', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4']
const AVATAR_COLORS = ['#e8ff47', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b']

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-[300] px-4 py-3 rounded-xl text-sm font-medium shadow-2xl flex items-center gap-2 animate-fade-in ${
      type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
    }`}>
      <span>{type === 'success' ? '✓' : '✕'}</span> {message}
    </div>
  )
}

function CreateProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (p: Project) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#e8ff47')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => { nameRef.current?.focus() }, [])

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    const { data, error } = await supabase
      .from('projects')
      .insert({ name: name.trim(), description: description.trim(), color })
      .select()
      .single()
    setLoading(false)
    if (!error && data) {
      onCreated({ ...data, channel_count: 1, member_count: 1 } as Project)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-white font-black text-lg">New Project</h2>
            <p className="text-white/30 text-xs mt-0.5">Create a workspace for your team and agents</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          {/* Color picker */}
          <div>
            <label className="text-white/30 text-[10px] uppercase tracking-widest font-semibold block mb-2">Color</label>
            <div className="flex gap-2">
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-[#141414] scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-white/30 text-[10px] uppercase tracking-widest font-semibold block mb-2">Project name *</label>
            <div className="flex items-center gap-2 bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-white/20 transition-colors">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <input
                ref={nameRef}
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="My Awesome Project"
                className="flex-1 bg-transparent text-white/80 text-sm outline-none placeholder:text-white/20"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-white/30 text-[10px] uppercase tracking-widest font-semibold block mb-2">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm outline-none focus:border-white/20 placeholder:text-white/20 resize-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCreate}
              disabled={!name.trim() || loading}
              className="flex-1 py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>Create Project <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
            <button onClick={onClose} className="px-4 py-3 text-white/40 hover:text-white/60 text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project, onSelect, onDelete }: {
  project: Project
  onSelect: (p: Project) => void
  onDelete: (id: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const initials = project.name.slice(0, 2).toUpperCase()
  const agentColors = [project.color, '#3b82f6', '#a855f7']

  return (
    <div className="group relative bg-[#111] border border-white/7 rounded-2xl p-5 hover:border-white/12 transition-all cursor-pointer hover:translate-y-[-2px] hover:shadow-xl hover:shadow-black/30"
      onClick={() => onSelect(project)}>
      {/* Color accent bar */}
      <div className="absolute top-0 left-4 right-4 h-[2px] rounded-b-full opacity-60" style={{ backgroundColor: project.color }} />

      {/* Menu button */}
      <button
        onClick={e => { e.stopPropagation(); setMenuOpen(v => !v) }}
        className="absolute top-4 right-4 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/20 hover:text-white/50 transition-all opacity-0 group-hover:opacity-100"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute top-12 right-4 z-50 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden py-1 min-w-[140px]"
          onClick={e => e.stopPropagation()}>
          <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> Open
          </button>
          <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
            <Archive className="w-3.5 h-3.5" /> Archive
          </button>
          <div className="border-t border-white/5 my-1" />
          <button
            onClick={() => { onDelete(project.id); setMenuOpen(false) }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      )}

      {/* Avatar */}
      <div className="flex items-start gap-3 mb-4 mt-1">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-black font-black text-sm shrink-0"
          style={{ backgroundColor: project.color }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base truncate">{project.name}</h3>
          <p className="text-white/30 text-xs mt-0.5 line-clamp-2">{project.description || 'No description'}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5 text-white/40 text-xs">
          <Users className="w-3.5 h-3.5" />
          <span>{project.member_count} {project.member_count === 1 ? 'member' : 'members'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/40 text-xs">
          <Hash className="w-3.5 h-3.5" />
          <span>{project.channel_count} {project.channel_count === 1 ? 'channel' : 'channels'}</span>
        </div>
      </div>

      {/* Agents preview */}
      <div className="flex items-center gap-2 mb-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/4 border border-white/6">
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-black"
              style={{ backgroundColor: agentColors[i % agentColors.length] }}>
              {['R', 'A', 'H'][i]}
            </div>
            <span className="text-white/40 text-[10px] font-medium">{['Ryan', 'Arjun', 'Helena'][i]}</span>
          </div>
        ))}
        <div className="ml-auto text-[10px] text-white/20 group-hover:text-[#e8ff47]/60 transition-colors">
          Open →
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 pt-3 flex items-center justify-between">
        <span className="text-white/20 text-[10px]">
          {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-white/30 text-[10px]">Active</span>
        </div>
      </div>
    </div>
  )
}

function ProjectDetail({ project, onClose }: { project: Project; onClose: () => void }) {
  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Project header */}
        <div className="px-6 py-5 border-b border-white/5 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-black text-sm shrink-0"
            style={{ backgroundColor: project.color }}
          >
            {project.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-black text-lg">{project.name}</h2>
            <p className="text-white/30 text-xs">{project.description || 'No description'}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <Users className="w-3.5 h-3.5" />
              <span>{project.member_count}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/40 text-xs">
              <Hash className="w-3.5 h-3.5" />
              <span>{project.channel_count}</span>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project content area */}
        <div className="flex-1 flex items-center justify-center text-white/20 text-sm">
          <div className="text-center space-y-2">
            <Hash className="w-8 h-8 mx-auto opacity-30" />
            <p>Select a channel to get started</p>
            <p className="text-white/10 text-xs">Channels appear in the sidebar</p>
          </div>
        </div>
      </div>

      {/* Channel sidebar */}
      <div className="w-60 shrink-0 overflow-hidden">
        <ChannelSidebar projectId={project.id} projectColor={project.color} />
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProjects = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    setLoading(false)

    if (error) {
      showToast('Failed to load projects', 'error')
      return
    }

    // Fetch counts per project
    const enriched = await Promise.all(
      (data ?? []).map(async (p: any) => {
        const [chResult, memResult] = await Promise.all([
          supabase.from('channels').select('id', { count: 'exact', head: true }).eq('project_id', p.id),
          supabase.from('project_members').select('id', { count: 'exact', head: true }).eq('project_id', p.id),
        ])
        return { ...p, channel_count: chResult.count ?? 0, member_count: memResult.count ?? 0 }
      })
    )
    setProjects(enriched)
  }

  useEffect(() => { fetchProjects() }, [])

  const handleCreate = (project: Project) => {
    setProjects(prev => [project, ...prev])
    showToast(`"${project.name}" created!`, 'success')
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('projects').update({ status: 'deleted' }).eq('id', id)
    if (!error) {
      setProjects(prev => prev.filter(p => p.id !== id))
      showToast('Project deleted', 'success')
    } else {
      showToast('Failed to delete project', 'error')
    }
  }

  // Detail view
  if (selectedProject) {
    const current = projects.find(p => p.id === selectedProject.id) ?? selectedProject
    return (
      <div className="h-[calc(100vh-44px)] flex flex-col">
        <ProjectDetail project={current} onClose={() => setSelectedProject(null)} />
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-44px)]">
      {/* Page header */}
      <div className="px-8 pt-8 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-white font-black text-2xl">Projects</h1>
          <p className="text-white/30 text-sm mt-1">
            {loading ? '...' : `${projects.length} workspace${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Projects grid */}
      <div className="px-8 pb-10">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#111] border border-white/7 rounded-2xl p-5 animate-pulse">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/5 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-3 bg-white/5 rounded w-1/3 mb-3" />
                <div className="flex gap-2">
                  <div className="h-6 bg-white/5 rounded w-16" />
                  <div className="h-6 bg-white/5 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#111] border border-white/7 flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-white/20" />
            </div>
            <h3 className="text-white font-bold text-base mb-1">No projects yet</h3>
            <p className="text-white/30 text-sm mb-6">Create your first workspace to organize channels and agents</p>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onSelect={setSelectedProject}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreate}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
