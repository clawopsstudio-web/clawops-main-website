'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Wrench,
  Puzzle,
  Target,
  BarChart3,
  ScrollText,
  Terminal,
} from 'lucide-react'

const ADMIN_UID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageSquare, primary: true },
  { href: '/dashboard/agents', label: 'Agents', icon: Bot },
  { href: '/dashboard/tools', label: 'Tools', icon: Wrench },
  { href: '/dashboard/plugins', label: 'Plugins', icon: Puzzle },
  { href: '/dashboard/missions', label: 'Missions', icon: Target },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/logs', label: 'Logs', icon: ScrollText },
  { href: '/dashboard/terminal', label: 'Mission Control', icon: Terminal },
]

const TOOLS_TO_CONNECT = [
  { name: 'Gmail', desc: 'Email for your agents to send & receive', icon: '✉', color: '#ea4335' },
  { name: 'Telegram', desc: 'Chat with your agents on the go', icon: '✈', color: '#0088cc' },
  { name: 'Notion', desc: 'Knowledge base and documentation', icon: '◉', color: '#ffffff' },
  { name: 'HubSpot', desc: 'CRM for sales pipeline management', icon: '⬡', color: '#ff7a59' },
]

const AGENTS_PREVIEW = [
  { name: 'Ryan', role: 'Sales Agent', color: '#22c55e', desc: 'Finds leads, qualifies prospects, manages outreach campaigns' },
  { name: 'Arjun', role: 'Research Agent', color: '#f59e0b', desc: 'Monitors competitors, analyzes pricing, builds market intel' },
  { name: 'Helena', role: 'Support Agent', color: '#3b82f6', desc: 'Handles ticket triage, resolves issues, escalates when needed' },
]

const TOTAL_STEPS = 3

