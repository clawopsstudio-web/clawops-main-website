'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

// ── Robot Avatar ─────────────────────────────────────────────────────────────

function RobotAvatar({ initials, color, size = 64 }: { initials: string; color: string; size?: number }) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden flex items-center justify-center shrink-0"
      style={{
        width: size,
        height: size,
        background: '#0a0a0a',
        border: `1px solid ${color}35`,
      }}
    >
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-5 grid" style={{
        backgroundImage: `linear-gradient(${color}15 1px, transparent 1px), linear-gradient(90deg, ${color}15 1px, transparent 1px)`,
        backgroundSize: `${size/4}px ${size/4}px`,
      }} />

      {/* Face */}
      <div className="relative flex flex-col items-center gap-1.5">
        <div className="flex gap-3">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 10px ${color}70` }} />
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 10px ${color}70`, animationDelay: '0.3s' }} />
        </div>
        <div className="w-8 h-0.5 rounded-full" style={{ background: `${color}50` }} />
      </div>

      {/* Antenna */}
      <div
        className="absolute top-1.5 left-1/2 -translate-x-1/2 w-px h-4 rounded-full"
        style={{ background: `linear-gradient(to top, transparent, ${color})` }}
      />
    </div>
  )
}

// ── Agent Data ───────────────────────────────────────────────────────────────

const agents = [
  {
    id: 'sales',
    name: 'Ryan',
    initials: 'RY',
    role: 'SALES',
    color: '#e8ff47',
    tagline: 'Closes deals while you sleep.',
    description: 'Ryan prospects, qualifies leads, and follows up across email and LinkedIn. He knows your product inside-out and never drops the ball on a warm lead.',
    skills: ['Lead qualification', 'Cold outreach sequencing', 'Follow-up automation', 'Demo scheduling', 'CRM data entry'],
    tools: ['Gmail', 'LinkedIn', 'HubSpot', 'GoHighLevel', 'Calendar'],
  },
  {
    id: 'research',
    name: 'Arjun',
    initials: 'AR',
    role: 'RESEARCH',
    color: '#00d4ff',
    tagline: 'Deep dives, fast.',
    description: 'Arjun scours the web for market intel, competitor analysis, pricing data, and strategic insights. Delivers briefings before your morning coffee.',
    skills: ['Market research', 'Competitor intel', 'Pricing analysis', 'Lead enrichment', 'Trend monitoring'],
    tools: ['Firecrawl', 'Perplexity', 'Notion', 'Google Sheets', 'Slack'],
  },
  {
    id: 'marketing',
    name: 'Tyler',
    initials: 'TY',
    role: 'MARKETING',
    color: '#ff6b6b',
    tagline: 'Creates content that converts.',
    description: 'Tyler crafts SEO blogs, email sequences, social posts, and case studies. He learns your brand voice and maintains it across every touchpoint.',
    skills: ['SEO content', 'Email drip campaigns', 'Social scheduling', 'Case studies', 'Landing page copy'],
    tools: ['Notion', 'Buffer', 'Mailchimp', 'WordPress', 'Canva'],
  },
  {
    id: 'support',
    name: 'Ava',
    initials: 'AV',
    role: 'SUPPORT',
    color: '#a78bfa',
    tagline: 'Your customers never wait.',
    description: 'Ava handles incoming support across email and chat, resolves Tier 1 tickets, and escalates intelligently. Instant, helpful responses — always.',
    skills: ['Ticket triage', 'FAQ responses', 'Refund handling', 'Satisfaction surveys', 'Knowledge base'],
    tools: ['Intercom', 'Zendesk', 'Gmail', 'Slack', 'Shopify'],
  },
  {
    id: 'ops',
    name: 'Sage',
    initials: 'SG',
    role: 'OPS',
    color: '#34d399',
    tagline: 'Keeps everything running.',
    description: 'Sage manages your backend workflows — vendor invoices, project tracking, team coordination, and reporting. The backbone of your operations.',
    skills: ['Invoice processing', 'Project management', 'Vendor coordination', 'Team scheduling', 'Reporting'],
    tools: ['Notion', 'Airtable', 'Slack', 'Asana', 'QuickBooks'],
  },
  {
    id: 'finance',
    name: 'Max',
    initials: 'MX',
    role: 'FINANCE',
    color: '#fb923c',
    tagline: 'Numbers that tell the truth.',
    description: 'Max tracks your MRR, churn, LTV, and CAC. He builds financial reports, monitors runway, and flags anomalies before they become problems.',
    skills: ['MRR & churn tracking', 'Revenue analytics', 'Invoice reconciliation', 'Budget alerts', 'Investor reports'],
    tools: ['Stripe', 'QuickBooks', 'Google Sheets', 'Airtable', 'Xero'],
  },
]

