'use client'
// app/provisioning/page.tsx

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
  { id: 'account', label: 'Account created', status: 'done' },
  { id: 'plan', label: 'Plan activated', status: 'done' },
  { id: 'vps', label: 'VPS instance reserved', status: 'done' },
  { id: 'runtime', label: 'Installing agent runtime...', status: 'loading' },
  { id: 'workspace', label: 'Configuring your workspace...', status: 'pending' },
  { id: 'tools', label: 'Connecting your tools...', status: 'pending' },
  { id: 'ready', label: 'Sending your dashboard URL', status: 'pending' },
]

export default function ProvisioningPage() {
  const [steps, setSteps] = useState(STEPS)
  const [dots, setDots] = useState('')

  useEffect(() => {
    // Poll /api/provision/status every 10s
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/provision/status', {
          headers: { 'Cache-Control': 'no-cache' },
        })
        if (res.ok) {
          const data = await res.json()
          updateSteps(data.status)
        }
      } catch {
        // silently ignore network errors
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Animate dots
  useEffect(() => {
    const interval = setInterval(
      () => setDots((d) => (d.length >= 3 ? '' : d + '.')),
      500
    )
    return () => clearInterval(interval)
  }, [])

  // For demo: auto-progress steps after delays
  useEffect(() => {
    const timers = [
      setTimeout(() => updateSteps('runtime'), 2000),
      setTimeout(() => updateSteps('workspace'), 6000),
      setTimeout(() => updateSteps('tools'), 10000),
      setTimeout(() => updateSteps('ready'), 14000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  function updateSteps(status: string) {
    const statusOrder = [
      'account',
      'plan',
      'vps',
      'runtime',
      'workspace',
      'tools',
      'ready',
    ]
    setSteps((prev) =>
      prev.map((s) => ({
        ...s,
        status:
          statusOrder.indexOf(s.id) <= statusOrder.indexOf(status)
            ? statusOrder.indexOf(s.id) < statusOrder.indexOf(status)
              ? 'done'
              : 'loading'
            : 'pending',
      }))
    )
  }

  const doneCount = steps.filter((s) => s.status === 'done').length
  const progress = (doneCount / steps.length) * 100

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#e8ff47]/10 border border-[#e8ff47]/20 mb-4">
            <span className="text-lg">⚡</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Setting up your workspace
          </h1>
          <p className="text-white/40 text-sm">
            This usually takes about 20 minutes. You&apos;ll get an email and
            Telegram message when it&apos;s ready.
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-[#e8ff47] transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  step.status === 'done'
                    ? 'bg-[#10b981]'
                    : step.status === 'loading'
                      ? 'bg-[#e8ff47]'
                      : 'bg-white/10'
                }`}
              >
                {step.status === 'done' ? (
                  <span className="text-white text-xs">✓</span>
                ) : step.status === 'loading' ? (
                  <span className="text-black text-xs animate-spin">⟳</span>
                ) : (
                  <span className="text-white/30 text-xs">○</span>
                )}
              </div>
              <span
                className={`text-sm ${
                  step.status === 'done'
                    ? 'text-white/60'
                    : step.status === 'loading'
                      ? 'text-white'
                      : 'text-white/30'
                }`}
              >
                {step.label}
                {step.status === 'loading' ? (
                  <span className="animate-pulse">{dots}</span>
                ) : (
                  ''
                )}
              </span>
            </div>
          ))}
        </div>

        {/* ETA */}
        <div className="mt-8 text-center">
          <p className="text-white/20 text-xs">Estimated time: ~20 minutes</p>
          <p className="text-white/20 text-xs mt-1">
            You can close this tab — we&apos;ll notify you when it&apos;s ready.
          </p>
        </div>
      </div>
    </div>
  )
}
