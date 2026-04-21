'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// Unique inline SVG robot per agent — geometric, consistent style
function RobotAvatar({ name, color }: { name: string; color: string }) {
  const shapes: Record<string, React.ReactNode> = {
    ATLAS: (
      <>
        {/* Upward arrow = sales growth */}
        <polygon points="100,30 70,80 90,80 90,110 110,110 110,80 130,80" fill={color} opacity="0.9" />
        <circle cx="100" cy="130" r="30" fill={color} opacity="0.15" />
      </>
    ),
    NOVA: (
      <>
        {/* Star = marketing/star content */}
        <polygon
          points="100,25 112,75 165,80 125,115 138,168 100,140 62,168 75,115 35,80 88,75"
          fill={color} opacity="0.85"
        />
      </>
    ),
    REX: (
      <>
        {/* Target circles = research */}
        <circle cx="100" cy="100" r="65" fill="none" stroke={color} strokeWidth="8" opacity="0.2" />
        <circle cx="100" cy="100" r="40" fill="none" stroke={color} strokeWidth="8" opacity="0.4" />
        <circle cx="100" cy="100" r="18" fill={color} opacity="0.85" />
      </>
    ),
    ZARA: (
      <>
        {/* Headset = support */}
        <rect x="55" y="55" width="90" height="70" rx="14" fill="#1a1a1a" stroke={color} strokeWidth="6" />
        <path d="M55 90 Q30 90 30 115" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M145 90 Q170 90 170 115" stroke={color} strokeWidth="7" fill="none" strokeLinecap="round" />
        <rect x="70" y="75" width="60" height="30" rx="8" fill={color} opacity="0.8" />
        <rect x="77" y="82" width="18" height="16" rx="4" fill="#0a0a0a" />
        <rect x="105" y="82" width="18" height="16" rx="4" fill="#0a0a0a" />
        <rect x="88" y="105" width="24" height="8" rx="4" fill={color} opacity="0.4" />
      </>
    ),
    MARCUS: (
      <>
        {/* Gears = ops */}
        <circle cx="100" cy="100" r="25" fill={color} opacity="0.85" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <rect
            key={i}
            x="93" y="30"
            width="14" height="28"
            rx="3"
            fill={color}
            opacity="0.7"
            style={{ transformOrigin: '100px 100px', transform: `rotate(${angle}deg)` }}
          />
        ))}
        <circle cx="100" cy="100" r="12" fill="#0a0a0a" />
      </>
    ),
    MAYA: (
      <>
        {/* Chart bars = finance */}
        <rect x="45" y="100" width="22" height="55" rx="4" fill={color} opacity="0.9" />
        <rect x="79" y="75" width="22" height="80" rx="4" fill={color} opacity="0.7" />
        <rect x="113" y="50" width="22" height="105" rx="4" fill={color} opacity="0.5" />
        <rect x="147" y="30" width="22" height="125" rx="4" fill={color} opacity="0.3" />
        <line x1="35" y1="155" x2="185" y2="155" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  }

  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="200" height="200" fill="#111" />
      <rect x="45" y="45" width="110" height="110" rx="20" fill="#1a1a1a" stroke={color} strokeWidth="4" />
      {shapes[name] || shapes.ATLAS}
    </svg>
  )
}

const AGENTS = [
  {
    name: 'ATLAS',
    role: 'SALES',
    color: '#e8ff47',
    tagline: 'Finds and qualifies leads daily.',
    bullets: [
      'Sends personalised outreach sequences',
      'Updates your CRM automatically',
      'Books meetings without you in the loop',
    ],
    stat: '127 leads contacted this week',
    statColor: '#e8ff47',
  },
  {
    name: 'NOVA',
    role: 'MARKETING',
    color: '#a78bfa',
    tagline: 'Posts daily. You don\'t have to.',
    bullets: [
      'Monitors brand mentions across platforms',
      'Generates weekly performance reports',
      'Schedules content across all channels',
    ],
    stat: '14 posts published this week',
    statColor: '#a78bfa',
  },
  {
    name: 'REX',
    role: 'RESEARCH',
    color: '#34d399',
    tagline: 'Finds what your competitors hide.',
    bullets: [
      'Tracks competitors and market signals',
      'Summarises news relevant to your business',
      'Delivers briefings to Slack or Telegram daily',
    ],
    stat: '89 sources monitored',
    statColor: '#34d399',
  },
  {
    name: 'ZARA',
    role: 'SUPPORT',
    color: '#fb923c',
    tagline: 'Every ticket. Every time.',
    bullets: [
      'Handles customer queries 24/7',
      'Escalates edge cases to your inbox',
      'Drafts responses for your approval',
    ],
    stat: '98% queries resolved < 2 min',
    statColor: '#fb923c',
  },
  {
    name: 'MARCUS',
    role: 'OPS',
    color: '#60a5fa',
    tagline: 'Runs the machine. You own it.',
    bullets: [
      'Manages scheduling and reminders',
      'Generates weekly ops reports',
      'Monitors tool health and alerts you',
    ],
    stat: 'Zero missed tasks this month',
    statColor: '#60a5fa',
  },
  {
    name: 'MAYA',
    role: 'FINANCE',
    color: '#22d3ee',
    tagline: 'Every dollar tracked. Every invoice sent.',
    bullets: [
      'Tracks invoices and payment status',
      'Flags overdue accounts automatically',
      'Generates monthly cash flow summaries',
    ],
    stat: '$0 invoices missed this quarter',
    statColor: '#22d3ee',
  },
]

