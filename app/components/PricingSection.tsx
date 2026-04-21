'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Personal',
    price: 29,
    tag: 'Starter',
    tagline: 'For solopreneurs getting started.',
    features: [
      '1-2 AI Agents',
      '4 vCPU · 8GB RAM',
      '3 Tool Connections',
      'Basic Mission Scheduler',
      'Email Support',
      'Community Access',
      'Telegram, Discord, WhatsApp',
    ],
    cta: 'Start free trial',
    popular: false,
  },
  {
    name: 'Power User',
    price: 79,
    tag: 'Most Popular',
    tagline: 'For growing businesses that need more.',
    features: [
      '3-4 AI Agents',
      '6 vCPU · 12GB RAM',
      '8 Tool Connections',
      'Voice Layer (Pipecat + Kokoro)',
      'Priority Support',
      'All Channels',
      'API Access',
    ],
    cta: 'Start free trial',
    popular: true,
  },
  {
    name: 'Team',
    price: 149,
    tag: 'Best Value',
    tagline: 'For agencies and teams that ship fast.',
    features: [
      '6 AI Agents (Ryan, Tyler, Arjun + more)',
      '12 vCPU · 48GB RAM',
      '15 Tool Connections',
      'Hermes Gateway',
      'Priority Support',
      'All Channels',
      'Custom Missions',
    ],
    cta: 'Start free trial',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 299,
    tag: 'Custom',
    tagline: 'For businesses that need everything.',
    features: [
      '20 AI Agents',
      '16 vCPU · 64GB RAM',
      'Unlimited Connections',
      'White-label available',
      'Dedicated Account Manager',
      'SLA Guarantee',
      'Custom Integrations',
    ],
    cta: 'Talk to us',
    popular: false,
  },
];

const ADDONS = [
  {
    name: '5x Add-on',
    price: 50,
    tagline: 'For power users.',
    features: [
      '5M tokens/month',
      '1,000 API calls every 5 hours',
      'All Claude models (Haiku · Sonnet 4.6 · Opus 4.6 · Opus 4.7)',
      'Priority queue',
      'Usage dashboard',
    ],
  },
  {
    name: '20x Add-on',
    price: 99,
    tagline: 'For teams that run everything on AI.',
    features: [
      '20M tokens/month',
      '2,000 API calls every 5 hours',
      'All Claude models',
      'Unlimited agents',
      'Usage dashboard',
    ],
  },
];

const FAQS = [
  {
    q: 'What counts as one agent?',
    a: 'Ryan is one agent. Tyler is one agent. You can run 1-20 agents depending on your plan. Each has a name, a role, and a set of skills.',
  },
  {
    q: 'What does "Connect your tools" mean?',
    a: 'Your agents connect to Gmail, Notion, HubSpot, Slack, and 850+ apps via Composio. OAuth takes 30 seconds.',
  },
  {
    q: 'What channels can agents work on?',
    a: 'Telegram, Discord, WhatsApp, Slack, Email, and web dashboard. All included.',
  },
  {
    q: 'Do agents work while I sleep?',
    a: 'Yes. Agents run on cron, heartbeat, and triggers. You set missions. They execute. You sleep.',
  },
  {
    q: 'Can I start free?',
    a: 'Yes. All plans include a 7-day free trial. No credit card required.',
  },
];

export default function PricingSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [annual, setAnnual] = useState(false);

  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">Plans that scale with you.</h2>
          <p className="text-white/50 text-lg mb-8">No contracts. No setup fees. Cancel anytime.</p>
          
          {/* Annual toggle */}
          <div className="inline-flex items-center gap-3 bg-white/5 rounded-full p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${!annual ? 'bg-white/10 text-white' : 'text-white/50'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-full text-sm transition-all ${annual ? 'bg-white/10 text-white' : 'text-white/50'}`}
            >
              Annual <span className="text-emerald-400 ml-1">-20%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {PLANS.map((plan) => (
            <motion.div
              key={plan.name}
              whileHover={{ y: -4 }}
              className={`relative p-6 rounded-2xl border ${
                plan.popular 
                  ? 'bg-gradient-to-b from-[#e8ff47]/10 to-transparent border-[#e8ff47]/30' 
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#e8ff47] text-[#0a0a0a] text-xs font-semibold rounded-full">
                  {plan.tag}
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-white/40 text-sm">{plan.tagline}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  ${annual ? Math.round(plan.price * 0.8) : plan.price}
                </span>
                <span className="text-white/40">/mo</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                    <Check className="w-4 h-4 text-[#e8ff47] shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 rounded-xl font-semibold transition-colors ${
                plan.popular
                  ? 'bg-[#e8ff47] text-[#0a0a0a] hover:bg-[#e8ff47]/90'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}>
                {plan.cta} →
              </button>
            </motion.div>
          ))}
        </div>

        {/* Add-ons */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Add-ons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {ADDONS.map(addon => (
              <div key={addon.name} className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-white">{addon.name}</h4>
                    <p className="text-white/40 text-sm">{addon.tagline}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-white">${addon.price}</span>
                    <span className="text-white/40">/mo</span>
                  </div>
                </div>
                <ul className="space-y-2">
                  {addon.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                      <Check className="w-4 h-4 text-[#e8ff47] shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Frequently asked</h3>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="text-white font-medium">{faq.q}</span>
                  <span className="text-white/40">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-white/60 text-sm">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trust */}
        <div className="text-center mt-12 text-white/30 text-sm flex flex-wrap justify-center gap-6">
          <span>No credit card required</span>
          <span>·</span>
          <span>Cancel anytime</span>
          <span>·</span>
          <span>Setup in 5 minutes</span>
          <span>·</span>
          <span>Agents work 24/7</span>
        </div>
      </div>
    </section>
  );
}
