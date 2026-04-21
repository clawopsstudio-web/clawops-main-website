'use client'

import { useState } from 'react'
import Link from 'next/link'

const MONTHLY_PLANS = [
  {
    name: 'Personal',
    price: 49,
    description: '4 vCPU · 8GB RAM · 75GB NVMe',
    highlight: false,
    badge: null,
    features: [
      '1 agent workspace',
      '850+ tool integrations',
      'Telegram + WhatsApp',
      'Community support',
    ],
  },
  {
    name: 'Team',
    price: 149,
    description: '6 vCPU · 12GB RAM · 100GB NVMe',
    highlight: false,
    badge: null,
    features: [
      '3 agent workspaces',
      '850+ tool integrations',
      'All messaging platforms',
      'Firecrawl included',
      'Priority support (4h response)',
    ],
  },
  {
    name: 'Business',
    price: 299,
    description: '8 vCPU · 24GB RAM · 200GB NVMe',
    highlight: true,
    badge: 'MOST POPULAR',
    features: [
      'Unlimited workspaces',
      '850+ tool integrations',
      'All platforms + GHL',
      'API access',
      'Claude API key included',
      'Priority support (1h response)',
    ],
  },
  {
    name: 'Enterprise',
    price: 349,
    description: '12 vCPU · 48GB RAM · 250GB NVMe',
    highlight: false,
    badge: null,
    features: [
      'Everything in Business ×20 scale',
      'Dedicated account manager',
      'Custom onboarding',
      'SLA guarantee',
    ],
  },
]

const ANNUAL_PLANS = [
  { ...MONTHLY_PLANS[0], price: 39 },
  { ...MONTHLY_PLANS[1], price: 119 },
  { ...MONTHLY_PLANS[2], price: 239 },
  { ...MONTHLY_PLANS[3], price: 279 },
]

const FAQS = [
  {
    q: 'Can I change plans later?',
    a: 'Yes. Upgrade or downgrade anytime from your dashboard. Changes apply immediately.',
  },
  {
    q: 'Is my data private?',
    a: 'Your agents run on your own dedicated server. Your data never touches our infrastructure unless you explicitly connect a third-party integration.',
  },
  {
    q: 'What does setup look like?',
    a: 'You fill in our onboarding form, connect your tools, and your agents are live within 2 hours. No technical skills needed.',
  },
  {
    q: 'What integrations are included?',
    a: '850+ Composio integrations — Gmail, HubSpot, Notion, Slack, Airtable, Linear, and more. All included in every plan.',
  },
  {
    q: 'Do I need technical skills?',
    a: 'No. Setup takes under 5 minutes. If you get stuck, our team sets it up for you free.',
  },
]

const COMPARISON_ROWS = [
  { feature: 'Agent workspaces', values: ['1', '3', 'Unlimited', 'Unlimited'] },
  { feature: 'CPU / RAM', values: ['4 vCPU · 8GB', '6 vCPU · 12GB', '8 vCPU · 24GB', '12 vCPU · 48GB'] },
  { feature: 'Storage (NVMe)', values: ['75GB', '100GB', '200GB', '250GB'] },
  { feature: 'Tool integrations', values: ['850+', '850+', '850+', '850+'] },
  { feature: 'Claude API included', values: ['✗', '✗', '✓', '✓'] },
  { feature: 'White-label', values: ['✗', '✗', '✓', '✓'] },
]

