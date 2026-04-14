'use client';

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useSearchParams } from 'next/navigation';
import { useOpenClaw } from '@/contexts/OpenClawContext';
import {
  User,
  CreditCard,
  Shield,
  Bell,
  Key,
  Upload,
  Check,
  Loader2,
  Crown,
  Sparkles,
  Zap,
  Link2,
  Plug,
  ExternalLink,
} from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'For individuals getting started',
    features: ['1 Agent', '5 Skills', 'Basic Support', '1,000 messages/mo'],
    current: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$99',
    period: '/month',
    description: 'For power users and small teams',
    features: ['5 Agents', 'Unlimited Skills', 'Priority Support', '25,000 messages/mo', 'Custom Integrations'],
    current: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    price: '$299',
    period: '/month',
    description: 'For agencies managing clients',
    features: ['Unlimited Agents', 'Unlimited Skills', 'Dedicated Support', 'Unlimited Messages', 'White-label', 'Multi-tenant Dashboard'],
    current: false,
  },
];

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white/50">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  )
}

function SettingsContent() {
  const searchParams = useSearchParams()
  const urlTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(urlTab || 'profile');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (urlTab) setActiveTab(urlTab)
    // Read sb-user-id cookie for back navigation
    const match = document.cookie.match(/sb-user-id=([^;]+)/)
    if (match) setUserId(match[1])
  }, [urlTab])
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api', label: 'API Keys', icon: Key },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Settings Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r p-4" style={{ background: '#0a0a0f', borderColor: 'rgba(255,255,255,0.06)' }}>
        <h2 className="text-sm font-semibold text-white mb-4 px-3">Settings</h2>
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-cyan-500/10 text-cyan-400 font-medium'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
        {/* Back to Overview */}
        {userId && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <a
              href={`/dashboard/${userId}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              ← Overview
            </a>
          </div>
        )}
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'profile' && <ProfileTab uploading={uploading} setUploading={setUploading} saved={saved} setSaved={setSaved} />}
        {activeTab === 'subscription' && <SubscriptionTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'integrations' && <IntegrationsTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'api' && <ApiTab />}
      </div>
    </div>
  );
}

function ProfileTab({ uploading, setUploading, saved, setSaved }: { uploading: boolean; setUploading: (v: boolean) => void; saved: boolean; setSaved: (v: boolean) => void }) {
  const [form, setForm] = useState<{
    fullName: string;
    email: string;
    company: string;
    timezone: string;
    bio: string;
  }>({
    fullName: '',
    email: '',
    company: '',
    timezone: 'Asia/Kolkata',
    bio: '',
  })

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const user = session.user
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setForm(prev => ({
        ...prev,
        fullName: (p?.full_name as string) || (user.user_metadata?.full_name as string) || '',
        email: user.email || '',
        company: (p?.company as string) || (user.user_metadata?.company as string) || '',
      }))
    }
    load()
  }, [])

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Upload to Supabase Storage
    const ext = file.name.split('.').pop()
    const path = `avatars/${session.user.id}.${ext}`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (!error) {
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      await supabase.from('profiles').upsert({
        id: session.user.id,
        avatar_url: urlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
    }
    setUploading(false)
  };

  const handleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from('profiles').upsert({
      id: session.user.id,
      full_name: form.fullName,
      company: form.company,
      updated_at: new Date().toISOString(),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-sm mt-1 text-white/50">Manage your personal information</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-6 p-6 rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
            P
          </div>
          <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-cyan-500 border-2 border-[#0a0a0f] flex items-center justify-center cursor-pointer hover:bg-cyan-400 transition-colors">
            <Upload className="w-3.5 h-3.5 text-white" />
            <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
          </label>
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>
        <div>
          <p className="font-semibold text-white">Profile Photo</p>
          <p className="text-sm text-white/50 mt-0.5">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {[
          { key: 'fullName', label: 'Full Name', type: 'text' },
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'company', label: 'Company', type: 'text' },
        ].map((field) => (
          <div key={field.key} className="space-y-1.5">
            <label className="text-sm font-medium text-white/70">{field.label}</label>
            <input
              type={field.type}
              value={form[field.key as keyof typeof form]}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              className="w-full max-w-md bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/40 transition-colors"
            />
          </div>
        ))}

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white/70">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full max-w-md bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/40 transition-colors resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-white/70">Timezone</label>
          <select
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            className="w-full max-w-md bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
          >
            <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
            <option value="America/New_York">America/New_York (EST)</option>
            <option value="Europe/London">Europe/London (GMT)</option>
            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
          </select>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saved}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
        style={{
          background: saved ? '#22c55e' : 'linear-gradient(135deg, #00D4FF, #6600FF)',
          boxShadow: saved ? 'none' : '0 0 20px rgba(0,212,255,0.25)',
        }}
      >
        {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Changes'}
      </button>
    </div>
  );
}

function SubscriptionTab() {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .single()
      setSubscription(sub)
      setLoading(false)
    }
    load()
  }, [])

  const planName = subscription?.plan === 'agency' ? 'Agency' : subscription?.plan === 'team' ? 'Team' : subscription?.plan === 'pro' ? 'Pro' : subscription?.plan === 'trial' ? 'Trial' : '—'
  const planPrice = subscription?.amount ? `$${Number(subscription.amount)}` : '$0'
  const nextBilling = subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
  const agentLimit = subscription?.plan === 'agency' ? 'Unlimited' : subscription?.plan === 'team' ? '15' : subscription?.plan === 'pro' ? '5' : '1'
  const statusColor = subscription?.status === 'active' ? 'cyan' : subscription?.status === 'trialing' ? 'yellow' : 'red'
  const statusLabel = subscription?.status === 'active' ? 'Active' : subscription?.status === 'trialing' ? 'Trial' : subscription?.status === 'past_due' ? 'Past Due' : 'Cancelled'

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription</h1>
        <p className="text-sm mt-1 text-white/50">Manage your plan and billing</p>
      </div>

      {/* Current Plan Banner */}
      {loading ? (
        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 p-6 animate-pulse">
          <div className="h-6 w-48 bg-white/10 rounded mb-2" />
          <div className="h-4 w-32 bg-white/5 rounded" />
        </div>
      ) : (
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Crown className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-white/50">Current Plan — <span className={`text-${statusColor}-400`}>{statusLabel}</span></p>
              <p className="text-xl font-bold text-white">{planName} — {planPrice}/month</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors">
            Change Plan
          </button>
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div>
            <p className="text-white/50">Agents</p>
            <p className="font-semibold text-white">Unlimited</p>
          </div>
          <div>
            <p className="text-white/50">Messages</p>
            <p className="font-semibold text-white">Unlimited</p>
          </div>
          <div>
            <p className="text-white/50">Next Billing</p>
            <p className="font-semibold text-white">{nextBilling}</p>
          </div>
        </div>
      </div>
      )}

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border p-6 transition-all ${
              plan.current
                ? 'border-cyan-500/30 bg-cyan-500/5'
                : 'border-white/10 bg-white/[0.02] hover:border-white/20'
            }`}
          >
            {plan.current && (
              <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-medium mb-2">
                CURRENT PLAN
              </span>
            )}
            <h3 className="text-lg font-bold text-white">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-3xl font-bold text-white">{plan.price}</span>
              <span className="text-sm text-white/50">{plan.period}</span>
            </div>
            <p className="text-xs text-white/50 mt-1">{plan.description}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <Check className="w-3.5 h-3.5 text-cyan-500" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`w-full mt-6 py-2 rounded-lg text-sm font-medium transition-all ${
                plan.current
                  ? 'bg-cyan-500/10 text-cyan-400 cursor-default'
                  : plan.id === 'agency'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:scale-105'
                  : 'border border-white/10 text-white/70 hover:text-white hover:border-white/20'
              }`}
              disabled={plan.current}
            >
              {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
            </button>
          </div>
        ))}
      </div>

      {/* Billing History */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Billing History</h3>
        <div className="rounded-xl border border-white/10 overflow-hidden">
          {[
            { date: 'Apr 11, 2026', amount: '$99.00', status: 'Paid', invoice: true },
            { date: 'Mar 11, 2026', amount: '$99.00', status: 'Paid', invoice: true },
            { date: 'Feb 11, 2026', amount: '$99.00', status: 'Paid', invoice: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-4">
                <span className="text-sm text-white">{item.date}</span>
                <span className="text-sm font-semibold text-white">{item.amount}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">{item.status}</span>
              </div>
              {item.invoice && (
                <button className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">Download Invoice</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [mfa, setMfa] = useState(false);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Security</h1>
        <p className="text-sm mt-1 text-white/50">Protect your account</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/[0.05]">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
              <p className="text-xs text-white/50">Add an extra layer of security</p>
            </div>
          </div>
          <button
            onClick={() => setMfa(!mfa)}
            className={`w-12 h-6 rounded-full transition-colors relative ${mfa ? 'bg-cyan-500' : 'bg-white/10'}`}
          >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${mfa ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/[0.05]">
              <Key className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Change Password</p>
              <p className="text-xs text-white/50">Last changed 30 days ago</p>
            </div>
          </div>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors">
            Change
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/[0.05]">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Active Sessions</p>
              <p className="text-xs text-white/50">2 devices currently active</p>
            </div>
          </div>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-white/50 border border-white/10 hover:text-white hover:border-white/20 transition-colors">
            View All
          </button>
        </div>
      </div>
    </div>
  );
}

function IntegrationsTab() {
  const [activeSection, setActiveSection] = useState<'ghl' | 'n8n' | 'google'>('ghl')
  const [ghlConfig, setGhlConfig] = useState({ GHL_PIT_TOKEN: '', GHL_LOCATION_ID: '' })
  const [n8nConfig, setN8nConfig] = useState({ N8N_API_URL: '', N8N_API_KEY: '' })
  const [googleConfig, setGoogleConfig] = useState({ N8N_MCP_ENDPOINT: '' })
  const [saving, setSaving] = useState('')
  const [saved, setSaved] = useState('')
  const [testStatus, setTestStatus] = useState<Record<string, 'idle' | 'testing' | 'ok' | 'error'>>({})
  const [connected, setConnected] = useState<Record<string, boolean>>({})

  // Load existing configs on mount
  useState(() => {
    loadIntegrations()
  })

  const loadIntegrations = async () => {
    try {
      const res = await fetch('/api/integrations', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        if (data.integrations) {
          setConnected({
            ghl: data.integrations.ghl?.connected || false,
            n8n: data.integrations.n8n?.connected || false,
            'google-workspace-mcp': data.integrations['google-workspace-mcp']?.connected || false,
          })
          if (data.integrations.ghl?.config) setGhlConfig(data.integrations.ghl.config)
          if (data.integrations.n8n?.config) setN8nConfig(data.integrations.n8n.config)
          if (data.integrations['google-workspace-mcp']?.config) setGoogleConfig(data.integrations['google-workspace-mcp'].config)
        }
      }
    } catch { /* silently fail */ }
  }

  const saveIntegration = async (slug: string, config: Record<string, string>) => {
    setSaving(slug)
    setSaved('')
    try {
      const res = await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ skill_slug: slug, config_data: config }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert('Error: ' + (data.error || 'Failed to save'))
      } else {
        setSaved(slug)
        setConnected((prev) => ({ ...prev, [slug]: true }))
        setTimeout(() => setSaved(''), 2000)
      }
    } catch (err) {
      alert('Failed to save: Network error')
    }
    setSaving('')
  }

  const disconnectIntegration = async (slug: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) return
    try {
      await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ skill_slug: slug, config_data: {}, action: 'disconnect' }),
      })
      setConnected((prev) => ({ ...prev, [slug]: false }))
    } catch { /* fail silently */ }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="text-sm mt-1 text-white/50">Connect your tools and platforms to ClawOps</p>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            id: 'ghl',
            label: 'GoHighLevel',
            icon: '📊',
            color: '#FF6B35',
            connected: connected.ghl,
            desc: 'CRM, contacts, pipelines, SMS',
          },
          {
            id: 'n8n',
            label: 'n8n',
            icon: '⚙️',
            color: '#EA4B71',
            connected: connected.n8n,
            desc: 'Workflow automation, webhooks',
          },
          {
            id: 'google',
            label: 'Google Workspace',
            icon: '📁',
            color: '#4285F4',
            connected: connected['google-workspace-mcp'],
            desc: 'Gmail, Drive, Docs, Sheets',
          },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as 'ghl' | 'n8n' | 'google')}
            className={`p-4 rounded-xl border transition-all text-left ${
              activeSection === item.id
                ? 'border-white/20 bg-white/[0.05]'
                : 'border-white/10 bg-white/[0.02] hover:border-white/15'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{item.icon}</span>
              {item.connected ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                  Connected
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 font-medium">
                  Not connected
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-white">{item.label}</p>
            <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* GHL Form */}
      {activeSection === 'ghl' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>📊</span> GoHighLevel CRM
              </h2>
              <p className="text-sm text-white/50 mt-0.5">
                Connect your GHL account to let AI agents manage contacts, pipelines, and SMS.
              </p>
            </div>
            {connected.ghl && (
              <button
                onClick={() => disconnectIntegration('ghl')}
                className="text-xs px-3 py-1.5 rounded-lg text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>

          <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                GHL Private Integration Token (PIT)
              </label>
              <input
                type="password"
                value={ghlConfig.GHL_PIT_TOKEN}
                onChange={(e) => setGhlConfig({ ...ghlConfig, GHL_PIT_TOKEN: e.target.value })}
                placeholder="pit_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full max-w-lg bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/40 transition-colors font-mono"
              />
              <p className="text-xs text-white/30">
                Get your PIT token from GHL → Settings → API Keys → Private Integration Token
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                GHL Location ID
              </label>
              <input
                type="text"
                value={ghlConfig.GHL_LOCATION_ID}
                onChange={(e) => setGhlConfig({ ...ghlConfig, GHL_LOCATION_ID: e.target.value })}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full max-w-lg bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/40 transition-colors font-mono"
              />
              <p className="text-xs text-white/30">
                Find Location ID in GHL → Settings → Business Info → Location ID
              </p>
            </div>

            <button
              onClick={() => saveIntegration('ghl', ghlConfig)}
              disabled={saving === 'ghl'}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: saved === 'ghl' ? '#22c55e' : 'linear-gradient(135deg, #FF6B35, #ff8c5a)',
                boxShadow: saved === 'ghl' ? 'none' : '0 0 20px rgba(255,107,53,0.25)',
              }}
            >
              {saving === 'ghl' ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> :
               saved === 'ghl' ? <><Check className="w-4 h-4" /> Saved!</> :
               <><Plug className="w-4 h-4" /> Connect GoHighLevel</>}
            </button>
          </div>

          <div className="rounded-xl border border-[#FF6B35]/20 bg-[#FF6B35]/5 p-4">
            <h3 className="text-sm font-semibold text-white mb-2">What you can do with GHL</h3>
            <ul className="space-y-1.5">
              {[
                'Search and manage contacts',
                'Move pipeline stages automatically',
                'Add/remove tags on contacts',
                'Send SMS messages',
                'Monitor pipeline health',
                'Track lead sources',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                  <Check className="w-3.5 h-3.5 text-[#FF6B35] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* n8n Form */}
      {activeSection === 'n8n' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>⚙️</span> n8n Workflow Automation
              </h2>
              <p className="text-sm text-white/50 mt-0.5">
                Connect n8n to give AI agents the power to trigger automations and manage workflows.
              </p>
            </div>
            {connected.n8n && (
              <button
                onClick={() => disconnectIntegration('n8n')}
                className="text-xs px-3 py-1.5 rounded-lg text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>

          <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                n8n API URL
              </label>
              <input
                type="text"
                value={n8nConfig.N8N_API_URL}
                onChange={(e) => setN8nConfig({ ...n8nConfig, N8N_API_URL: e.target.value })}
                placeholder="https://your-n8n.example.com"
                className="w-full max-w-lg bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/40 transition-colors"
              />
              <p className="text-xs text-white/30">The base URL of your n8n instance</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                n8n API Key
              </label>
              <input
                type="password"
                value={n8nConfig.N8N_API_KEY}
                onChange={(e) => setN8nConfig({ ...n8nConfig, N8N_API_KEY: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full max-w-lg bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/40 transition-colors font-mono"
              />
              <p className="text-xs text-white/30">
                Get from n8n → Settings → API Key
              </p>
            </div>

            <button
              onClick={() => saveIntegration('n8n', n8nConfig)}
              disabled={saving === 'n8n'}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: saved === 'n8n' ? '#22c55e' : 'linear-gradient(135deg, #EA4B71, #ff6b8a)',
                boxShadow: saved === 'n8n' ? 'none' : '0 0 20px rgba(234,75,113,0.25)',
              }}
            >
              {saving === 'n8n' ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> :
               saved === 'n8n' ? <><Check className="w-4 h-4" /> Saved!</> :
               <><Plug className="w-4 h-4" /> Connect n8n</>}
            </button>
          </div>

          <div className="rounded-xl border border-[#EA4B71]/20 bg-[#EA4B71]/5 p-4">
            <h3 className="text-sm font-semibold text-white mb-2">What you can do with n8n</h3>
            <ul className="space-y-1.5">
              {[
                'Trigger workflows via webhooks',
                'Monitor workflow health',
                'Query execution history',
                'Manage n8n credentials',
                'Trigger AI automations',
                'Connect 400+ integrations',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/60">
                  <Check className="w-3.5 h-3.5 text-[#EA4B71] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Google Workspace Form */}
      {activeSection === 'google' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>📁</span> Google Workspace
              </h2>
              <p className="text-sm text-white/50 mt-0.5">
                Connect Gmail, Drive, Docs, Sheets, and Calendar via n8n MCP server.
              </p>
            </div>
            {connected['google-workspace-mcp'] && (
              <button
                onClick={() => disconnectIntegration('google-workspace-mcp')}
                className="text-xs px-3 py-1.5 rounded-lg text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>

          <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="rounded-lg border border-[#4285F4]/30 bg-[#4285F4]/5 p-4 mb-4">
              <p className="text-sm text-white/70">
                <strong className="text-white">How it works:</strong> Google Workspace is connected through
                our n8n MCP server. Your n8n instance must have Google OAuth configured.
              </p>
              <a
                href="/guides/google-workspace"
                className="inline-flex items-center gap-1 text-xs text-[#4285F4] mt-2 hover:underline"
              >
                View setup guide <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-white/70 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                n8n MCP Endpoint URL
              </label>
              <input
                type="text"
                value={googleConfig.N8N_MCP_ENDPOINT}
                onChange={(e) => setGoogleConfig({ ...googleConfig, N8N_MCP_ENDPOINT: e.target.value })}
                placeholder="https://your-n8n.example.com/n8n/mcp/your-session-id"
                className="w-full max-w-lg bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/40 transition-colors"
              />
              <p className="text-xs text-white/30">
                Your n8n MCP server endpoint (from n8n → Settings → MCP)
              </p>
            </div>

            <button
              onClick={() => saveIntegration('google-workspace-mcp', googleConfig)}
              disabled={saving === 'google-workspace-mcp'}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{
                background: saved === 'google-workspace-mcp' ? '#22c55e' : 'linear-gradient(135deg, #4285F4, #6ab7ff)',
                boxShadow: saved === 'google-workspace-mcp' ? 'none' : '0 0 20px rgba(66,133,244,0.25)',
              }}
            >
              {saving === 'google-workspace-mcp' ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> :
               saved === 'google-workspace-mcp' ? <><Check className="w-4 h-4" /> Saved!</> :
               <><Plug className="w-4 h-4" /> Connect Google Workspace</>}
            </button>
          </div>

          <div className="rounded-xl border border-[#4285F4]/20 bg-[#4285F4]/5 p-4">
            <h3 className="text-sm font-semibold text-white mb-2">Available tools (44 total)</h3>
            <div className="grid grid-cols-2 gap-1">
              {['Gmail: read, send, search', 'Drive: list, upload, download', 'Docs: create, read, share', 'Sheets: read, write, format', 'Calendar: events, schedules', 'Tasks: create, complete, list'].map((item) => (
                <li key={item} className="flex items-center gap-2 text-xs text-white/60">
                  <Check className="w-3 h-3 text-[#4285F4] flex-shrink-0" />
                  {item}
                </li>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NotificationsTab() {
  const [settings, setSettings] = useState({
    email: true,
    push: false,
    agents: true,
    billing: true,
    newsletter: false,
  });

  const Toggle = ({ key_name }: { key_name: keyof typeof settings }) => (
    <button
      onClick={() => setSettings({ ...settings, [key_name]: !settings[key_name] })}
      className={`w-10 h-5 rounded-full transition-colors relative ${settings[key_name] ? 'bg-cyan-500' : 'bg-white/10'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings[key_name] ? 'left-5' : 'left-0.5'}`} />
    </button>
  );

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-sm mt-1 text-white/50">Control how you receive alerts</p>
      </div>

      <div className="space-y-3">
        {[
          { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
          { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
          { key: 'agents', label: 'Agent Alerts', desc: 'When agents need attention' },
          { key: 'billing', label: 'Billing Alerts', desc: 'Payment and subscription updates' },
          { key: 'newsletter', label: 'Newsletter', desc: 'Product updates and tips' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
            <div>
              <p className="text-sm font-medium text-white">{item.label}</p>
              <p className="text-xs text-white/50">{item.desc}</p>
            </div>
            <Toggle key_name={item.key as keyof typeof settings} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiTab() {
  const [copied, setCopied] = useState(false);
  const testKey = 'oc_tsk_test_a1b2c3d4e5f6g7h8i9j0';

  const copyKey = () => {
    navigator.clipboard.writeText(testKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">API Keys</h1>
        <p className="text-sm mt-1 text-white/50">Use API keys to access ClawOps programmatically</p>
      </div>

      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Production Key</p>
              <p className="text-xs text-green-400">Active</p>
            </div>
          </div>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors">
            Revoke
          </button>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-black/20">
          <code className="flex-1 text-sm font-mono text-white/70">{testKey}</code>
          <button onClick={copyKey} className="text-xs px-3 py-1 rounded-lg text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)', boxShadow: '0 0 20px rgba(0,212,255,0.25)' }}>
        <Zap className="w-4 h-4" />
        Generate New Key
      </button>
    </div>
  );
}
