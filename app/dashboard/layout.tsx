/**
 * app/dashboard/layout.tsx
 * Phase 3 dashboard shell — ClawOps Studio
 * Design: Linear/Vercel dark aesthetic, dense sidebar
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import AuthProvider from '@/components/providers/AuthProvider'
import { useState, useEffect } from 'react'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: '▪' },
  { href: '/dashboard/chat', label: 'Chat', icon: '#', primary: true },
  { href: '/dashboard/agents', label: 'Agents', icon: '◈' },
  { href: '/dashboard/tools', label: 'Tools', icon: '◉' },
  { href: '/dashboard/plugins', label: 'Plugins', icon: '◎' },
  { href: '/dashboard/missions', label: 'Missions', icon: '◇' },
  { href: '/dashboard/logs', label: 'Logs', icon: '▫' },
  { href: '/dashboard/terminal', label: 'Mission Control', icon: '▸' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, isLoaded } = useUser()
  const [hermesLive, setHermesLive] = useState(false)

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/hermes/status')
        setHermesLive(res.ok)
      } catch {
        setHermesLive(false)
      }
    }
    check()
    const interval = setInterval(check, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AuthProvider>
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
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors',
                    active ? 'bg-[#1a1a1a] text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/4',
                    item.primary ? 'font-semibold' : '',
                  ].join(' ')}
                >
                  <span className="text-[10px] opacity-50 w-3 text-center">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="p-3 border-t border-white/5 space-y-1">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-[11px] text-white/30">Personal</span>
              <span className="text-[10px] bg-white/8 text-white/50 px-2 py-0.5 rounded">Upgrade</span>
            </div>
            {isLoaded && user && (
              <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/4 transition-colors cursor-pointer">
                <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-[11px] font-bold text-white/60 shrink-0">
                  {user.firstName?.[0] ?? user.emailAddresses[0]?.emailAddress?.[0] ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-white/80 truncate font-medium">
                    {user.fullName ?? user.firstName ?? 'User'}
                  </p>
                  <p className="text-[10px] text-white/30 truncate">
                    {user.emailAddresses[0]?.emailAddress ?? ''}
                  </p>
                </div>
              </div>
            )}
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
              {isLoaded && user && (
                <div className="w-7 h-7 bg-white/10 rounded-full flex items-center justify-center text-[11px] font-bold text-white/60">
                  {user.firstName?.[0] ?? '?'}
                </div>
              )}
            </div>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </AuthProvider>
  )
}
