'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const AGENTS = [
  {
    name: 'ATLAS',
    role: 'SALES',
    color: '#e8ff47',
    tagline: 'Finds and qualifies leads daily.',
    bullets: ['Sends personalised outreach sequences', 'Updates your CRM automatically', 'Books meetings without you'],
    stat: '127 leads contacted this week',
    delay: 0,
  },
  {
    name: 'NOVA',
    role: 'MARKETING',
    color: '#a78bfa',
    tagline: 'Posts daily. You don\'t have to.',
    bullets: ['Monitors brand mentions across platforms', 'Generates weekly performance reports', 'Schedules content across all channels'],
    stat: '14 posts published this week',
    delay: 0.1,
  },
  {
    name: 'REX',
    role: 'RESEARCH',
    color: '#34d399',
    tagline: 'Finds what your competitors hide.',
    bullets: ['Tracks competitors and market signals', 'Summarises news relevant to your business', 'Daily briefings to Slack or Telegram'],
    stat: '89 sources monitored',
    delay: 0.2,
  },
]

function AgentMiniCard({ agent }: { agent: typeof AGENTS[0] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: agent.delay, ease: [0.16, 1, 0.3, 1] }}
      className="bg-[#111] rounded-2xl border border-white/7 overflow-hidden flex flex-col"
    >
      {/* Top color bar */}
      <div className="h-1" style={{ background: agent.color }} />

      <div className="p-5 flex flex-col flex-1">
        {/* Role badge */}
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded"
            style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
          >
            {agent.role}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] text-white/25 font-mono uppercase tracking-wider">Live</span>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-3xl font-black text-white mb-1 tracking-tight"
          style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
          {agent.name}
        </h3>

        {/* Tagline */}
        <p className="text-white/35 text-xs italic mb-4 leading-relaxed">"{agent.tagline}"</p>

        {/* Capabilities */}
        <ul className="space-y-1.5 mb-4 flex-1">
          {agent.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: agent.color }} />
              <span className="text-white/50 text-xs">{b}</span>
            </li>
          ))}
        </ul>

        {/* Stat */}
        <div
          className="rounded-lg p-2.5 mb-4 text-center text-xs font-bold"
          style={{ backgroundColor: `${agent.color}10`, border: `1px solid ${agent.color}25`, color: agent.color }}
        >
          {agent.stat}
        </div>

        <Link
          href={`/start?agent=${agent.name.toLowerCase()}&plan=personal`}
          className="w-full py-2.5 rounded-xl font-bold text-sm text-center transition-all block hover:brightness-110 active:scale-[0.98]"
          style={{ backgroundColor: agent.color, color: '#0a0a0a' }}
        >
          DEPLOY →
        </Link>
      </div>
    </motion.div>
  )
}

export default function AgentShowcase() {
  return (
    <section className="bg-[#0a0a0a] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[rgba(232,255,71,0.5)] mb-4">
            THE AGENT ROSTER
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Six agents. Every department covered.
          </h2>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Each agent is specialized, autonomous, and wired into 850+ tools. Deploy one or all — they work 24/7 with zero salary.
          </p>
        </motion.div>

        {/* Agent cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {AGENTS.map(agent => (
            <AgentMiniCard key={agent.name} agent={agent} />
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Link
            href="/team"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors font-medium"
          >
            Meet all 6 agents →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
