'use client';

// ============================================================================
// ClawOps Studio — Onboarding: Business Profile Step
// Phase 1 MVP
// ============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BusinessType } from '@/types';

const BUSINESS_TYPES: { value: BusinessType; label: string; description: string }[] = [
  { value: 'Agency', label: 'Agency', description: 'Managing multiple clients' },
  { value: 'SMB', label: 'SMB', description: 'Small to medium business' },
  { value: 'Enterprise', label: 'Enterprise', description: 'Large organization' },
];

const INDUSTRIES = [
  'AI Automation', 'Marketing', 'Sales', 'E-commerce', 'SaaS',
  'Healthcare', 'Finance', 'Legal', 'Education', 'Other',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const STEPS = ['Business', 'Plan', 'Connect', 'Ready'];

  const handleBusinessSubmit = () => {
    if (!businessName || !businessType) return;
    setStep(2);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
            </svg>
          </div>
          <span className="font-bold text-white">ClawOps</span>
        </div>
        <div className="text-sm text-white/30">
          Step {step} of {STEPS.length}
        </div>
      </div>

      {/* Progress */}
      <div className="px-8 mb-8">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`h-1 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? 'bg-[#00D4FF]' : 'bg-white/[0.08]'
              }`} />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-lg">
          {/* Step 1: Business Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Tell us about your business</h1>
                <p className="text-sm text-white/40">This helps us tailor your AI workforce</p>
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 space-y-5">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Acme Corporation"
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-2 font-medium">Business Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {BUSINESS_TYPES.map((bt) => (
                      <button
                        key={bt.value}
                        onClick={() => setBusinessType(bt.value)}
                        className={`rounded-xl p-3 border text-center transition-colors ${
                          businessType === bt.value
                            ? 'bg-[#00D4FF]/10 border-[#00D4FF]/30 text-[#00D4FF]'
                            : 'bg-white/[0.02] border-white/[0.08] text-white/60 hover:border-white/[0.15]'
                        }`}
                      >
                        <p className="text-sm font-semibold">{bt.label}</p>
                        <p className="text-[10px] mt-0.5 opacity-60">{bt.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Industry</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00D4FF]/40 transition-colors"
                  >
                    <option value="" className="bg-[#0a0a14]">Select industry</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind} className="bg-[#0a0a14]">{ind}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Website (optional)</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourcompany.com"
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 transition-colors"
                  />
                </div>

                <button
                  onClick={handleBusinessSubmit}
                  disabled={!businessName || !businessType}
                  className="w-full btn btn-primary justify-center py-3 disabled:opacity-40"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Plan Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Choose your plan</h1>
                <p className="text-sm text-white/40">Start with what you need, upgrade anytime</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'growth',
                    name: 'AI Employee Pro',
                    price: '$499',
                    setup: '$499 setup',
                    features: '3 AI Agents · 25 Workflows · Priority Support',
                    popular: true,
                  },
                  {
                    id: 'starter',
                    name: 'AI Assistant Lite',
                    price: '$299',
                    setup: '$499 setup',
                    features: '1 AI Agent · 5 Workflows · Email Support',
                    popular: false,
                  },
                  {
                    id: 'pro',
                    name: 'Vertical AI Specialist',
                    price: '$799',
                    setup: '$999 setup',
                    features: '10 AI Agents · Unlimited Workflows · Dedicated Support',
                    popular: false,
                  },
                ].map((plan) => (
                  <button
                    key={plan.id}
                    className={`w-full rounded-xl p-4 border text-left transition-all ${
                      plan.popular
                        ? 'bg-[#00D4FF]/5 border-[#00D4FF]/30 ring-1 ring-[#00D4FF]/20'
                        : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-white">{plan.name}</h3>
                          {plan.popular && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20">
                              POPULAR
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/30 mt-0.5">{plan.features}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-bold text-white font-mono">{plan.price}</p>
                        <p className="text-[10px] text-white/25">/month + {plan.setup}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full btn btn-primary justify-center py-3"
              >
                Continue with Growth Plan
              </button>
              <button onClick={() => setStep(1)} className="w-full text-center text-sm text-white/30 hover:text-white/50 transition-colors">
                ← Back
              </button>
            </div>
          )}

          {/* Step 3: Connect OpenClaw */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-2">Connect OpenClaw</h1>
                <p className="text-sm text-white/40">Link your OpenClaw instance to power the dashboard</p>
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 space-y-5">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Connection Name</label>
                  <input
                    type="text"
                    placeholder="My OpenClaw Instance"
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Gateway URL</label>
                  <input
                    type="url"
                    placeholder="https://gateway.yourdomain.com"
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">API Key</label>
                  <input
                    type="password"
                    placeholder="sk-openclaw-..."
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Workspace Path</label>
                  <input
                    type="text"
                    placeholder="/root/.openclaw"
                    className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5 font-medium">Environment</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['development', 'staging', 'production'] as const).map((env) => (
                      <button
                        key={env}
                        className={`rounded-lg py-2 text-xs font-mono font-semibold border transition-colors ${
                          env === 'production'
                            ? 'bg-[#00D4FF]/10 border-[#00D4FF]/30 text-[#00D4FF]'
                            : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:border-white/[0.15]'
                        }`}
                      >
                        {env}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setStep(4)}
                  className="w-full btn btn-primary justify-center py-3"
                >
                  Test & Connect
                </button>
                <button onClick={() => setStep(2)} className="w-full text-center text-sm text-white/30 hover:text-white/50 transition-colors">
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Welcome */}
          {step === 4 && (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center glow-blue">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">You&apos;re all set!</h1>
                <p className="text-sm text-white/40">Your ClawOps workspace is ready. Let&apos;s build something great.</p>
              </div>

              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 text-left space-y-4">
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">What you can do next</h3>
                {[
                  { icon: '💬', text: 'Start a chat with your AI agent', href: '/dashboard/chat' },
                  { icon: '📋', text: 'Create your first task', href: '/dashboard/tasks' },
                  { icon: '⚙️', text: 'Explore Mission Control', href: '/dashboard/mission-control' },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors group"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm text-white/70 group-hover:text-white transition-colors">{item.text}</span>
                    <span className="ml-auto text-white/20 group-hover:text-[#00D4FF]/60 transition-colors">→</span>
                  </a>
                ))}
              </div>

              <button
                onClick={() => router.push('/dashboard')}
                className="w-full btn btn-primary justify-center py-3"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