function OnboardingModal({ displayName, onComplete }: { displayName: string; onComplete: () => void }) {
  const [step, setStep] = useState(1)

  const handleComplete = async () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
      <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="px-8 pt-8 pb-4">
          <p className="text-white/30 text-xs uppercase tracking-widest font-semibold mb-1">
            Step {step} of {TOTAL_STEPS}
          </p>

          {/* Step 1 — Welcome */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="w-14 h-14 bg-[#e8ff47]/10 border border-[#e8ff47]/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">👋</span>
              </div>
              <h2 className="text-white font-black text-2xl">
                Welcome to ClawOps, {displayName.split(' ')[0]}
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Your AI agent team is ready.<br/>
                Let's get you set up in just a few steps.
              </p>
            </div>
          )}

          {/* Step 2 — Connect tools */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="w-14 h-14 bg-[#e8ff47]/10 border border-[#e8ff47]/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🔌</span>
              </div>
              <h2 className="text-white font-black text-2xl">
                Connect a tool
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Connect at least one tool so your agents can work on your behalf.
              </p>
            </div>
          )}

          {/* Step 3 — Meet agents */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="w-14 h-14 bg-[#e8ff47]/10 border border-[#e8ff47]/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <h2 className="text-white font-black text-2xl">
                Meet your agents
              </h2>
              <p className="text-white/50 text-sm leading-relaxed">
                Your agents are running. You can chat with them anytime from the Chat page.
              </p>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="px-8 pb-6">
          {/* Step 2 — tool cards */}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-2 mb-6">
              {TOOLS_TO_CONNECT.map(tool => (
                <div key={tool.name} className="bg-[#1a1a1a] border border-white/8 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-black"
                      style={{ backgroundColor: tool.color }}
                    >
                      {tool.icon}
                    </div>
                    <span className="text-white font-semibold text-xs">{tool.name}</span>
                  </div>
                  <p className="text-white/30 text-[10px] leading-tight">{tool.desc}</p>
                  <Link
                    href="/dashboard/tools"
                    className="mt-2 block text-center text-[10px] text-[#e8ff47]/70 hover:text-[#e8ff47] transition-colors border border-[#e8ff47]/20 rounded-lg py-1"
                  >
                    Connect →
                  </Link>
                </div>
              ))}
            </div>
          )}

          {/* Step 3 — agent cards */}
          {step === 3 && (
            <div className="space-y-2 mb-6">
              {AGENTS_PREVIEW.map(agent => (
                <div key={agent.name} className="flex items-start gap-3 bg-[#1a1a1a] border border-white/8 rounded-xl p-3.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-bold text-xs">{agent.name}</span>
                      <span className="text-white/30 text-[10px]">{agent.role}</span>
                      <span className="ml-auto text-[9px] bg-emerald-500/10 text-emerald-400/70 px-1.5 py-0.5 rounded-full">Running</span>
                    </div>
                    <p className="text-white/30 text-[10px] leading-tight">{agent.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={step === 1 ? undefined : () => setStep(s => s - 1)}
              className={`text-sm ${step === 1 ? 'text-white/0 pointer-events-none' : 'text-white/40 hover:text-white/70'} transition-colors`}
            >
              ← Back
            </button>

            <div className="flex items-center gap-2">
              {step < TOTAL_STEPS ? (
                <button
                  onClick={() => setStep(s => s + 1)}
                  className="px-5 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors"
                >
                  {step === 2 ? 'Skip' : 'Next →'}
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  className="px-5 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-sm rounded-xl transition-colors"
                >
                  Go to Dashboard →
                </button>
              )}
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  s === step ? 'bg-[#e8ff47]' : s < step ? 'bg-white/30' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userPlan, setUserPlan] = useState('')
  const [user, setUser] = useState<any>(null)
  const [hermesLive, setHermesLive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user ?? null)
      if (!data.user) {
        router.push('/auth/login')
        return
      }
      // Fetch plan from profiles table; onboarding tracked in localStorage
      const { data: prof } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', data.user.id)
        .single()
      if (prof?.plan) setUserPlan(prof.plan)
      const onboarded = localStorage.getItem('onboarding_completed')
      if (!onboarded) setShowOnboarding(true)
      setIsLoading(false)
    })

    // Hermes status poll
    const check = async () => {
      try {
        const r = await fetch('/api/hermes/status')
        setHermesLive(r.ok)
      } catch { setHermesLive(false) }
    }
    check()
    const id = setInterval(check, 30_000)
    return () => clearInterval(id)
  }, [router, supabase])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
    router.refresh()
  }

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarding_completed', 'true')
    setShowOnboarding(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/40 text-sm">Loading...</div>
      </div>
    )
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  const displayName = user?.user_metadata?.full_name ?? user?.email?.split('@')[0] ?? 'User'
  const isAdmin = user?.id === ADMIN_UID

  return (
    <>
      {showOnboarding && (
        <OnboardingModal displayName={displayName} onComplete={handleOnboardingComplete} />
      )}

      <div className="flex min-h-screen bg-[#0a0a0a] text-white">
        {/* Sidebar */}
        <aside className="w-56 bg-[#111] border-r border-white/5 flex flex-col fixed inset-y-0 left-0 z-50">
          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[#e8ff47] rounded-lg flex items-center justify-center shrink-0">
                <span className="text-black font-black text-xs">C</span>
              </div>
              <div>
                <p className="text-white font-semibold text-[13px] leading-none">ClawOps</p>
                <p className="text-white/30 text-[10px] tracking-wide mt-0.5">Dashboard</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
            {NAV.map(item => {
              const active = pathname === item.href
              return (
                <Link key={item.href} href={item.href}
                  className={[
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                    active
                      ? 'bg-[#1a1a1a] text-white font-semibold'
                      : 'text-white/40 hover:text-white/70',
                    item.primary ? 'font-semibold' : '',
                  ].join(' ')}>
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Plan + user */}
          <div className="p-3 border-t border-white/5 space-y-1">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[11px] text-white/30 capitalize">{userPlan || 'Personal'}</span>
              {!userPlan && (
                <span className="text-[10px] bg-[#e8ff47]/10 text-[#e8ff47]/70 px-2 py-0.5 rounded">Loading</span>
              )}
              {userPlan === 'business' && (
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400/70 px-2 py-0.5 rounded">Active</span>
              )}
            </div>
            <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/4 transition-colors cursor-pointer group">
              <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-[11px] font-bold text-white/60 shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-white/80 truncate font-medium">{displayName}</p>
              </div>
              <button onClick={handleLogout} className="text-white/30 hover:text-red-400 transition-colors shrink-0" title="Sign out">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M21 15l-5-5-5-5m5 5-5 5 5" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 ml-56">
          <div className="h-11 border-b border-white/5 flex items-center justify-between px-6 bg-[#0d0d0d] sticky top-0 z-40">
            <div className="text-[12px] text-white/40">
              {NAV.find(n => n.href === pathname)?.label ?? 'Dashboard'}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[11px] text-white/40">
                <div className={`w-1.5 h-1.5 rounded-full ${hermesLive ? 'bg-emerald-400' : 'bg-red-500'}`} />
                {hermesLive ? 'Hermes live' : 'Hermes offline'}
              </div>
              <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-[11px] font-bold text-white/60">
                {initials}
              </div>
            </div>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </>
  )
}
