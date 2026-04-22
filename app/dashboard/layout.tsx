'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from '@clerk/nextjs'
import {
  Bot, Settings, Plug, Zap, LogOut, LayoutDashboard,
  MessageSquare, Network, ChevronRight, Loader2,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
  { href: '/dashboard/agents', label: 'Agents', icon: Bot },
  { href: '/dashboard/tools', label: 'Tools', icon: Plug },
  { href: '/dashboard/missions', label: 'Missions', icon: Zap },
  { href: '/dashboard/logs', label: 'Activity', icon: Network },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

function NavItem({
  href, label, icon: Icon, active
}: {
  href: string
  label: string
  icon: any
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-[#e8ff47] text-black font-semibold'
          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#111] border-r border-white/5 flex flex-col fixed inset-y-0 left-0 z-50">
        {/* Logo */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#e8ff47] rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-sm">C</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">ClawOps</p>
              <p className="text-white/40 text-[10px] tracking-wide">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={pathname === item.href}
            />
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/60 text-xs font-bold">
              P
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">Pulkit</p>
              <p className="text-white/40 text-[10px] truncate">Dashboard</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56">
        {children}
      </main>
    </div>
  )
}
