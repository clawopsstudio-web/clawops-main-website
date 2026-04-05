'use client';

// ============================================================================
// ClawOps Studio — Settings Page
// Phase 1 MVP
// ============================================================================

import { useState } from 'react';
import { useAuthStore, useBusinessProfileStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import PageHeader from '@/components/dashboard/PageHeader';
import Card from '@/components/dashboard/Card';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { profile, updateProfile } = useBusinessProfileStore();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'subscription', label: 'Subscription' },
    { id: 'api', label: 'API Keys' },
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-white/[0.06]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-[#00D4FF] border-[#00D4FF]'
                : 'text-white/40 border-transparent hover:text-white/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <Card title="Personal Information">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/20 flex items-center justify-center">
                  <span className="text-xl font-bold text-[#00D4FF]">
                    {user?.fullName?.[0] ?? 'H'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-white/80">{user?.fullName}</p>
                  <p className="text-xs text-white/30">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    defaultValue={user?.fullName}
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00D4FF]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Email</label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    disabled
                    className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/40 cursor-not-allowed"
                  />
                </div>
              </div>
              <button className="btn btn-primary text-sm py-2 px-4">Save Changes</button>
            </div>
          </Card>

          <Card title="Business Profile">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Business Name</label>
                  <input
                    type="text"
                    defaultValue={profile?.businessName}
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00D4FF]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Industry</label>
                  <input
                    type="text"
                    defaultValue={profile?.industry}
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00D4FF]/40"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Website</label>
                <input
                  type="url"
                  defaultValue={profile?.websiteUrl}
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00D4FF]/40"
                />
              </div>
              <button className="btn btn-primary text-sm py-2 px-4">Update Business</button>
            </div>
          </Card>
        </div>
      )}

      {/* Security */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <Card title="Password">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00D4FF]/40" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00D4FF]/40" />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00D4FF]/40" />
                </div>
              </div>
              <button className="btn btn-primary text-sm py-2 px-4">Update Password</button>
            </div>
          </Card>

          <Card title="Two-Factor Authentication">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70 mb-1">
                  {user?.totpEnabled ? 'TOTP 2FA is enabled' : 'TOTP 2FA is not configured'}
                </p>
                <p className="text-xs text-white/30">
                  {user?.totpEnabled
                    ? 'Your account is protected with authenticator app'
                    : 'Add an authenticator app for extra security'}
                </p>
              </div>
              <button className={`text-sm py-2 px-4 rounded-lg border font-medium transition-colors ${
                user?.totpEnabled
                  ? 'bg-green-400/10 text-green-400 border-green-400/20'
                  : 'btn btn-primary'
              }`}>
                {user?.totpEnabled ? 'Enabled' : 'Enable 2FA'}
              </button>
            </div>
          </Card>

          <Card title="Sessions">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <div>
                  <p className="text-sm text-white/70">Current Session</p>
                  <p className="text-[10px] font-mono text-white/25">Last 7 days</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-green-400" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-white/70">API Token</p>
                  <p className="text-[10px] font-mono text-white/25">JWT • expires in 7 days</p>
                </div>
                <button className="text-xs text-red-400/50 hover:text-red-400 transition-colors px-2 py-1 rounded border border-red-400/10 hover:border-red-400/20">
                  Revoke
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Subscription */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <Card title="Current Plan">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <div>
                <p className="text-base font-bold text-white">Growth Plan</p>
                <p className="text-sm text-white/30">$499/month</p>
              </div>
              <span className="ml-auto text-xs font-mono px-2 py-1 rounded border bg-green-400/10 text-green-400 border-green-400/20">
                Active
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4 text-center">
              {[['3', 'Agents'], ['25', 'Workflows'], ['3', 'Seats']].map(([v, l]) => (
                <div key={l} className="rounded-lg bg-white/[0.02] border border-white/[0.05] p-3">
                  <p className="text-lg font-bold text-white/80 font-mono">{v}</p>
                  <p className="text-[10px] text-white/30">{l}</p>
                </div>
              ))}
            </div>
            <div className="text-xs text-white/25 mb-3">
              Renews {formatDate('2026-04-01T00:00:00Z')}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-primary text-sm py-2 px-4">Upgrade Plan</button>
              <button className="btn btn-ghost text-sm py-2 px-4">Manage Billing</button>
            </div>
          </Card>
        </div>
      )}

      {/* API Keys */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <Card title="API Keys">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                <div>
                  <p className="text-sm text-white/70">Dashboard API Key</p>
                  <p className="text-[10px] font-mono text-white/25">sk_live_••••••••••••</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs text-white/40 hover:text-white/60 transition-colors px-2 py-1 rounded border border-white/[0.06]">Copy</button>
                  <button className="text-xs text-red-400/50 hover:text-red-400 transition-colors px-2 py-1 rounded border border-red-400/10">Revoke</button>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
                <div>
                  <p className="text-sm text-white/70">Webhook Secret</p>
                  <p className="text-[10px] font-mono text-white/25">whsec_••••••••••••</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-xs text-white/40 hover:text-white/60 transition-colors px-2 py-1 rounded border border-white/[0.06]">Copy</button>
                  <button className="text-xs text-red-400/50 hover:text-red-400 transition-colors px-2 py-1 rounded border border-red-400/10">Revoke</button>
                </div>
              </div>
            </div>
            <button className="btn btn-ghost text-sm py-2 px-4 mt-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Generate New Key
            </button>
          </Card>
        </div>
      )}

      {/* Danger Zone */}
      <div className="mt-8 pt-6 border-t border-white/[0.06]">
        <button
          onClick={logout}
          className="text-sm text-red-400/50 hover:text-red-400 transition-colors"
        >
          Sign out of all devices
        </button>
      </div>
    </div>
  );
}
