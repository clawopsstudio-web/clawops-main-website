'use client';

import { useState } from 'react';
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
  const [activeTab, setActiveTab] = useState('profile');
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
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
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'profile' && <ProfileTab uploading={uploading} setUploading={setUploading} saved={saved} setSaved={setSaved} />}
        {activeTab === 'subscription' && <SubscriptionTab />}
        {activeTab === 'security' && <SecurityTab />}
        {activeTab === 'notifications' && <NotificationsTab />}
        {activeTab === 'api' && <ApiTab />}
      </div>
    </div>
  );
}

function ProfileTab({ uploading, setUploading, saved, setSaved }: { uploading: boolean; setUploading: (v: boolean) => void; saved: boolean; setSaved: (v: boolean) => void }) {
  const [form, setForm] = useState({
    fullName: 'Pulkit',
    email: 'pulkit@clawops.studio',
    company: 'ClawOps Studio',
    timezone: 'Asia/Kolkata',
    bio: 'Building AI-powered automation for businesses.',
  });

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await new Promise(r => setTimeout(r, 1500));
    setUploading(false);
  };

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 500));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
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
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Subscription</h1>
        <p className="text-sm mt-1 text-white/50">Manage your plan and billing</p>
      </div>

      {/* Current Plan Banner */}
      <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Crown className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-white/50">Current Plan</p>
              <p className="text-xl font-bold text-white">Pro — $99/month</p>
            </div>
          </div>
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 transition-colors">
            Change Plan
          </button>
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm">
          <div>
            <p className="text-white/50">Agents</p>
            <p className="font-semibold text-white">5 / 5 used</p>
          </div>
          <div>
            <p className="text-white/50">Messages</p>
            <p className="font-semibold text-white">12,450 / 25,000</p>
          </div>
          <div>
            <p className="text-white/50">Next Billing</p>
            <p className="font-semibold text-white">May 11, 2026</p>
          </div>
        </div>
        <div className="mt-3 w-full h-1.5 rounded-full bg-white/5">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-purple-500" style={{ width: '50%' }} />
        </div>
      </div>

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
