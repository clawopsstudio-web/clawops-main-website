'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const STEPS = [
  {
    number: '01',
    title: 'Pick Your Team',
    headline: 'Browse agents by department or use case.',
    body: 'Sales. Marketing. Research. Operations. Support. Each agent has a name, a track record, and a set of skills. Browse the marketplace, read their profile, hire the ones that fit.',
    visual: (
      <div className="grid grid-cols-3 gap-3">
        {['Ryan', 'Tyler', 'Arjun', 'Helena', 'Marcus', 'Maya'].map(name => (
          <div key={name} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-[#e8ff47]/20 mx-auto mb-2 flex items-center justify-center text-sm font-bold text-[#e8ff47]">{name[0]}</div>
            <p className="text-white text-sm font-medium">{name}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: '02',
    title: 'Connect Your Tools',
    headline: 'OAuth in 30 seconds.',
    body: 'Gmail. Notion. HubSpot. Slack. Discord. WhatsApp. 850+ integrations via Composio. Agents connect to your existing stack. No re-architecture required.',
    visual: (
      <div className="grid grid-cols-4 gap-3">
        {['Gmail', 'Notion', 'HubSpot', 'Slack', 'Discord', 'WhatsApp', 'Stripe', 'Shopify'].map(tool => (
          <div key={tool} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <div className="w-8 h-8 rounded-lg bg-white/10 mx-auto mb-1" />
            <p className="text-white/60 text-xs">{tool}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: '03',
    title: 'They Start Working',
    headline: 'Agents work on cron. On heartbeat. On triggers.',
    body: 'You set the mission once. Agents execute daily. Weekly. On event. You review reports. You decide. They work. Always.',
    visual: (
      <div className="space-y-2">
        {[
          { agent: 'Ryan', action: 'Cold email sent to 47 leads', time: '2m ago' },
          { agent: 'Tyler', action: 'Content posted to LinkedIn', time: '8m ago' },
          { agent: 'Arjun', action: 'Competitor report generated', time: '15m ago' },
        ].map(item => (
          <div key={item.agent} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-lg px-4 py-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white text-sm font-medium w-20">{item.agent}</span>
            <span className="text-white/60 text-sm flex-1">{item.action}</span>
            <span className="text-white/30 text-xs">{item.time}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl font-bold text-white mb-4">
            Works in 5 minutes. Stays working 24/7.
          </h2>
          <p className="text-white/50 text-lg">
            No onboarding calls. No lengthy setup. Connect your tools. Set missions. Agents execute.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-24">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {i < STEPS.length - 1 && (
                <div className="absolute left-8 top-full w-px h-24 bg-gradient-to-b from-[#e8ff47]/50 to-transparent" />
              )}

              <div className="flex gap-12">
                {/* Step number */}
                <div className="shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-[#e8ff47]/10 border border-[#e8ff47]/30 flex items-center justify-center">
                    <span className="text-2xl font-bold text-[#e8ff47]">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-12">
                  <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-[#e8ff47] font-medium mb-3">{step.headline}</p>
                  <p className="text-white/60 mb-6">{step.body}</p>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                    {step.visual}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <button className="px-8 py-4 bg-[#e8ff47] text-[#0a0a0a] font-semibold rounded-xl hover:bg-[#e8ff47]/90 transition-colors">
            Deploy your team →
          </button>
        </motion.div>
      </div>
    </section>
  );
}
