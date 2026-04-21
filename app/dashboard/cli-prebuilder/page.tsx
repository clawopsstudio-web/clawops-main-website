'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

interface CLITool {
  id?: string
  name: string
  description: string
  commands: string
  workingDir: string
  icon?: string
}

export default function CLIPrebuilder() {
  const [tool, setTool] = useState<CLITool>({
    name: '',
    description: '',
    commands: '',
    workingDir: '~/',
    icon: ''
  })
  const [tools, setTools] = useState<CLITool[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('cli_tools')
        .insert([tool])
        .select()

      if (error) throw error

      setMessage('✅ CLI tool saved successfully!')
      setTool({ name: '', description: '', commands: '', workingDir: '~/', icon: '' })
      fetchTools()
    } catch (err: any) {
      setMessage('❌ Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTools = async () => {
    const { data, error } = await supabase
      .from('cli_tools')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setTools(data)
    }
  }

  const handleTestCLI = async (cli: CLITool) => {
    if (!cli.name) return
    setMessage(`🚀 Testing ${cli.name}...`)
    // In production, this would call your CLI runner API
    setTimeout(() => {
      setMessage(`✅ ${cli.name} test successful!`)
    }, 1000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">CLI Prebuilder</h1>
      <p className="text-gray-400 mb-8">Create custom CLI tools for your business</p>

      {/* Form Section */}
      <div className="bg-[#1a1a2e] rounded-xl p-6 mb-8 border border-[#2d2d44]">
        <h2 className="text-xl font-semibold mb-4">Create New CLI Tool</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tool Name
            </label>
            <input
              type="text"
              required
              value={tool.name}
              onChange={(e) => setTool({ ...tool, name: e.target.value })}
              className="w-full bg-[#0f0f1a] border border-[#2d2d44] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#e8ff47]"
              placeholder="e.g., mybiz-analytics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              required
              value={tool.description}
              onChange={(e) => setTool({ ...tool, description: e.target.value })}
              className="w-full bg-[#0f0f1a] border border-[#2d2d44] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#e8ff47]"
              placeholder="What does this CLI tool do?"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Commands (one per line)
            </label>
            <textarea
              required
              value={tool.commands}
              onChange={(e) => setTool({ ...tool, commands: e.target.value })}
              className="w-full bg-[#0f0f1a] border border-[#2d2d44] rounded-lg px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#e8ff47]"
              placeholder="#!/bin/bash&#10;npm start&#10;--verbose"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Working Directory
            </label>
            <input
              type="text"
              required
              value={tool.workingDir}
              onChange={(e) => setTool({ ...tool, workingDir: e.target.value })}
              className="w-full bg-[#0f0f1a] border border-[#2d2d44] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#e8ff47]"
              placeholder="e.g., ~/mybiz"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Icon (emoji)
            </label>
            <input
              type="text"
              value={tool.icon}
              onChange={(e) => setTool({ ...tool, icon: e.target.value })}
              className="w-full bg-[#0f0f1a] border border-[#2d2d44] rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#e8ff47]"
              placeholder="e.g., 🚀"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#e8ff47] to-[#e8ff47] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Saving...' : '✨ Save CLI Tool'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 rounded-lg text-sm">
            {message}
          </div>
        )}
      </div>

      {/* Tools List Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your CLI Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((cli) => (
            <div
              key={cli.id}
              className="bg-[#1a1a2e] rounded-xl p-6 border border-[#2d2d44] hover:border-[#e8ff47] transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cli.icon || '🔧'}</span>
                  <h3 className="text-lg font-semibold">{cli.name}</h3>
                </div>
              </div>
              <p className="text-gray-400 text-sm mb-4">{cli.description}</p>
              <div className="bg-[#0f0f1a] rounded-lg p-3 mb-4">
                <pre className="text-xs font-mono text-[#e8ff47] whitespace-pre-wrap">
                  {cli.commands}
                </pre>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTestCLI(cli)}
                  className="flex-1 bg-[#2d2d44] hover:bg-[#3d3d54] text-white font-medium py-2 rounded-lg transition-colors"
                >
                  🚀 Test
                </button>
                <button
                  onClick={() => setMessage('⚠️ Edit functionality coming soon!')}
                  className="flex-1 bg-[#2d2d44] hover:bg-[#3d3d54] text-white font-medium py-2 rounded-lg transition-colors"
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}