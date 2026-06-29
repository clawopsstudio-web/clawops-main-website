'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const TABS = ['Profile', 'Subscription', 'Notifications', 'API Keys']

const AVATAR_COLORS = [
  { name: 'Yellow',  value: '#e8ff47' },
  { name: 'Blue',    value: '#3b82f6' },
  { name: 'Green',   value: '#22c55e' },
  { name: 'Purple',  value: '#a855f7' },
  { name: 'Red',     value: '#ef4444' },
  { name: 'Pink',    value: '#ec4899' },
]

const PLANS = [
  {
    id: 'personal',
    name: 'Personal',
    price: '$49',
    features: ['3 agents', '5 tool connections', 'Email support', 'Dashboard access'],
    missing: ['Telegram', 'Mission scheduler', 'White-label'],
  },
  {
    id: 'team',
    name: 'Team',
    price: '$149',
    features: ['5 agents', '15 tool connections', 'Priority support', 'Mission scheduler', 'Telegram'],
    missing: ['White-label'],
    highlight: false,
  },
  {
    id: 'business',
    name: 'Business',
    price: '$299',
    features: ['8 agents', 'Unlimited tools', 'Priority support', 'Telegram', 'Mission scheduler', 'White-label', 'Dedicated VPS'],
    missing: [],
    highlight: true,
  },
]

interface Profile {
  id: string
  full_name: string | null
  email: string | null
  plan: string | null
  avatar_color: string | null
  timezone: string | null
}

