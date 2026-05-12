'use client'

import { useState } from 'react'
import Link from 'next/link'

const SERVICES = [
  {
    name: 'AI Sales Employee',
    price: 'From $999/mo',
    description: 'Automated outreach, lead qualification, and CRM updates',
    highlight: true,
    badge: 'MOST POPULAR',
    features: [
      'Unlimited outreach & follow-ups',
      'Unlimited lead enrichment',
      'Unlimited CRM updates',
      'Weekly performance reports',
      'Dedicated setup & optimization',
      'Ongoing management included',
    ],
  },
  {
    name: 'AI Research Employee',
    price: 'From $799/mo',
    description: 'Continuous market intelligence and competitor monitoring',
    highlight: false,
    badge: null,
    features: [
      'Unlimited competitor tracking',
      'Unlimited market monitoring',
      'Custom research reports',
      'Daily intelligence briefings',
      'Slack/email digest delivery',
      'Ongoing management included',
    ],
  },
  {
    name: 'AI Support Employee',
    price: 'From $899/mo',
    description: '24/7 customer support that handles tickets autonomously',
    highlight: false,
    badge: null,
    features: [
      'Unlimited ticket handling',
      'Multi-channel (email, chat, social)',
      'Escalation to human when needed',
      'Knowledge base integration',
      'SLA monitoring & reporting',
      'Ongoing management included',
    ],
  },
]

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Discovery Call',
    description: 'We learn about your business, goals, and current workflows.',
  },
  {
    step: '02',
    title: 'Custom Build',
    description: 'We configure your AI employee with your industry, tools, and brand voice.',
  },
  {
    step: '03',
    title: '48 Hours to Live',
    description: 'Your first AI employee is deployed and working within 48 hours.',
  },
  {
    step: '04',
    title: 'Ongoing Management',
    description: 'We monitor, optimize, and improve every week — at no extra cost.',
  },
]

const COMPARISON_ROWS = [
  { feature: 'Custom AI Agent Setup', values: ['✓', '✓', '✓'] },
  { feature: 'Ongoing Monitoring & Optimization', values: ['✓', '✓', '✓'] },
  { feature: 'Weekly Performance Reports', values: ['✓', '✓', '✓'] },
  { feature: 'Tool Integrations (850+)', values: ['✓', '✓', '✓'] },
  { feature: 'Slack/Email Digest', values: ['✓', '✓', '✓'] },
  { feature: 'Dedicated Account Manager', values: ['✓', '✓', '✓'] },
  { feature: 'Custom Workflow Development', values: ['—', '✓', '✓'] },
  { feature: 'Multi-Agent Orchestration', values: ['—', '—', '✓'] },
  { feature: 'Priority Support (4hr SLA)', values: ['—', '—', '✓'] },
  { feature: 'White-Label Options', values: ['—', '—', '✓'] },
]

export default function AmpereStylePricing() {
  const [showComparison, setShowComparison] = useState(false)

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
          Your AI employees.
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto mb-8">
          We build, deploy, and manage unlimited AI employees for your business. Flat monthly rate. No usage caps. No surprises.
        </p>

        {/* Toggle */}
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="text-white/40 hover:text-white/70 text-sm transition-colors underline underline-offset-4"
        >
          {showComparison ? 'Hide comparison' : 'Compare all features'}
        </button>
      </div>

      {/* Service Cards */}
      {!showComparison && (
        <div className="px-6 pb-16 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SERVICES.map((service) => (
              <div
                key={service.name}
                className={`
                  rounded-2xl flex flex-col
                  ${service.highlight
                    ? 'bg-[#111] border-2 border-[#e8ff47]'
                    : 'bg-[#111] border border-white/7'
                  }
                `}
              >
                {service.badge && (
                  <div className="bg-[#e8ff47] text-black text-xs font-bold text-center py-2 rounded-t-2xl">
                    {service.badge}
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">{service.name}</h3>
                  <p className="text-white/40 text-sm mb-4 leading-relaxed">{service.description}</p>

                  <div className="mb-6">
                    <span className="text-3xl font-black text-white">{service.price}</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                        <span className="text-[#e8ff47] mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/start"
                    className={`
                      w-full py-3 rounded-xl font-semibold text-sm text-center transition-all block
                      ${service.highlight
                        ? 'bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a]'
                        : 'bg-white/8 hover:bg-white/12 text-white border border-white/10'
                      }
                    `}
                  >
                    Get Started →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Enterprise note */}
          <div className="mt-12 text-center">
            <p className="text-white/40 text-sm mb-4">
              Need a custom solution or multiple agents?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-[#e8ff47] hover:text-[#d4eb3a] font-medium transition-colors"
            >
              Talk to us — we'll build exactly what you need →
            </Link>
          </div>
        </div>
      )}

      {/* Comparison Table */}
      {showComparison && (
        <div className="px-6 pb-16 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-[#111] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-4 border-b border-white/10">
              <div className="p-4 text-sm text-white/40">Feature</div>
              {SERVICES.map((s) => (
                <div key={s.name} className="p-4 text-center">
                  <div className="text-sm font-bold text-white">{s.name}</div>
                  <div className="text-xs text-white/40 mt-1">{s.price}</div>
                </div>
              ))}
            </div>

            {/* Rows */}
            {COMPARISON_ROWS.map((row, i) => (
              <div key={i} className="grid grid-cols-4 border-b border-white/5 last:border-0">
                <div className="p-4 text-sm text-white/60">{row.feature}</div>
                {row.values.map((val, j) => (
                  <div key={j} className="p-4 text-center text-[#e8ff47]">
                    {val}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => setShowComparison(false)}
              className="text-white/40 hover:text-white/70 text-sm transition-colors underline underline-offset-4"
            >
              Back to services
            </button>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="border-t border-white/5 py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(232,255,71,0.6)] mb-4">
              HOW IT WORKS
            </p>
            <h2 className="text-4xl font-black text-white">
              From conversation to working AI team
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step) => (
              <div key={step.step} className="bg-[#111] rounded-xl p-6 border border-white/7">
                <div className="text-4xl font-black text-[#e8ff47]/20 mb-4">{step.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border-t border-white/5 py-20 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          Ready to build your AI team?
        </h2>
        <p className="text-white/50 text-lg mb-8 max-w-md mx-auto">
          Start with a discovery call. No commitment, no pressure — just figuring out if we're a good fit.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/start"
            className="px-8 py-4 bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a] font-bold rounded-xl transition-colors"
          >
            Start Your OS →
          </Link>
          <Link
            href="/contact"
            className="px-8 py-4 bg-white/8 hover:bg-white/12 text-white border border-white/10 rounded-xl transition-colors"
          >
            Talk to Us
          </Link>
        </div>
      </div>

    </div>
  )
}
