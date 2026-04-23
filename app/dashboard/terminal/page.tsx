'use client'

import { useState, useEffect } from 'react'
import { execSSH } from '@/lib/vps-ssh'

// ─── Quick actions ──────────────────────────────────────
const QUICK_ACTIONS = [
  { cmd: 'systemctl status hermes', label: 'Hermes Status', icon: '◈' },
  { cmd: 'systemctl restart hermes', label: 'Restart Hermes', icon: '↻' },
  { cmd: 'hermes doctor', label: 'Run Doctor', icon: '◉' },
  { cmd: 'hermes cache clear', label: 'Clear Cache', icon: '◇' },
  { cmd: 'df -h', label: 'Disk Usage', icon: '▫' },
  { cmd: 'free -h', label: 'Memory', icon: '▪' },
  { cmd: 'curl -s http://127.0.0.1:8888 | head -1', label: 'Check SearXNG', icon: '◎' },
]

const PROVIDERS = [
  { id: 'openrouter', label: 'OpenRouter', keyBased: true },
  { id: 'anthropic', label: 'Anthropic', keyBased: true },
  { id: 'openai', label: 'OpenAI', keyBased: true },
  { id: 'gemini', label: 'Google Gemini', keyBased: true },
  { id: 'custom', label: 'Custom URL', keyBased: true },
]

export default function TerminalPage() {
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState('')
  const [showModelModal, setShowModelModal] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('openrouter')
  const [modelName, setModelName] = useState('meta-llama/llama-3.3-70b-instruct')
  const [apiKey, setApiKey] = useState('')
  const [modelOutput, setModelOutput] = useState('')

  const run = async (cmd: string, label: string) => {
    setRunning(label)
    setOutput('')
    try {
      const result = await execSSH('test_user' as any, cmd)
      setOutput(result.stdout || result.stderr || 'Done.')
    } catch (e: any) {
      setOutput('Error: ' + (e.message ?? 'Unknown'))
    } finally {
      setRunning('')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-white font-black text-lg">Mission Control</h1>
        <p className="text-white/30 text-xs mt-0.5">Monitor and manage your VPS runtime.</p>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-3">Quick Actions</p>
        <div className="grid grid-cols-4 gap-2">
          {QUICK_ACTIONS.map(a => (
            <button
              key={a.cmd}
              onClick={() => run(a.cmd, a.label)}
              disabled={!!running}
              className="bg-[#111] border border-white/7 hover:border-white/15 text-white/60 hover:text-white text-xs px-3 py-2 rounded-lg transition-all text-left flex items-center gap-2 disabled:opacity-40"
            >
              <span className="opacity-40">{a.icon}</span>
              {a.label}
              {running === a.label && (
                <span className="ml-auto w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full animate-spin shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Model Provider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">AI Model Provider</p>
          <button
            onClick={() => setShowModelModal(true)}
            className="text-[#e8ff47] text-xs hover:underline"
          >
            Change Model →
          </button>
        </div>
        <div className="bg-[#111] border border-white/7 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">OpenRouter</p>
            <p className="text-white/30 text-xs mt-0.5">meta-llama/llama-3.3-70b-instruct</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 text-xs">Connected</span>
          </div>
        </div>
      </div>

      {/* Output terminal */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">Output</p>
          {output && (
            <button onClick={() => setOutput('')} className="text-white/20 hover:text-white/60 text-[10px]">Clear</button>
          )}
        </div>
        <pre className="bg-[#111] border border-white/7 rounded-xl p-4 text-[11px] font-mono text-white/50 overflow-x-auto whitespace-pre-wrap min-h-32 max-h-64 overflow-y-auto">
          {output || 'Click a quick action to see output.'}
        </pre>
      </div>

      {/* Model change modal */}
      {showModelModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold">Change AI Model</h3>
              <button onClick={() => setShowModelModal(false)} className="text-white/40 hover:text-white text-lg">×</button>
            </div>

            <div>
              <label className="text-white/60 text-xs mb-2 block">Provider</label>
              <div className="grid grid-cols-2 gap-2">
                {PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProvider(p.id)}
                    className={`px-3 py-2 rounded-lg border text-xs text-left transition-colors ${
                      selectedProvider === p.id
                        ? 'border-[#e8ff47] bg-[#e8ff47]/10 text-white'
                        : 'border-white/10 text-white/50 hover:border-white/20'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white/60 text-xs mb-2 block">Model Name</label>
              <input
                value={modelName}
                onChange={e => setModelName(e.target.value)}
                placeholder="e.g. meta-llama/llama-3.3-70b-instruct"
                className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white/70 text-xs focus:outline-none focus:border-white/20"
              />
            </div>

            <div>
              <label className="text-white/60 text-xs mb-2 block">API Key (optional for some providers)</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white/70 text-xs focus:outline-none focus:border-white/20"
              />
            </div>

            {modelOutput && (
              <pre className="bg-[#0a0a0a] border border-white/7 rounded-lg p-3 text-[11px] font-mono text-white/50 max-h-32 overflow-auto">{modelOutput}</pre>
            )}

            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setModelOutput('Testing...')
                  try {
                    const result = await execSSH('test_user' as any, 'hermes doctor')
                    setModelOutput(result.stdout || result.stderr || 'Done.')
                  } catch (e: any) {
                    setModelOutput('Error: ' + (e.message ?? ''))
                  }
                }}
                className="px-4 py-2 bg-white/8 hover:bg-white/12 text-white/80 text-xs rounded-lg transition-colors"
              >
                Test Connection
              </button>
              <button
                onClick={() => setShowModelModal(false)}
                className="flex-1 py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-xs rounded-lg transition-colors"
              >
                Save & Restart Hermes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
