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
  { href: '/dashboard/logs', label: 'Logs', icon: ScrollText },
  { href: '/dashboard/terminal', label: 'Mission Control', icon: Terminal },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userPlan, setUserPlan] = useState('')
  const [user, setUser] = useState<any>(null)
  const [hermesLive, setHermesLive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user ?? null)
      if (!data.user) {
        router.push('/auth/login')
        return
      }
      // Fetch plan from profiles table
      const { data: prof } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', data.user.id)
        .single()
      if (prof?.plan) setUserPlan(prof.plan)
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
              <span className="text-[10px] bg-[#e8ff47]/10 text-[#e8ff47]/70 px-2 py-0.5 rounded">
                Loading
              </span>
            )}
            {userPlan === 'business' && (
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400/70 px-2 py-0.5 rounded">
                Active
              </span>
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
  )
}
