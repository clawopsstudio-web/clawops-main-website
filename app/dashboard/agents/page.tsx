'use client'

import { useState, useEffect } from 'react'

// Default agents seeded for demo
const DEFAULT_AGENTS = [
  {
    id: 'ryan-default',
    name: 'Ryan',
    role: 'Sales',
    provider: 'nvidia',
    model_id: 'moonshotai/kimi-k2-thinking',
    telegram_connected: true,
    status: 'active'
  },
  {
    id: 'arjun-default',
    name: 'Arjun',
    role: 'Research',
    provider: 'nvidia',
    model_id: 'moonshotai/kimi-k2-thinking',
    telegram_connected: false,
    status: 'active'
  },
  {
    id: 'tyler-default',
    name: 'Tyler',
    role: 'Marketing',
    provider: 'nvidia',
    model_id: 'moonshotai/kimi-k2-thinking',
    telegram_connected: false,
    status: 'active'
  }
]

export default function AgentsPage() {
  const [agents, setAgents] = useState(DEFAULT_AGENTS)

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Agents</h1>
          <button className="px-4 py-2 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400">
            + New Agent
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-xl font-bold">
                  {agent.name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{agent.name}</h3>
                  <p className="text-gray-400 text-sm">{agent.role}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Provider</span>
                  <span className="text-white">{agent.provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Model</span>
                  <span className="text-white text-xs">{agent.model_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Telegram</span>
                  <span className={agent.telegram_connected ? 'text-green-400' : 'text-gray-500'}>
                    {agent.telegram_connected ? 'Connected' : 'Not connected'}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-800">
                <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
