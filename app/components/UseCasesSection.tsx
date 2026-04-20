'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const USE_CASES = [
  {
    tab: 'Local Business',
    headline: 'Restaurants, salons, gyms, clinics.',
    subhead: 'One person running operations. One AI team running everything else.',
    agents: ['Tyler', 'Helena', 'Scheduler'],
    liveFeed: [
      { agent: 'Tyler', action: 'posted week\'s specials', time: '2m ago' },
      { agent: 'Helena', action: 'answered 47 booking questions', time: '8m ago' },
      { agent: 'Scheduler', action: 'sent 23 appointment reminders', time: '15m ago' },
    ],
    pain: ['No time for social media', 'Reviews going unanswered', 'Booking system outdated'],
  },
  {
    tab: 'Digital Agency',
    headline: 'SEO, content, social agencies.',
    subhead: 'Ship more deliverables without hiring. Your AI team handles the work.',
    agents: ['Ryan', 'Tyler', 'Arjun', 'Marcus'],
    liveFeed: [
      { agent: 'Ryan', action: 'booked 3 discovery calls today', time: '2m ago' },
      { agent: 'Tyler', action: 'completed SEO audit for client.com', time: '8m ago' },
      { agent: 'Arjun', action: 'found 4 competitors in 30min', time: '15m ago' },
      { agent: 'Marcus', action: 'deployed 12 updates', time: '31m ago' },
    ],
    pain: ['Too many deliverables', 'Can\'t scale without hiring', 'Client comms overwhelming'],
  },
  {
    tab: 'SaaS Startup',
    headline: 'Pre-PMF or scaling fast.',
    subhead: 'Full GTM team without the salary. You focus on building.',
    agents: ['Ryan', 'Tyler', 'Helena', 'Scheduler'],
    liveFeed: [
      { agent: 'Ryan', action: 'qualified 47 new leads today', time: '2m ago' },
      { agent: 'Tyler', action: 'sent onboarding to 89 users', time: '8m ago' },
      { agent: 'Helena', action: 'answered 123 questions', time: '15m ago' },
      { agent: 'Scheduler', action: 'activated 34 users today', time: '31m ago' },
    ],
    pain: ['No GTM budget', 'Users not activating', 'Support piling up'],
  },
  {
    tab: 'E-commerce',
    headline: 'Shopify, Amazon, WooCommerce.',
    subhead: 'One team running your store ops. Content, pricing, support — automated.',
    agents: ['Tyler', 'Arjun', 'Helena', 'Scheduler'],
    liveFeed: [
      { agent: 'Tyler', action: 'wrote 15 product descriptions', time: '2m ago' },
      { agent: 'Arjun', action: 'scraped 89 competitor prices', time: '8m ago' },
      { agent: 'Helena', action: 'answered 67 pre-sale questions', time: '15m ago' },
      { agent: 'Scheduler', action: 'synced 234 orders', time: '31m ago' },
    ],
    pain: ['Content needs fuel constantly', 'Competitor pricing changing daily', 'Support eating all day'],
  },
  {
    tab: 'Solopreneur',
    headline: 'Coaches, consultants, creators.',
    subhead: 'Wearing every hat. Now you don\'t have to.',
    agents: ['Ryan', 'Tyler', 'Scheduler'],
    liveFeed: [
      { agent: 'Ryan', action: 'booked 3 discovery calls today', time: '2m ago' },
      { agent: 'Tyler', action: 'wrote this week\'s newsletter', time: '8m ago' },
      { agent: 'Scheduler', action: 'sent 12 invoice reminders', time: '15m ago' },
    ],
    pain: ['One person. Five roles.', 'No time for prospecting', 'Decisions being deferred'],
  },
];

export default function UseCasesSection() {
  const [activeTab, setActiveTab] = useState(0);
  const useCase = USE_CASES[activeTab];

  return (
    <section className="py-24 bg-[#04040c]">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold text-white mb-4">Your industry. Your agents.</h2>
          <p className="text-white/50 text-lg">Agents configured for your business type. Not generic. Specific.</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap justify-center mb-12">
          {USE_CASES.map((uc, i) => (
            <button
              key={uc.tab}
              onClick={() => setActiveTab(i)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeTab === i
                  ? 'bg-[#00D4FF] text-[#04040c]'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {uc.tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid lg:grid-cols-2 gap-8 items-start"
          >
            {/* Left — Content */}
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">{useCase.headline}</h3>
              <p className="text-[#00D4FF] mb-6">{useCase.subhead}</p>

              {/* Agents */}
              <div className="flex flex-wrap gap-2 mb-8">
                {useCase.agents.map(name => (
                  <span key={name} className="px-3 py-1.5 rounded-full bg-white/5 text-white/70 text-sm border border-white/10">
                    {name}
                  </span>
                ))}
              </div>

              {/* Pain Points */}
              <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Common Pain Points</h4>
              <ul className="space-y-2 mb-8">
                {useCase.pain.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 text-white/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
                    {p}
                  </li>
                ))}
              </ul>

              <button className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/15 transition-colors">
                See how it works →
              </button>
            </div>

            {/* Right — Live Feed */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Live Activity</h4>
              {useCase.liveFeed.map((item, i) => (
                <motion.div
                  key={`${item.agent}-${i}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-white font-medium text-sm w-24">{item.agent}</span>
                  <span className="text-white/60 text-sm flex-1">{item.action}</span>
                  <span className="text-white/30 text-xs">{item.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
