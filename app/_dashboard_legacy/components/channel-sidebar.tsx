'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Plus, Settings, ChevronDown, ChevronRight, Hash, Lock, GripVertical, X } from 'lucide-react'

interface Channel {
  id: string
  project_id: string
  name: string
  description: string
  icon: string
  sort_order: number
  is_private: boolean
  created_at: string
  updated_at: string
}

interface ChannelSidebarProps {
  projectId: string
  projectColor?: string
}

const PROJECT_COLORS = ['#e8ff47', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4']

export default function ChannelSidebar({ projectId, projectColor = '#e8ff47' }: ChannelSidebarProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [addDesc, setAddDesc] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsChannel, setSettingsChannel] = useState<Channel | null>(null)
  const supabase = createClient()
  const addRef = useRef<HTMLInputElement>(null)

  // Fetch channels on mount / project change
  const fetchChannels = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('channels')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })
    setChannels(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchChannels()
  }, [projectId])

  // Focus input when add panel opens
  useEffect(() => {
    if (showAdd) addRef.current?.focus()
  }, [showAdd])

  // ── Create channel ──────────────────────────────────────
  const handleCreate = async () => {
    if (!addName.trim()) return
    const { data, error } = await supabase
      .from('channels')
      .insert({ project_id: projectId, name: addName.trim().toLowerCase().replace(/\s+/g, '-'), description: addDesc.trim() })
      .select()
      .single()
    if (!error && data) {
      setChannels(prev => [...prev, data])
      setAddName('')
      setAddDesc('')
      setShowAdd(false)
    }
  }

  // ── Update channel ───────────────────────────────────────
  const handleUpdate = async () => {
    if (!editingId || !editName.trim()) return
    const { data, error } = await supabase
      .from('channels')
      .update({ name: editName.trim().toLowerCase().replace(/\s+/g, '-'), description: editDesc.trim(), updated_at: new Date().toISOString() })
      .eq('id', editingId)
      .select()
      .single()
    if (!error && data) {
      setChannels(prev => prev.map(c => c.id === editingId ? data : c))
    }
    setEditingId(null)
  }

  // ── Delete channel ───────────────────────────────────────
  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('channels').delete().eq('id', id)
    if (!error) setChannels(prev => prev.filter(c => c.id !== id))
    setSettingsOpen(false)
    setSettingsChannel(null)
  }

  // ── Drag to reorder ──────────────────────────────────────
  const handleDragStart = (id: string) => setDraggingId(id)
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    setDragOverId(id)
  }
  const handleDrop = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null)
      setDragOverId(null)
      return
    }
    const dragIdx = channels.findIndex(c => c.id === draggingId)
    const overIdx = channels.findIndex(c => c.id === targetId)
    if (dragIdx === -1 || overIdx === -1) return

    const reordered = [...channels]
    const [moved] = reordered.splice(dragIdx, 1)
    reordered.splice(overIdx, 0, moved)
    setChannels(reordered)

    // Persist new sort orders
    const updates = reordered.map((ch, i) => ({ id: ch.id, sort_order: i }))
    await supabase.from('channels').upsert(updates)

    setDraggingId(null)
    setDragOverId(null)
  }

  return (
    <div className="flex flex-col h-full bg-[#111] border-r border-white/5 text-white">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: projectColor }} />
          <span className="text-white/80 font-semibold text-sm">Channels</span>
          <span className="text-white/20 text-xs">({channels.length})</span>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="w-6 h-6 rounded-md bg-white/8 hover:bg-white/15 flex items-center justify-center text-white/40 hover:text-white transition-all"
          title="Add channel"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Add channel form */}
      {showAdd && (
        <div className="px-3 py-3 border-b border-white/5 bg-[#0d0d0d] space-y-2">
          <p className="text-white/30 text-[10px] uppercase tracking-widest font-semibold">New channel</p>
          <div className="flex items-center gap-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg px-2.5 py-1.5">
            <span className="text-white/40 text-sm">#</span>
            <input
              ref={addRef}
              value={addName}
              onChange={e => setAddName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="channel-name"
              className="flex-1 bg-transparent text-white/80 text-sm outline-none placeholder:text-white/20"
            />
          </div>
          <input
            value={addDesc}
            onChange={e => setAddDesc(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Description (optional)"
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1.5 text-white/60 text-xs outline-none focus:border-white/20 placeholder:text-white/20"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex-1 py-1.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-xs rounded-lg transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => { setShowAdd(false); setAddName(''); setAddDesc('') }}
              className="px-3 py-1.5 text-white/40 hover:text-white/60 text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
        {loading ? (
          <div className="text-center text-white/20 text-xs py-8">Loading...</div>
        ) : channels.length === 0 ? (
          <div className="text-center text-white/20 text-xs py-8">No channels yet</div>
        ) : (
          channels.map(channel => (
            <div
              key={channel.id}
              draggable
              onDragStart={() => handleDragStart(channel.id)}
              onDragOver={e => handleDragOver(e, channel.id)}
              onDrop={() => handleDrop(channel.id)}
              onDragEnd={() => { setDraggingId(null); setDragOverId(null) }}
              className={[
                'group relative flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all',
                dragOverId === channel.id ? 'bg-white/10 ring-1 ring-white/20' : 'hover:bg-white/5',
                draggingId === channel.id ? 'opacity-40' : 'opacity-100',
              ].join(' ')}
              onClick={() => {
                if (editingId === channel.id) return
                // Could navigate to channel view here
              }}
            >
              {/* Drag handle */}
              <div className="opacity-0 group-hover:opacity-40 transition-opacity cursor-grab active:cursor-grabbing shrink-0">
                <GripVertical className="w-3 h-3 text-white" />
              </div>

              {/* Channel icon */}
              <span className="text-white/30 text-sm font-mono shrink-0">
                {channel.is_private ? '🔒' : '#'}
              </span>

              {/* Channel name (or inline edit) */}
              {editingId === channel.id ? (
                <input
                  autoFocus
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleUpdate(); if (e.key === 'Escape') setEditingId(null) }}
                  onBlur={handleUpdate}
                  className="flex-1 bg-[#1a1a1a] border border-white/20 rounded px-2 py-0.5 text-sm text-white outline-none"
                />
              ) : (
                <span className="text-white/70 text-sm flex-1 truncate font-mono">{channel.name}</span>
              )}

              {/* Actions (visible on hover) */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
                <button
                  onClick={e => { e.stopPropagation(); setEditingId(channel.id); setEditName(channel.name); setEditDesc(channel.description) }}
                  className="w-5 h-5 rounded flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-all text-[10px]"
                  title="Rename"
                >
                  ✎
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setSettingsChannel(channel); setSettingsOpen(true) }}
                  className="w-5 h-5 rounded flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                  title="Settings"
                >
                  <Settings className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Channel settings modal */}
      {settingsOpen && settingsChannel && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4" onClick={() => setSettingsOpen(false)}>
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-sm">#{settingsChannel.name}</h3>
              <button onClick={() => setSettingsOpen(false)} className="text-white/30 hover:text-white/60">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-white/30 text-[10px] uppercase tracking-widest block mb-1">Name</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-white/80 text-sm outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="text-white/30 text-[10px] uppercase tracking-widest block mb-1">Description</label>
                <input
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="What is this channel about?"
                  className="w-full bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-white/80 text-sm outline-none focus:border-white/20 placeholder:text-white/20"
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-white/50 text-sm">Private</span>
                <button
                  onClick={async () => {
                    await supabase.from('channels').update({ is_private: !settingsChannel.is_private, updated_at: new Date().toISOString() }).eq('id', settingsChannel.id)
                    setSettingsChannel({ ...settingsChannel, is_private: !settingsChannel.is_private })
                    setChannels(prev => prev.map(c => c.id === settingsChannel.id ? { ...c, is_private: !c.is_private } : c))
                  }}
                  className={`w-10 h-5 rounded-full transition-colors relative ${settingsChannel.is_private ? 'bg-emerald-500' : 'bg-white/10'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${settingsChannel.is_private ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={async () => { await handleUpdate(); setSettingsOpen(false) }}
                className="flex-1 py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-xs rounded-xl transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => handleDelete(settingsChannel.id)}
                className="px-4 py-2 text-red-400/70 hover:text-red-400 text-xs border border-red-400/20 hover:border-red-400/40 rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
