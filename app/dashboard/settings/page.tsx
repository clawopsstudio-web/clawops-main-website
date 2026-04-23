'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useState } from 'react'

const TABS = ['Profile', 'Plan', 'Workspace', 'Billing', 'Danger']

export default function SettingsPage() {
  const { user, isLoaded } = useUser()
  const [tab, setTab] = useState('Profile')

  return (
    <div className="p-6">
      <h1 className="text-white font-black text-lg mb-6">Settings</h1>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-40 shrink-0 space-y-0.5">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                tab === t ? 'bg-white/8 text-white font-semibold' : 'text-white/40 hover:text-white/70'
              } ${t === 'Danger' ? 'text-red-400/60' : ''}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'Profile' && (
            <div className="space-y-4">
              <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Profile</p>
              <div className="bg-[#111] border border-white/7 rounded-xl p-5 space-y-4">
                <div>
                  <p className="text-white/40 text-xs mb-1">Name</p>
                  <p className="text-white">{user?.fullName ?? '—'}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs mb-1">Email</p>
                  <p className="text-white/70 text-sm">{user?.primaryEmailAddress?.emailAddress ?? '—'}</p>
                </div>
                <p className="text-white/20 text-xs">Profile managed via Clerk. Edits must be made on Clerk's dashboard.</p>
              </div>
            </div>
          )}

          {tab === 'Plan' && (
            <div className="space-y-4">
              <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Current Plan</p>
              <div className="bg-[#111] border border-white/7 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-bold">Personal</p>
                    <p className="text-white/40 text-xs">3 agents · 20K tool calls/mo</p>
                  </div>
                  <button className="px-4 py-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-black font-bold text-xs rounded-xl">
                    Upgrade →
                  </button>
                </div>
                <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-[#e8ff47] rounded-full" style={{ width: '12%' }} />
                </div>
                <p className="text-white/30 text-[10px] mt-2">3 of 3 agents used · 2,841 of 20,000 tool calls</p>
              </div>
            </div>
          )}

          {tab === 'Workspace' && (
            <div className="space-y-4">
              <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Workspace</p>
              <div className="bg-[#111] border border-white/7 rounded-xl p-5 space-y-4">
                {[
                  { label: 'Workspace Name', value: 'Test Workspace' },
                  { label: 'VPS IP', value: '178.238.232.52' },
                  { label: 'Region', value: 'EU (Frankfurt)' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-white/40 text-xs">{row.label}</span>
                    <span className="text-white/70 text-xs">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'Billing' && (
            <div className="space-y-4">
              <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Billing</p>
              <button className="bg-[#111] border border-white/7 rounded-xl px-5 py-3 text-white/70 text-sm hover:border-white/15 transition-colors">
                Open Billing Portal →
              </button>
            </div>
          )}

          {tab === 'Danger' && (
            <div className="space-y-4">
              <p className="text-white/40 text-xs uppercase tracking-widest font-semibold">Danger Zone</p>
              <div className="bg-[#111] border border-red-900/30 rounded-xl p-5">
                <p className="text-red-400 font-semibold text-sm mb-1">Cancel Subscription</p>
                <p className="text-white/40 text-xs mb-4">Permanently cancels your subscription. VPS is kept for 7 days before deletion.</p>
                <button className="px-4 py-2 border border-red-900 text-red-400 text-xs rounded-lg hover:bg-red-950 transition-colors">
                  Cancel Subscription
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