export default function AmpereStylePricing() {
  const [annual, setAnnual] = useState(false)
  const plans = annual ? ANNUAL_PLANS : MONTHLY_PLANS

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Header */}
      <div className="pt-32 pb-16 px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(232,255,71,0.6)] mb-4">
          PRICING
        </p>
        <h1
          className="text-5xl md:text-6xl font-black text-white mb-5 leading-none"
          style={{ fontFamily: 'var(--font-cabinet, sans-serif)', letterSpacing: '-0.02em' }}
        >
          One price. All agents.
        </h1>
        <p className="text-white/50 text-lg max-w-md mx-auto mb-8">
          No per-user fees. No token billing. Pick a plan, connect your tools, deploy your team.
        </p>

        {/* Monthly / Annual toggle */}
        <div className="inline-flex items-center gap-3 bg-[#111] border border-white/10 rounded-full p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              !annual ? 'bg-[#e8ff47] text-[#0a0a0a]' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${
              annual ? 'bg-[#e8ff47] text-[#0a0a0a]' : 'text-white/40 hover:text-white/70'
            }`}
          >
            Annual
            <span className="text-[10px] bg-[#0a0a0a] text-[#e8ff47] px-1.5 py-0.5 rounded-full font-bold">
              2 months free
            </span>
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="px-6 pb-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`
                rounded-2xl flex flex-col
                ${plan.highlight
                  ? 'bg-[#111] border-2 border-[#e8ff47]'
                  : 'bg-[#111] border border-white/7'
                }
              `}
            >
              {plan.badge && (
                <div className="bg-[#e8ff47] text-black text-xs font-bold text-center py-2 rounded-t-2xl">
                  {plan.badge}
                </div>
              )}

              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-white/40 text-xs mb-4 leading-relaxed">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-3xl font-black text-white">${plan.price}</span>
                  <span className="text-white/40 text-sm ml-1">/mo</span>
                  {annual && (
                    <div className="text-[10px] text-emerald-400 mt-0.5">
                      ${plan.price * 12}/yr billed annually
                    </div>
                  )}
                </div>

                <Link
                  href={`/start?plan=${plan.name.toLowerCase()}`}
                  className={`
                    w-full py-2.5 rounded-xl font-semibold text-sm text-center transition-all mb-4 block
                    ${plan.highlight
                      ? 'bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a]'
                      : 'bg-white/8 hover:bg-white/12 text-white border border-white/10'
                    }
                  `}
                >
                  Start {plan.name} →
                </Link>

                <ul className="space-y-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <svg className="w-3.5 h-3.5 text-[#e8ff47] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/55">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div className="border-y border-white/5 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-white/30 mb-8">
            Everything compared
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 pr-4 text-xs font-semibold text-white/40 w-48">Feature</th>
                  {plans.map(p => (
                    <th key={p.name} className="py-3 px-4 text-center text-xs font-bold text-white">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row.feature} className={i < COMPARISON_ROWS.length - 1 ? 'border-b border-white/5' : ''}>
                    <td className="py-3 pr-4 text-xs text-white/55">{row.feature}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="py-3 px-4 text-center text-xs font-medium" style={{
                        color: v === '✓' ? '#e8ff47' : v === '✗' ? 'rgba(255,255,255,0.2)' : '#fff'
                      }}>
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-24 px-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-white mb-10 text-center"
          style={{ fontFamily: 'var(--font-cabinet, sans-serif)' }}>
          Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQS.map(faq => (
            <details key={faq.q} className="group bg-[#111] border border-white/7 rounded-xl">
              <summary className="flex items-center justify-between cursor-pointer p-5 text-white font-medium select-none list-none">
                {faq.q}
                <svg className="w-4 h-4 text-white/40 shrink-0 transition-transform group-open:rotate-180"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="px-5 pb-5 text-white/50 text-sm leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="py-24 px-6 border-t border-white/5 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-black text-white mb-3"
            style={{ fontFamily: 'var(--font-cabinet, sans-serif)' }}>
            Not sure which plan fits?
          </h2>
          <p className="text-white/50 mb-6 text-sm">
            Start with Personal. Upgrade anytime as your team grows.
          </p>
          <Link
            href="/start?plan=personal"
            className="inline-block px-8 py-4 bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a] font-bold rounded-xl transition-colors"
          >
            Start for $49 →
          </Link>
        </div>
      </div>
    </div>
  )
}
