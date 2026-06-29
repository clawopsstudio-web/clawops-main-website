'use client'

import { useEffect, useState } from 'react'

export default function ControlPage() {
  const [loading, setLoading] = useState(true)
  const vpsUrl = 'http://178.238.232.52:9120'
  
  useEffect(() => {
    // Check if VPS is reachable
    fetch(vpsUrl, { mode: 'no-cors' })
      .then(() => setLoading(false))
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="bg-[#111] border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Agent Control Center</h1>
            <p className="text-white/50 text-sm mt-1">Manage your AI team, chat, and terminal</p>
          </div>
          <a href="/dashboard" className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
            ← Back to Dashboard
          </a>
        </div>
      </div>

      {/* iFrame */}
      <div className="w-full h-[calc(100vh-140px)]">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-[#e8ff47] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-white/50 mt-4">Connecting to VPS...</p>
            </div>
          </div>
        ) : (
          <iframe
            src="http://178.238.232.52:9120"
            className="w-full h-full border-0"
            title="ClawOps Control Interface"
            allow="fullscreen"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock"
          />
        )}
      </div>

      {/* Status bar */}
      <div className="bg-[#111] border-t border-white/10 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-white/50">VPS Connected</span>
            </div>
            <div className="text-white/30">•</div>
            <span className="text-white/50">178.238.232.52:9120</span>
          </div>
          <div className="text-white/30">
            Hermes v0.10.0 | NVIDIA API
          </div>
        </div>
      </div>
    </div>
  )
}
