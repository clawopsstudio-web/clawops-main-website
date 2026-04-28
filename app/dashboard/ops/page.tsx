'use client'

import { useState } from 'react'
import Link from 'next/link'

interface VPSInfo {
  status: 'running' | 'stopped' | 'error'
  ip: string
  uptime: string
  memory: string
  cpu: string
}

interface AgentStatus {
  name: string
  status: 'running' | 'stopped' | 'error'
  lastActive: string
}

export default function OpsPanelPage() {
  const [vpsInfo, setVpsInfo] = useState<VPSInfo | null>(null)
  const [agents, setAgents] = useState<AgentStatus[]>([
    { name: 'Hermes Gateway', status: 'running', lastActive: '2 minutes ago' },
    { name: 'Ryan Agent', status: 'running', lastActive: '5 minutes ago' },
    { name: 'Arjun Agent', status: 'running', lastActive: '8 minutes ago' },
    { name: 'Tyler Agent', status: 'stopped', lastActive: '12 hours ago' },
  ])

  const refreshVPS = () => {
    // TODO: Fetch real VPS info from API
    setVpsInfo({
      status: 'running',
      ip: '178.238.232.52',
      uptime: '48 hours, 23 minutes',
      memory: '3.2 GB / 16 GB',
      cpu: '23%',
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <h1 className="text-2xl font-bold text-white">Operations Panel</h1>
          </div>
          <p className="text-white/40 text-sm">Monitor and manage your ClawOps VPS and agents</p>
        </div>

        {/* VPS Status */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">VPS Status</h2>
            <button
              onClick={refreshVPS}
              className="text-[#e8ff47] hover:text-[#d4eb3a] text-sm flex items-center gap-2 transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4">
              <p className="text-white/30 text-xs mb-1">Status</p>
              <p className={`text-sm font-semibold ${vpsInfo?.status === 'running' ? 'text-emerald-400' : 'text-white/60'}`}>
                {vpsInfo?.status || 'Unknown'}
              </p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4">
              <p className="text-white/30 text-xs mb-1">IP Address</p>
              <p className="text-sm font-semibold text-white/70">
                {vpsInfo?.ip || '178.238.232.52'}
              </p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4">
              <p className="text-white/30 text-xs mb-1">Uptime</p>
              <p className="text-sm font-semibold text-white/70">
                {vpsInfo?.uptime || '--'}
              </p>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4">
              <p className="text-white/30 text-xs mb-1">CPU Usage</p>
              <p className="text-sm font-semibold text-white/70">
                {vpsInfo?.cpu || '--'}
              </p>
            </div>
          </div>

          <div className="bg-[#0a0a0a] border border-white/5 rounded-xl p-4 mb-6">
            <p className="text-white/30 text-xs mb-1">Memory Usage</p>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-[#e8ff47] h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${parseFloat(vpsInfo?.memory || '0').toFixed(1)}%`,
                }}
              />
            </div>
            <p className="text-white/50 text-xs mt-2 text-right">
              {vpsInfo?.memory || '0 GB / 16 GB'}
            </p>
          </div>
        </div>

        {/* Agent Status */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-6">Agent Status</h2>
          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.name}
                className="flex items-center justify-between bg-[#0a0a0a] border border-white/5 rounded-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === 'running' ? 'bg-emerald-400' :
                    agent.status === 'stopped' ? 'bg-white/20' :
                    'bg-red-400'
                  }`} />
                  <span className="text-white/70 text-sm">{agent.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs ${
                    agent.status === 'running' ? 'text-emerald-400' :
                    agent.status === 'stopped' ? 'text-white/40' :
                    'text-red-400'
                  }`}>
                    {agent.status}
                  </span>
                  <span className="text-white/40 text-xs">{agent.lastActive}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/dashboard/chat"
            className="bg-[#111] border border-white/5 hover:border-[#e8ff47]/30 rounded-xl p-4 transition-all hover:scale-[1.02]"
          >
            <div className="text-[#e8ff47] mb-2">💬</div>
            <p className="text-white/70 text-sm">Chat</p>
          </Link>
          <Link
            href="/dashboard/tools"
            className="bg-[#111] border border-white/5 hover:border-[#e8ff47]/30 rounded-xl p-4 transition-all hover:scale-[1.02]"
          >
            <div className="text-[#3b82f6] mb-2">🔧</div>
            <p className="text-white/70 text-sm">Tools</p>
          </Link>
          <Link
            href="/dashboard/agents"
            className="bg-[#111] border border-white/5 hover:border-[#e8ff47]/30 rounded-xl p-4 transition-all hover:scale-[1.02]"
          >
            <div className="text-[#22c55e] mb-2">🤖</div>
            <p className="text-white/70 text-sm">Agents</p>
          </Link>
          <Link
            href="/dashboard/settings"
            className="bg-[#111] border border-white/5 hover:border-[#e8ff47]/30 rounded-xl p-4 transition-all hover:scale-[1.02]"
          >
            <div className="text-[#f59e0b] mb-2">⚙️</div>
            <p className="text-white/70 text-sm">Settings</p>
          </Link>
        </div>

        {/* Logs */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Logs</h2>
          <div className="space-y-2 text-xs">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 text-white/50 py-2 border-b border-white/5">
                <span className="text-white/30">2026-04-28 08:47:{10 + i * 5}</span>
                <span className="text-emerald-400">INFO</span>
                <span className="flex-1 truncate">Agent {['Ryan', 'Arjun', 'Tyler'][i]} completed task successfully</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}