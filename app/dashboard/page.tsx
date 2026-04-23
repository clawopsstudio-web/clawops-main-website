'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

interface Stats {
  activeAgents: number
  connectedTools: number
  missionsToday: number
  hermesLive: boolean
  provisioningStatus: 'loading' | 'provisioning' | 'active' | 'error'
}

const PROGRESS_STEPS = [
  'Payment confirmed',
  'VPS provisioning',
  'Installing Hermes runtime',
  'Registering workspace',
]

export default function OverviewPage() {
  const { user, isLoaded } = useUser()
  const [stats, setStats] = useState<Stats | null>(null)
  const [progressStep, setProgressStep] = useState(0)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/user/status')
        if (!res.ok) return
        const data = await res.json()
        if (data.status === 'active') {
          setStats({ ...data, provisioningStatus: 'active' })
        } else {
          setStats({ ...data, provisioningStatus: 'provisioning' })
          // advance progress indicator
          setProgressStep(s => Math.min(s + 1, PROGRESS_STEPS.length - 1))
        }
      } catch {
        setStats({ activeAgents: 0, connectedTools: 0, missionsToday: 0, hermesLive: false, provisioningStatus: 'error' })
      }
    }
    checkStatus()
    const interval = setInterval(checkStatus, 8_000)
    return () => clearInterval(interval)
  }, [])

  // ── Provisioning screen ────────────────────────────────────
  if (stats?.provisioningStatus === 'provisioning') {
    return (
      <div className="min-h-[calc(100vh-44px)] flex items-center justify-center">
        <div className="max-w-sm w-full text-center space-y-8">
          {/* Animated logo */}
          <div className="w-16 h-16 bg-[#e8ff47] rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-black font-black text-2xl">C</span>
          </div>

          <div>
            <h2 className="text-white font-black text-xl">Setting up your workspace</h2>
            <p className="text-white/40 text-sm mt-1">This takes a few minutes</p>
          </div>

          {/* Progress steps */}
          <div className="space-y-3 text-left">
            {PROGRESS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                  i < progressStep ? 'bg-emerald-400 text-black' :
                  i === progressStep ? 'bg-[#e8ff47] text-black animate-pulse' :
                  'bg-white/10 text-white/30'
                }`}>
                  {i < progressStep ? '✓' : i === progressStep ? '·' : '○'}
                </div>
                <span className={i <= progressStep ? 'text-white/70' : 'text-white/30'}>{step}</span>
              </div>
            ))}
          </div>

          <p className="text-white/20 text-xs animate-pulse">Almost there...</p>
        </div>
      </div>
    )
  }

  // ── Error state ──────────────────────────────────────────
  if (stats?.provisioningStatus === 'error') {
    return (
      <div className="p-8">
        <div className="bg-red-950/50 border border-red-900 rounded-xl p-6 text-center">
          <p className="text-red-400 font-semibold mb-2">Setup failed</p>
          <p className="text-white/40 text-sm">Contact support to complete setup.</p>
        </div>
      </div>
    )
  }

  // ── Main overview ────────────────────────────────────────
  const firstName = user?.firstName ?? 'there'

  return (
    <div className="p-6 space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-white font-black text-2xl">Welcome back, {firstName}</h1>
        <p className="text-white/40 text-sm mt-1">Your AI team is running 24/7.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Agents', value: stats?.activeAgents ?? '—', live: true },
          { label: 'Connected Tools', value: stats?.connectedTools ?? '—', live: true },
          { label: 'Missions Today', value: stats?.missionsToday ?? '—', live: false },
          { label: 'Hermes Status', value: stats?.hermesLive ? 'Live' : 'Offline', live: !!stats?.hermesLive },
        ].map(stat => (
          <div key={stat.label} className="bg-[#111] border border-white/7 rounded-xl p-5">
            <p className="text-white/40 text-xs mb-3">{stat.label}</p>
            <div className="flex items-center gap-2">
              <p className="text-white font-black text-2xl">{stat.value}</p>
              {stat.live && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4">
        <Link
          href="/dashboard/chat"
          className="bg-[#111] border border-white/7 rounded-xl p-5 hover:border-white/15 transition-colors group"
        >
          <p className="text-white font-semibold text-sm mb-1 group-hover:text-[#e8ff47] transition-colors">Start Chat →</p>
          <p className="text-white/30 text-xs">Talk to your agents</p>
        </Link>
        <Link
          href="/dashboard/tools"
          className="bg-[#111] border border-white/7 rounded-xl p-5 hover:border-white/15 transition-colors group"
        >
          <p className="text-white font-semibold text-sm mb-1 group-hover:text-[#e8ff47] transition-colors">Connect Tool →</p>
          <p className="text-white/30 text-xs">Link an app</p>
        </Link>
        <Link
          href="/dashboard/plugins"
          className="bg-[#111] border border-white/7 rounded-xl p-5 hover:border-white/15 transition-colors group"
        >
          <p className="text-white font-semibold text-sm mb-1 group-hover:text-[#e8ff47] transition-colors">Install Plugin →</p>
          <p className="text-white/30 text-xs">Extend agent capabilities</p>
        </Link>
      </div>

      {/* Recent activity */}
      <div className="bg-[#111] border border-white/7 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { time: 'Just now', text: 'Dashboard loaded' },
            { time: '5m ago', text: 'Hermes agent idle' },
            { time: '1h ago', text: 'Session started' },
          ].map(item => (
            <div key={item.time} className="flex gap-3 text-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-white/15 mt-1.5 shrink-0" />
              <div>
                <p className="text-white/60">{item.text}</p>
                <p className="text-white/25 text-xs mt-0.5">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
