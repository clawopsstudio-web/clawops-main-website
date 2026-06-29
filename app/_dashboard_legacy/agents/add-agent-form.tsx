'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Tool {
  id: string
  name: string
  display_name: string
  icon: string
  category: string
}

interface AgentFormProps {
  workspaceId: string
  onSuccess: () => void
  onCancel: () => void
}

const ROLE_OPTIONS = [
  { value: 'sales', label: 'Sales Agent', description: 'Lead generation, outreach, deal closing' },
  { value: 'research', label: 'Research Agent', description: 'Market intel, competitor analysis, data gathering' },
  { value: 'marketing', label: 'Marketing Agent', description: 'Content creation, campaigns, social media' },
  { value: 'devops', label: 'DevOps Agent', description: 'Infrastructure, deployments, monitoring' },
  { value: 'general', label: 'General Assistant', description: 'All-purpose helper for any task' },
]

const COLOR_OPTIONS = [
  { value: '#22c55e', label: 'Green' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#f97316', label: 'Orange' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#ef4444', label: 'Red' },
]

const MODEL_OPTIONS = [
  { value: 'auto', label: 'Auto (default)' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus' },
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  { value: 'llama-3-70b', label: 'Llama 3 70B' },
]

export default function AddAgentForm({ workspaceId, onSuccess, onCancel }: AgentFormProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('general')
  const [model, setModel] = useState('auto')
  const [color, setColor] = useState('#6366f1')
  const [description, setDescription] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [availableTools, setAvailableTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function loadTools() {
      const { data } = await supabase
        .from('tools')
        .select('*')
        .eq('enabled', true)
        .order('category', { ascending: true })

      if (data) setAvailableTools(data)
    }
    loadTools()
  }, [])

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Agent name is required')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name: name.trim(),
          role,
          model: model !== 'auto' ? model : null,
          profile: role === 'general' ? 'default' : role,
          description: description.trim() || null,
          systemPrompt: systemPrompt.trim() || null,
          color,
          toolIds: selectedTools,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create agent')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div 
        className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold text-white">Add New Agent</h2>
            <p className="text-white/50 text-sm mt-1">Configure your AI agent</p>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Ryan, Arjun, Helena"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/20"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Role *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {ROLE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      role === opt.value
                        ? 'border-[#e8ff47] bg-[#e8ff47]/5'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <p className={`font-medium ${role === opt.value ? 'text-[#e8ff47]' : 'text-white'}`}>
                      {opt.label}
                    </p>
                    <p className="text-white/40 text-xs mt-0.5">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setColor(opt.value)}
                    className={`w-10 h-10 rounded-xl transition-all ${
                      color === opt.value
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#141414]'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: opt.value }}
                    title={opt.label}
                  />
                ))}
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Model
              </label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20"
              >
                {MODEL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} className="bg-[#1a1a1a]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="What this agent specializes in..."
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/20 resize-none"
              />
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                System Prompt
              </label>
              <textarea
                value={systemPrompt}
                onChange={e => setSystemPrompt(e.target.value)}
                placeholder="Custom instructions for this agent..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/20 resize-none"
              />
            </div>

            {/* Tools */}
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Assign Tools
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {availableTools.map(tool => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => toggleTool(tool.id)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      selectedTools.includes(tool.id)
                        ? 'border-[#e8ff47] bg-[#e8ff47]/5'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tool.icon}</span>
                      <span className={`text-sm ${selectedTools.includes(tool.id) ? 'text-[#e8ff47]' : 'text-white/70'}`}>
                        {tool.display_name}
                      </span>
                    </div>
                  </button>
                ))}
                {availableTools.length === 0 && (
                  <p className="col-span-2 text-white/30 text-sm text-center py-4">
                    No tools available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 font-medium text-sm rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
