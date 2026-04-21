'use client'

import Link from 'next/link'

const PLANS = [
  {
    name: 'Personal',
    price: 49,
    description: 'Your first AI agent. Everything included.',
    highlight: false,
    badge: null,
    features: [
      '1 AI Agent',
      'Gmail, Notion, Slack',
      '500+ app integrations',
      'Headless browser automation',
      '5 automations / month',
      'Community support',
      '30-day history',
    ],
    cta: 'Start Personal →',
  },
  {
    name: 'Team',
    price: 149,
    description: 'Full AI team. For growing businesses.',
    highlight: false,
    badge: null,
    features: [
      '5 AI Agents',
      'All integrations included',
      'Headless browser + CLIAnything',
      'Unlimited automations',
      'Priority support (4h response)',
      '60-day history',
    ],
    cta: 'Start Team →',
  },
  {
    name: 'Business',
    price: 299,
    description: 'Claude API key included. For agencies and serious ops.',
    highlight: true,
    badge: 'MOST POPULAR',
    features: [
      '20 AI Agents',
      'Claude API key included',
      'All integrations',
      'White-label ready',
      'Dedicated support (1h response)',
      'Custom domains',
      '90-day history',
    ],
    cta: 'Start Business →',
  },
  {
    name: 'Enterprise',
    price: 349,
    description: 'Same as Business, 20× agent capacity.',
    highlight: false,
    badge: null,
    features: [
      'Unlimited AI Agents',
      'Everything in Business',
      'Unlimited automations',
      'Custom SLA',
      'Dedicated account manager',
      'On-premise option',
    ],
    cta: 'Start Enterprise →',
  },
]

const FAQS = [
  {
    q: 'Is there a free trial?',
    a: 'Not yet — but you can cancel within 7 days for a full refund. No questions asked.',
  },
  {
    q: 'What does "Claude API key included" mean?',
    a: 'Your $299/month Business plan includes a pre-loaded Claude API key. No setup, no separate billing. It just works.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. Upgrade or downgrade anytime from your dashboard. Changes take effect at the next billing cycle.',
  },
  {
    q: 'What integrations are included?',
    a: 'All 500+ Composio integrations are included in every plan — Gmail, HubSpot, Notion, Slack, Airtable, Linear, and more.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Yes. 7-day full refund, no questions asked. Just email hello@clawops.studio.',
  },
]

export default function AmpereStylePricing() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="pt-32 pb-20 px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(232,255,71,0.6)] mb-4">
          PRICING
        </p>
        <h1
          className="text-5xl md:text-6xl font-black text-white mb-5 leading-none"
          style={{ fontFamily: 'var(--font-cabinet)', letterSpacing: '-0.02em' }}
        >
          One price. All agents.
        </h1>
        <p className="text-white/50 text-lg max-w-md mx-auto">
          No per-user fees. No token billing. Pick a plan, connect your tools, deploy your team.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="px-6 pb-24 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`
                rounded-2xl flex flex-col
                ${plan.highlight
                  ? 'bg-[#111] border-2 border-[#e8ff47]'
                  : 'bg-[#111] border border-[rgba(255,255,255,0.07)]'
                }
              `}
            >
              {plan.badge && (
                <div className="bg-[#e8ff47] text-black text-xs font-bold text-center py-2 rounded-t-2xl">
                  {plan.badge}
                </div>
              )}

              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-white/40 text-sm mb-5 leading-relaxed">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-black text-white">${plan.price}</span>
                  <span className="text-white/40 text-sm ml-1">/month</span>
                </div>

                <Link
                  href={`/start?plan=${plan.name.toLowerCase()}`}
                  className={`
                    w-full py-3 rounded-xl font-semibold text-center transition-all mb-6 block
                    ${plan.highlight
                      ? 'bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a]'
                      : 'bg-white/8 hover:bg-white/12 text-white border border-white/10'
                    }
                  `}
                >
                  {plan.cta}
                </Link>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <svg className="w-4 h-4 text-[#e8ff47] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-white/60">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-sm mt-8">
          All plans include a 7-day refund guarantee.{' '}
          <a href="mailto:hello@clawops.studio" className="text-[#e8ff47] hover:underline">
            Questions?
          </a>
        </p>
      </div>

      {/* Social proof bar */}
      <div className="border-y border-white/5 py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-cabinet)' }}>500+</div>
            <div className="text-white/40 text-sm">Integrations included</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-cabinet)' }}>2 hrs</div>
            <div className="text-white/40 text-sm">Avg. deployment time</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white mb-1" style={{ fontFamily: 'var(--font-cabinet)' }}>24/7</div>
            <div className="text-white/40 text-sm">Agent availability</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-24 px-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-white mb-10 text-center"
          style={{ fontFamily: 'var(--font-cabinet)' }}>
          Frequently asked questions
        </h2>

        <div className="space-y-4">
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
            style={{ fontFamily: 'var(--font-cabinet)' }}>
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