function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium shadow-xl flex items-center gap-2 animate-fade-in ${
      type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'
    }`}>
      <span>{type === 'success' ? '✓' : '✕'}</span> {message}
    </div>
  )
}

function ConfirmModal({
  title, body, confirmLabel, onConfirm, onCancel
}: { title: string; body: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-white/10 rounded-2xl w-full max-w-sm p-6 space-y-4">
        <h3 className="text-white font-bold text-base">{title}</h3>
        <p className="text-white/50 text-sm">{body}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 py-2.5 text-white/50 text-sm hover:text-white text-center">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-xl text-center">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const supabase = createClient()
  const [tab, setTab] = useState('Profile')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Profile form state
  const [displayName, setDisplayName] = useState('')
  const [avatarColor, setAvatarColor] = useState('#e8ff47')
  const [savingProfile, setSavingProfile] = useState(false)

  // Notifications state
  const [notifEmailDigest, setNotifEmailDigest] = useState(true)
  const [notifErrors, setNotifErrors] = useState(true)
  const [notifMissions, setNotifMissions] = useState(false)
  const [notifTelegram, setNotifTelegram] = useState(false)
  const [savingNotif, setSavingNotif] = useState(false)

  // API Keys state
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false)
  const [apiKey] = useState('cs_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6')
  const [regenerateModal, setRegenerateModal] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  // Notifications preferences (stored in localStorage for now)
  useEffect(() => {
    const saved = localStorage.getItem('notif_prefs')
    if (saved) {
      const p = JSON.parse(saved)
      setNotifEmailDigest(p.emailDigest ?? true)
      setNotifErrors(p.errors ?? true)
      setNotifMissions(p.missions ?? false)
      setNotifTelegram(p.telegram ?? false)
    }
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, type })
    toastTimer.current = setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      if (prof) {
        setProfile(prof as Profile)
        setDisplayName(prof.full_name ?? '')
        setAvatarColor(prof.avatar_color ?? '#e8ff47')
      }
      setIsLoaded(true)
    })
  }, [])

  const saveProfile = async () => {
    if (!profile) return
    setSavingProfile(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: displayName, avatar_color: avatarColor })
      .eq('id', profile.id)
    setSavingProfile(false)
    if (error) {
      showToast('Failed to save. Try again.', 'error')
    } else {
      showToast('Profile saved successfully!', 'success')
      setProfile(p => p ? { ...p, full_name: displayName, avatar_color: avatarColor } : p)
    }
  }

  const saveNotifications = async () => {
    setSavingNotif(true)
    localStorage.setItem('notif_prefs', JSON.stringify({
      emailDigest: notifEmailDigest,
      errors: notifErrors,
      missions: notifMissions,
      telegram: notifTelegram,
    }))
    await new Promise(r => setTimeout(r, 600))
    setSavingNotif(false)
    showToast('Notification preferences saved!', 'success')
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    await new Promise(r => setTimeout(r, 1200))
    setRegenerating(false)
    setRegenerateModal(false)
    setApiKeyRevealed(false)
    showToast('API key regenerated! Update your integrations.', 'success')
  }

  if (!isLoaded) {
    return <div className="p-6 text-white/40 text-sm">Loading settings...</div>
  }

  const initials = (profile?.full_name ?? profile?.email ?? '?')
    .split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="p-6">
      <h1 className="text-white font-black text-lg mb-6">Settings</h1>

      <div className="flex gap-8">
        {/* Tabs */}
        <div className="w-44 shrink-0 space-y-0.5">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                tab === t ? 'bg-white/8 text-white font-semibold' : 'text-white/40 hover:text-white/70'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-6 max-w-2xl">

          {/* ─── Profile ─── */}
          {tab === 'Profile' && profile && (
            <div className="space-y-4">
              <p className="text-white/30 text-xs uppercase tracking-widest font-semibold">Profile</p>

              {/* Avatar + name row */}
              <div className="bg-[#111] border border-white/7 rounded-xl p-5 space-y-4">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative group">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-black font-black text-lg"
                      style={{ backgroundColor: avatarColor }}
                    >
                      {initials}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#222] border border-white/10 flex items-center justify-center">
                      <span className="text-white/30 text-[8px]">✎</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{displayName || 'Your name'}</p>
                    <p className="text-white/30 text-xs">{profile.email}</p>
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <p className="text-white/40 text-xs mb-2">Avatar color</p>
                  <div className="flex gap-2">
                    {AVATAR_COLORS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setAvatarColor(c.value)}
                        title={c.name}
                        className={`w-6 h-6 rounded-full transition-transform ${avatarColor === c.value ? 'scale-125 ring-2 ring-white/30' : 'hover:scale-110'}`}
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                </div>

                {/* Display name */}
                <div>
                  <label className="text-white/40 text-xs block mb-1.5">Display name</label>
                  <input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none focus:border-white/20"
                    placeholder="Your name"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="text-white/40 text-xs block mb-1.5">Email</label>
                  <input
                    value={profile.email ?? ''}
                    readOnly
                    className="w-full bg-[#0d0d0d]/50 border border-white/5 rounded-xl px-4 py-2.5 text-white/30 text-sm cursor-not-allowed"
                  />
                  <p className="text-white/20 text-[10px] mt-1">Email cannot be changed</p>
                </div>

                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="px-5 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-50 text-black font-bold text-sm rounded-xl transition-colors"
                >
                  {savingProfile ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          )}

          {/* ─── Subscription ─── */}
          {tab === 'Subscription' && (
            <div className="space-y-4">
              <p className="text-white/30 text-xs uppercase tracking-widest font-semibold">Subscription</p>

              {/* Current plan card */}
              <div className="bg-[#111] border border-white/7 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-bold text-base">Business</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">Active</span>
                    </div>
                    <p className="text-white/40 text-sm">$299/month</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-emerald-400/70 text-xs">8 agents</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Next billing', value: 'May 25, 2026' },
                    { label: 'Billing cycle', value: 'Monthly' },
                    { label: 'Agents used', value: '3 of 8' },
                    { label: 'Tools connected', value: '5' },
                  ].map(r => (
                    <div key={r.label} className="bg-[#0d0d0d] rounded-lg px-3 py-2.5">
                      <p className="text-white/30 text-[10px] mb-0.5">{r.label}</p>
                      <p className="text-white/70 text-xs font-medium">{r.value}</p>
                    </div>
                  ))}
                </div>

                <button
                  disabled
                  title="Stripe integration coming soon"
                  className="w-full py-2.5 bg-white/5 border border-white/8 text-white/30 text-sm rounded-xl cursor-not-allowed"
                >
                  Manage Billing → (coming soon)
                </button>
              </div>

              {/* Plan comparison */}
              <div className="bg-[#111] border border-white/7 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-white/5">
                  <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">Plan comparison</p>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="text-left px-5 py-3 text-white/30 text-xs font-semibold">Feature</th>
                      {PLANS.map(p => (
                        <th key={p.id} className={`text-center px-4 py-3 text-xs font-bold ${p.highlight ? 'text-white' : 'text-white/50'}`}>
                          {p.name}{p.highlight ? ' ★' : ''}<br/>
                          <span className="text-[10px] font-normal text-white/30">{p.price}/mo</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      '3 agents', '5 agents', '8 agents',
                      'Tool connections', 'Email support', 'Priority support',
                      'Telegram', 'Mission scheduler', 'White-label', 'Dedicated VPS',
                    ].map((feature, i) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="px-5 py-3 text-white/50 text-xs">{feature}</td>
                        {PLANS.map(p => {
                          const hasFeature = p.features.some(f => f.toLowerCase().includes(feature.toLowerCase().split(' ')[0]))
                          return (
                            <td key={p.id} className="text-center py-3">
                              {hasFeature ? (
                                <span className="text-emerald-400/70 text-sm">✓</span>
                              ) : (
                                <span className="text-white/15 text-sm">—</span>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Notifications ─── */}
          {tab === 'Notifications' && (
            <div className="space-y-4">
              <p className="text-white/30 text-xs uppercase tracking-widest font-semibold">Notifications</p>

              <div className="bg-[#111] border border-white/7 rounded-xl p-5 space-y-1">
                {[
                  { label: 'Email digest', desc: 'Daily summary of agent activity', state: notifEmailDigest, set: setNotifEmailDigest },
                  { label: 'Agent error alerts', desc: 'Get notified when an agent encounters an error', state: notifErrors, set: setNotifErrors },
                  { label: 'Mission completion', desc: 'Notify when a scheduled mission finishes', state: notifMissions, set: setNotifMissions },
                  { label: 'Telegram notifications', desc: 'Receive alerts via Telegram', state: notifTelegram, set: setNotifTelegram, disabled: true, disabledNote: 'Configure in Tools' },
                ].map(toggle => (
                  <div key={toggle.label} className={`flex items-center justify-between py-3.5 ${toggle !== null ? 'border-b border-white/5 last:border-0' : ''}`}>
                    <div>
                      <p className={`text-sm ${toggle.disabled ? 'text-white/25' : 'text-white/70'}`}>{toggle.label}</p>
                      <p className="text-white/25 text-xs mt-0.5">{toggle.desc}{toggle.disabledNote ? ` · ${toggle.disabledNote}` : ''}</p>
                    </div>
                    <button
                      onClick={() => !toggle.disabled && toggle.set(!toggle.state)}
                      className={`w-10 h-6 rounded-full transition-colors relative ${
                        toggle.disabled ? 'bg-white/8 cursor-not-allowed' : toggle.state ? 'bg-[#e8ff47]' : 'bg-white/15'
                      }`}
                      disabled={toggle.disabled}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full transition-all shadow-sm ${
                        toggle.state ? 'left-5 bg-black' : 'left-1 bg-white/40'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={saveNotifications}
                disabled={savingNotif}
                className="px-5 py-2.5 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-50 text-black font-bold text-sm rounded-xl transition-colors"
              >
                {savingNotif ? 'Saving...' : 'Save preferences'}
              </button>
            </div>
          )}

          {/* ─── API Keys ─── */}
          {tab === 'API Keys' && (
            <div className="space-y-4">
              <p className="text-white/30 text-xs uppercase tracking-widest font-semibold">API Keys</p>

              <div className="bg-[#111] border border-white/7 rounded-xl p-5 space-y-4">
                <div>
                  <p className="text-white/40 text-xs mb-1.5">Your API key</p>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 font-mono text-white/50 text-sm">
                      {apiKeyRevealed ? apiKey : 'cs_live_' + '•'.repeat(28)}
                    </div>
                    <button
                      onClick={() => setApiKeyRevealed(r => !r)}
                      className="px-4 py-2.5 bg-white/8 hover:bg-white/12 text-white/60 text-sm rounded-xl transition-colors shrink-0"
                    >
                      {apiKeyRevealed ? 'Hide' : 'Reveal'}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setRegenerateModal(true)}
                    className="px-4 py-2.5 border border-white/10 hover:border-red-500/40 text-white/60 hover:text-red-400 text-sm rounded-xl transition-colors"
                  >
                    Regenerate key
                  </button>
                </div>

                {/* Code snippet */}
                <div>
                  <p className="text-white/40 text-xs mb-2">Example request</p>
                  <pre className="bg-[#0d0d0d] border border-white/8 rounded-xl p-4 text-[11px] text-white/50 font-mono overflow-x-auto">
{`curl -X POST https://api.clawops.studio/v1/agents \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Send a welcome email to new leads"}'`}
                  </pre>
                </div>

                <p className="text-white/20 text-[11px]">
                  Keep your API key secret. Do not share it in client-side code or public repositories.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Regenerate confirm modal */}
      {regenerateModal && (
        <ConfirmModal
          title="Regenerate API key?"
          body="This will invalidate your current API key immediately. Any integrations using the old key will stop working. This action cannot be undone."
          confirmLabel={regenerating ? 'Regenerating...' : 'Regenerate'}
          onConfirm={handleRegenerate}
          onCancel={() => setRegenerateModal(false)}
        />
      )}
    </div>
  )
}
