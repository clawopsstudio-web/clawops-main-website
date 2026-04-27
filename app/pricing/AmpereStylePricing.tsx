'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const MONTHLY_PLANS = [
  {
    name: 'Personal',
    price: 49,
    tagline: 'Your first AI hires.',
    agents: 2,
    toolCalls: '20,000',
    highlight: false,
    badge: null,
    features: [
      '2 AI agents',
      '20,000 tool calls / month',
      'All messaging platforms',
      'CRM & email integrations',
      'Slack, Telegram, WhatsApp',
      'Knowledge base training',
      'Email support (48hr SLA)',
      'Onboarding call',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Team',
    price: 149,
    tagline: 'Your full AI department.',
    agents: 5,
    toolCalls: '200,000',
    highlight: true,
    badge: 'MOST POPULAR',
    features: [
      '5 AI agents',
      '200,000 tool calls / month',
      'Priority platform access',
      'Advanced analytics dashboard',
      'All integrations included',
      'Custom agent workflows',
      'Priority support (12hr SLA)',
      'Dedicated onboarding session',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Business',
    price: 299,
    tagline: 'Scale without limits.',
    agents: 10,
    toolCalls: '1M',
    highlight: false,
    badge: null,
    features: [
      '10 AI agents',
      '1M tool calls / month',
      'White-label options',
      'API access',
      'Custom integrations',
      'Advanced reporting',
      'Priority support (4hr SLA)',
      'Quarterly strategy reviews',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Enterprise',
    price: 349,
    tagline: 'Built for serious teams.',
    agents: 20,
    toolCalls: '1M',
    highlight: false,
    badge: 'ENTERPRISE',
    features: [
      '20 AI agents',
      '1M tool calls / month',
      'Everything in Business',
      'Dedicated account manager',
      'Custom SLA terms',
      'On-premise deployment option',
      'SOC2 compliance docs',
      'Unlimited team seats',
    ],
    cta: 'Contact Us',
  },
]

export default function AmpereStylePricing() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-white/50 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8ff47] animate-pulse" />
            Simple, flat-rate pricing
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            Pick your plan.
          </h1>
          <p className="text-white/50 text-lg max-w-lg mx-auto mb-8">
            No per-user fees. No token billing. Flat monthly rates with everything included.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl border border-white/10 bg-white/5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                !annual ? 'bg-[#e8ff47] text-[#0a0a0a]' : 'text-white/50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                annual ? 'bg-[#e8ff47] text-[#0a0a0a]' : 'text-white/50'
              }`}
            >
              Annual
              <span className="text-[10px] bg-[#0a0a0a] text-[#0a0a0a] px-1.5 py-0.5 rounded font-bold">-20%</span>
            </button>
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {MONTHLY_PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`relative rounded-2xl p-6 flex flex-col border ${
                plan.highlight
                  ? 'border-[#e8ff47]/50 bg-[rgba(232,255,71,0.06)]'
                  : 'border-white/10 bg-[#0d0d0d]'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span
                    className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full ${
                      plan.highlight
                        ? 'bg-[#e8ff47] text-[#0a0a0a]'
                        : 'bg-white/10 text-white/60'
                    }`}
                  >
                    {plan.badge}
                  </span>
                </div>
              )}

              {/* Plan name & tagline */}
              <div className="mb-6">
                <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-[#e8ff47]' : 'text-white'}`}>
                  {plan.name}
                </h3>
                <p className="text-white/40 text-xs">{plan.tagline}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">
                    ${annual ? Math.round(plan.price * 0.8) : plan.price}
                  </span>
                  <span className="text-white/40 text-sm mb-1">/mo</span>
                </div>
                {annual && (
                  <p className="text-[10px] text-white/30 mt-1">
                    Billed ${Math.round(plan.price * 0.8 * 12)}/year
                  </p>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-6 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="text-center">
                  <p className={`text-lg font-bold ${plan.highlight ? 'text-[#e8ff47]' : 'text-white'}`}>
                    {plan.agents}
                  </p>
                  <p className="text-[10px] text-white/30">agents</p>
                </div>
                <div className="text-center">
                  <p className={`text-lg font-bold ${plan.highlight ? 'text-[#e8ff47]' : 'text-white'}`}>
                    {plan.toolCalls}
                  </p>
                  <p className="text-[10px] text-white/30">tool calls/mo</p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-white/60">
                    <span className="text-[#e8ff47] mt-0.5 shrink-0">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.name === 'Enterprise' ? '/contact' : '/start'}
                className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all block ${
                  plan.highlight
                    ? 'bg-[#e8ff47] text-[#0a0a0a] hover:bg-[#d4eb3a]'
                    : 'border border-white/20 text-white hover:border-white/40 hover:bg-white/5'
                }`}
              >
                {plan.cta} →
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Everything, side by side.</h2>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-mono text-white/30 uppercase tracking-widest p-4 bg-[#0d0d0d]">
                    Feature
                  </th>
                  {MONTHLY_PLANS.map((plan) => (
                    <th
                      key={plan.name}
                      className={`text-center text-sm font-bold p-4 bg-[#0d0d0d] ${
                        plan.highlight ? 'text-[#e8ff47]' : 'text-white'
                      }`}
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['AI Agents', '2', '5', '10', '20'],
                  ['Tool Calls / Month', '20,000', '200,000', '1M', '1M'],
                  ['Messaging Platforms', '✓', '✓', '✓', '✓'],
                  ['CRM Integrations', '✓', '✓', '✓', '✓'],
                  ['Knowledge Base', '✓', '✓', '✓', '✓'],
                  ['API Access', '—', '—', '✓', '✓'],
                  ['White-label', '—', '—', '✓', '✓'],
                  ['Custom Integrations', '—', '—', '✓', '✓'],
                  ['Priority Support', '48hr', '12hr', '4hr', 'Dedicated'],
                  ['Quarterly Reviews', '—', '—', '—', '✓'],
                ].map(([feature, ...values], i) => (
                  <tr
                    key={feature}
                    className={`border-b border-white/5 ${
                      i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'
                    }`}
                  >
                    <td className="p-4 text-sm text-white/60">{feature}</td>
                    {values.map((val, j) => (
                      <td
                        key={j}
                        className={`p-4 text-center text-sm font-medium ${
                          val === '✓' ? 'text-[#34d399]' : val === '—' ? 'text-white/20' : 'text-white'
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <p className="text-white/40 mb-4">Not sure which plan is right for you?</p>
          <Link
            href="/contact"
            className="text-[#e8ff47] hover:underline text-sm font-medium"
          >
            Talk to us — we'll help you figure it out →
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
