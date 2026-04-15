'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { User, Shield, Key, ExternalLink } from 'lucide-react'

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ full_name: '', company: '' })

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/auth/login'
        return
      }
      setUser(session.user)

      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(p)
      setForm({
        full_name: p?.full_name || session.user.user_metadata?.full_name || '',
        company: p?.company || session.user.user_metadata?.company || '',
      })
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        full_name: form.full_name,
        company: form.company,
        updated_at: new Date().toISOString(),
      })

    setSaving(false)
    setMessage(error ? `Error: ${error.message}` : '✅ Profile saved!')
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#04040c] flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
      </div>
    )
  }

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const initials = form.full_name
    ? form.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] || 'U').toUpperCase()

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="border-b border-[rgba(255,255,255,0.06)] bg-[rgba(4,4,12,0.8)] backdrop-blur-xl px-8 py-6">
        <h1 className="text-2xl font-bold text-white">Account Settings</h1>
        <p className="mt-1 text-sm text-[rgba(255,255,255,0.4)]">Manage your profile and preferences</p>
      </div>

      <div className="px-8 py-6 max-w-2xl space-y-6">
        {/* Avatar & Email */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#00D4FF]" />
            Profile
          </h2>

          <div className="flex items-center gap-4 mb-6">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#6600FF] flex items-center justify-center text-xl font-bold text-white">
                {initials}
              </div>
            )}
            <div>
              <p className="text-white font-medium">{form.full_name || 'No name set'}</p>
              <p className="text-sm text-white/40">{user?.email}</p>
              <p className="text-xs text-white/25 mt-1">ID: {user?.id?.slice(0, 8)}...</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Full Name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#00D4FF]/50 transition-colors"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Company</label>
              <input
                type="text"
                value={form.company}
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-[#00D4FF]/50 transition-colors"
                placeholder="Your company name"
              />
            </div>

            {message && (
              <p className={`text-sm ${message.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>
                {message}
              </p>
            )}

            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg px-5 py-2 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)' }}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#00D4FF]" />
            Account Info
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
              <span className="text-sm text-white/50">Email</span>
              <span className="text-sm text-white">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
              <span className="text-sm text-white/50">User ID</span>
              <span className="text-xs text-white/30 font-mono">{user?.id}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)]">
              <span className="text-sm text-white/50">Email Verified</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${user?.email_confirmed_at ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'}`}>
                {user?.email_confirmed_at ? 'Verified' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-white/50">Member Since</span>
              <span className="text-xs text-white/30">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* VPS Connection */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-4 h-4 text-[#00D4FF]" />
            VPS Connection
          </h2>
          <p className="text-sm text-white/40 mb-3">
            Your VPS is connected via Cloudflare Tunnel. The tunnel URL is:
          </p>
          <div className="rounded-lg bg-black/30 px-4 py-3 border border-[rgba(255,255,255,0.06)]">
            <code className="text-xs text-[#00D4FF] break-all">
              https://episode-curves-challenges-griffin.trycloudflare.com
            </code>
          </div>
          <p className="text-xs text-white/25 mt-2">
            This URL is registered to your account. Manage your instances at the Instances page.
          </p>
        </div>

      </div>
    </main>
  )
}