const DEPARTMENTS = ['All', 'SALES', 'MARKETING', 'RESEARCH', 'SUPPORT', 'OPS', 'FINANCE']

export default function AgentCards() {
  const [activeTab, setActiveTab] = useState('All')
  const [selectedAgent, setSelectedAgent] = useState<typeof AGENTS[0] | null>(null)

  const filtered = activeTab === 'All'
    ? AGENTS
    : AGENTS.filter(a => a.role === activeTab)

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-12 justify-center">
        {DEPARTMENTS.map(dept => (
          <button
            key={dept}
            onClick={() => setActiveTab(dept)}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all ${
              activeTab === dept
                ? 'bg-[#e8ff47] text-[#0a0a0a]'
                : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(agent => (
          <AgentCard
            key={agent.name}
            agent={agent}
            onDeploy={() => setSelectedAgent(agent)}
          />
        ))}
      </div>

      {/* Agent detail modal */}
      <AnimatePresence>
        {selectedAgent && (
          <AgentModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function AgentCard({ agent, onDeploy }: { agent: typeof AGENTS[0]; onDeploy: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111] rounded-2xl border border-white/7 overflow-hidden flex flex-col"
    >
      {/* Robot avatar */}
      <div className="aspect-square w-full">
        <RobotAvatar name={agent.name} color={agent.color} />
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1">
        {/* Status + role */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-bold tracking-widest px-2 py-0.5 rounded"
            style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
          >
            {agent.role}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Available</span>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-2xl font-black text-white mb-1 tracking-tight"
          style={{ fontFamily: 'var(--font-cabinet, sans-serif)' }}>
          {agent.name}
        </h3>

        {/* Tagline */}
        <p className="text-white/40 text-xs italic mb-4 leading-relaxed">"{agent.tagline}"</p>

        {/* Capabilities */}
        <ul className="space-y-2 mb-4 flex-1">
          {agent.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: agent.color }} />
              <span className="text-white/55 text-xs leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>

        {/* Stat */}
        <div
          className="rounded-lg p-2.5 mb-4 text-center"
          style={{ backgroundColor: `${agent.color}10`, border: `1px solid ${agent.color}25` }}
        >
          <span className="text-xs font-bold" style={{ color: agent.statColor }}>{agent.stat}</span>
        </div>

        {/* Deploy button */}
        <Link
          href={`/start?agent=${agent.name.toLowerCase()}&plan=personal`}
          className={`
            w-full py-3 rounded-xl font-bold text-sm text-center transition-all block
            hover:brightness-110 active:scale-[0.98]
          `}
          style={{ backgroundColor: agent.color, color: '#0a0a0a' }}
        >
          DEPLOY →
        </Link>
      </div>
    </motion.div>
  )
}

function AgentModal({ agent, onClose }: { agent: typeof AGENTS[0]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-lg bg-[#111] rounded-2xl border border-white/10 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Avatar header */}
        <div className="aspect-video w-full" style={{ backgroundColor: '#0a0a0a' }}>
          <RobotAvatar name={agent.name} color={agent.color} />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span
                className="text-xs font-bold tracking-widest px-2 py-0.5 rounded mb-1 inline-block"
                style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
              >
                {agent.role}
              </span>
              <h2 className="text-2xl font-black text-white"
                style={{ fontFamily: 'var(--font-cabinet, sans-serif)' }}>
                {agent.name}
              </h2>
              <p className="text-white/40 text-sm italic mt-0.5">"{agent.tagline}"</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:bg-white/20 transition-colors shrink-0"
            >
              ✕
            </button>
          </div>

          {/* Capabilities */}
          <ul className="space-y-2.5 mb-5">
            {agent.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0"
                  style={{ backgroundColor: `${agent.color}20` }}>
                  <svg className="w-3 h-3" style={{ color: agent.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/70 text-sm">{b}</span>
              </li>
            ))}
          </ul>

          {/* Stat */}
          <div
            className="rounded-xl p-3 mb-5 text-center"
            style={{ backgroundColor: `${agent.color}10`, border: `1px solid ${agent.color}25` }}
          >
            <span className="text-sm font-bold" style={{ color: agent.statColor }}>{agent.stat}</span>
          </div>

          {/* CTA */}
          <Link
            href={`/start?agent=${agent.name.toLowerCase()}&plan=personal`}
            onClick={onClose}
            className="block w-full py-3.5 rounded-xl font-bold text-center text-sm transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: agent.color, color: '#0a0a0a' }}
          >
            DEPLOY {agent.name} →
          </Link>
        </div>
      </motion.div>
    </motion.div>
  )
}