// ── Agent Card ───────────────────────────────────────────────────────────────

function AgentCard({ agent, index }: { agent: typeof agents[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true, margin: '-40px' }}
      className="bg-[#111] border border-white/7 rounded-2xl p-6 hover:border-white/15 transition-all duration-300"
      style={{ boxShadow: `0 0 0 0 ${agent.color}00` }}
    >
      {/* Color bar top */}
      <div className="h-0.5 w-full rounded-t-2xl mb-6" style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }} />

      {/* Avatar + header */}
      <div className="flex items-start gap-4 mb-5">
        <RobotAvatar initials={agent.initials} color={agent.color} size={56} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-xl font-black text-white tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}>{agent.name}</h3>
            <div
              className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded"
              style={{ background: `${agent.color}20`, color: agent.color }}
            >
              {agent.role}
            </div>
          </div>
          <p className="text-white/30 text-xs italic">"{agent.tagline}"</p>
        </div>
        {/* Live badge */}
        <div className="flex items-center gap-1 shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[8px] font-mono text-white/20 uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-white/50 text-sm leading-relaxed mb-5">{agent.description}</p>

      {/* Skills */}
      <div className="mb-4">
        <p className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-2">Capabilities</p>
        <div className="flex flex-wrap gap-1.5">
          {agent.skills.map(skill => (
            <span key={skill} className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/55 border border-white/6">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="mb-5">
        <p className="text-[9px] font-mono text-white/25 uppercase tracking-widest mb-2">Connected tools</p>
        <div className="flex flex-wrap gap-1.5">
          {agent.tools.map(tool => (
            <span key={tool} className="text-xs px-2 py-1 rounded-full font-medium"
              style={{ background: `${agent.color}15`, color: agent.color }}>
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/start?agent=${agent.name.toLowerCase()}&plan=personal`}
        className="w-full py-2.5 rounded-xl font-bold text-sm text-center block transition-all hover:brightness-110 active:scale-[0.98]"
        style={{ background: agent.color, color: '#0a0a0a' }}
      >
        Deploy {agent.name} →
      </Link>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TeamPageClient() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        {/* Background grid */}
        <div className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(232,255,71,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(232,255,71,0.04) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] text-[rgba(232,255,71,0.5)] border border-[rgba(232,255,71,0.2)] rounded-full px-4 py-1.5">
              The Agentic OS — 6 Agents
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.5rem,6vw,4.5rem)] font-black leading-[0.95] tracking-[-0.03em] text-white mb-6"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Your AI workforce.
            <br />
            <span style={{ color: '#e8ff47' }}>Ready to deploy.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/45 text-lg max-w-xl mx-auto leading-relaxed"
          >
            Six specialized agents. Each one is wired into your stack and trained on your business. Pick what you need — they work 24/7, zero salary.
          </motion.p>

          {/* Agent count badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 mt-8"
          >
            {agents.map(a => (
              <div key={a.id} className="flex items-center gap-1.5 bg-[#111] border border-white/7 rounded-full pl-2 pr-3 py-1">
                <RobotAvatar initials={a.initials} color={a.color} size={20} />
                <span className="text-xs font-medium" style={{ color: a.color }}>{a.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Agent Grid */}
      <section className="px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-32">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-[#111] border border-white/7 rounded-2xl p-10">
            <h2 className="text-3xl font-black text-white mb-3"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              Build your team.
            </h2>
            <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
              Every plan starts with agents included. Scale up as your business grows. No per-agent fees.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/start"
                className="bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a] font-bold px-8 py-4 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(232,255,71,0.25)]"
              >
                Deploy Your Agents →
              </Link>
              <Link
                href="/pricing"
                className="text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                View pricing →
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
