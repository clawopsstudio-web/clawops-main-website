'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Agent detailed profiles for the modal
const AGENT_PROFILES: Record<string, {
  name: string; role: string; color: string; tagline: string;
  about: string; skills: string[]; responsibilities: string[];
  tools: string[]; stats: Record<string, string>;
}> = {
  ATLAS: {
    name: 'ATLAS', role: 'SALES', color: '#e8ff47',
    tagline: 'Finds and qualifies leads daily.',
    about: 'Atlas is your autonomous sales agent that prospectively finds leads, sends personalised outreach, updates your CRM automatically, and books meetings — 24/7 without you lifting a finger.',
    skills: ['LinkedIn outreach automation', 'Email sequence management', 'CRM data enrichment', 'Meeting booking', 'Lead scoring & qualification', 'Cold email warmup'],
    responsibilities: ['Daily lead research & list building', 'Outreach sequence execution', 'Pipeline hygiene & follow-ups', 'Meeting qualification & booking', 'Sales reporting & analytics'],
    tools: ['LinkedIn', 'Apollo.io', 'HubSpot', 'Gmail', 'Calendly'],
    stats: { 'Leads Contacted': '127/week', 'Meetings Booked': '23/week', 'Response Rate': '34%', 'Pipeline Tracked': '$48K' }
  },
  NOVA: {
    name: 'NOVA', role: 'MARKETING', color: '#a78bfa',
    tagline: "Posts daily. You don't have to.",
    about: 'Nova is your autonomous marketing agent that creates content, schedules posts, monitors mentions, and generates weekly reports — keeping your brand alive 24/7.',
    skills: ['Multi-platform content creation', 'Hashtag & SEO optimization', 'Competitor monitoring', 'Analytics & reporting', 'Influencer discovery', 'Campaign automation'],
    responsibilities: ['Daily content creation & posting', 'Brand mention monitoring', 'Analytics compilation', 'Campaign management', 'Audience engagement'],
    tools: ['Buffer', 'Canva', 'SEMrush', 'Google Analytics', 'Later'],
    stats: { 'Posts Published': '14/week', 'Avg Engagement': '+127%', 'Followers Gained': '234/month', 'Active Campaigns': '3' }
  },
  REX: {
    name: 'REX', role: 'RESEARCH', color: '#34d399',
    tagline: 'Finds what your competitors hide.',
    about: 'Rex is your market intelligence agent that monitors competitors, tracks trends, and delivers actionable insights to your inbox daily.',
    skills: ['Competitive intelligence', 'Market trend analysis', 'News monitoring', 'Data extraction & synthesis', 'Report generation', 'Source verification'],
    responsibilities: ['Competitor tracking', 'Daily briefing generation', 'Market trend alerts', 'Industry news curation', 'Data visualization'],
    tools: ['Crunchbase', 'SimilarWeb', 'BuzzSumo', 'Google Alerts', 'Guru'],
    stats: { 'Sources Monitored': '89', 'Reports': 'Daily briefings', 'Alerts': 'Real-time', 'Competitors Tracked': '5' }
  },
  ZARA: {
    name: 'ZARA', role: 'SUPPORT', color: '#fb923c',
    tagline: 'Every ticket. Every time.',
    about: 'Zara handles customer queries 24/7, drafts responses for your approval, and escalates edge cases to your inbox when needed.',
    skills: ['Ticket management', 'FAQ automation', 'Response drafting', 'Escalation routing', 'Customer sentiment analysis', 'Knowledge base management'],
    responsibilities: ['Handle customer queries 24/7', 'Escalate edge cases', 'Draft responses for approval', 'Maintain knowledge base', 'Generate support reports'],
    tools: ['Intercom', 'Zendesk', 'Freshdesk', 'HelpScout', 'Tidio'],
    stats: { 'Queries Resolved': '98% < 2 min', 'Response Time': '<30 sec', 'CSAT Score': '4.8/5', 'Tickets Handled': '500+/day' }
  },
  MARCUS: {
    name: 'MARCUS', role: 'OPS', color: '#60a5fa',
    tagline: 'Runs the machine. You own it.',
    about: 'Marcus manages your scheduling, reminders, ops reports, and monitors tool health — so you can focus on growing your business.',
    skills: ['Schedule management', 'Reminder systems', 'Report generation', 'Tool health monitoring', 'Workflow automation', 'Calendar management'],
    responsibilities: ['Manage scheduling & reminders', 'Generate ops reports', 'Monitor tool health', 'Alert on issues', 'Workflow optimization'],
    tools: ['Notion', 'Asana', 'Calendar', 'Slack', 'PagerDuty'],
    stats: { 'Tasks Managed': 'Zero missed', 'Reports': 'Weekly summaries', 'Alerts': 'Real-time', 'Workflows': '12 active' }
  },
  MAYA: {
    name: 'MAYA', role: 'FINANCE', color: '#22d3ee',
    tagline: 'Every dollar tracked. Every invoice sent.',
    about: 'Maya tracks your invoices, flags overdue accounts, and generates cash flow summaries so you always know where your money stands.',
    skills: ['Invoice tracking', 'Payment reminders', 'Cash flow analysis', 'Expense categorization', 'Financial reporting', 'Budget monitoring'],
    responsibilities: ['Track invoices & payments', 'Flag overdue accounts', 'Generate cash flow summaries', 'Monitor expenses', 'Financial reporting'],
    tools: ['Stripe', 'QuickBooks', 'Xero', 'Wave', 'FreshBooks'],
    stats: { 'Invoices Tracked': '$0 missed', 'Overdue Flagged': '12/week', 'Cash Flow': 'Weekly reports', 'Expenses': 'Real-time' }
  }
}

const AGENTS = [
  { name: 'ATLAS', role: 'SALES', color: '#e8ff47', tagline: 'Finds and qualifies leads daily.', bullets: ['Sends personalised outreach sequences', 'Updates your CRM automatically', 'Books meetings without you in the loop'], stat: '127 leads contacted this week', statColor: '#e8ff47' },
  { name: 'NOVA', role: 'MARKETING', color: '#a78bfa', tagline: "Posts daily. You don't have to.", bullets: ['Monitors brand mentions across platforms', 'Generates weekly performance reports', 'Schedules content across all channels'], stat: '14 posts published this week', statColor: '#a78bfa' },
  { name: 'REX', role: 'RESEARCH', color: '#34d399', tagline: 'Finds what your competitors hide.', bullets: ['Tracks competitors and market signals', 'Summarises news relevant to your business', 'Delivers briefings to Slack or Telegram daily'], stat: '89 sources monitored', statColor: '#34d399' },
  { name: 'ZARA', role: 'SUPPORT', color: '#fb923c', tagline: 'Every ticket. Every time.', bullets: ['Handles customer queries 24/7', 'Escalates edge cases to your inbox', 'Drafts responses for your approval'], stat: '98% queries resolved < 2 min', statColor: '#fb923c' },
  { name: 'MARCUS', role: 'OPS', color: '#60a5fa', tagline: 'Runs the machine. You own it.', bullets: ['Manages scheduling and reminders', 'Generates weekly ops reports', 'Monitors tool health and alerts you'], stat: 'Zero missed tasks this month', statColor: '#60a5fa' },
  { name: 'MAYA', role: 'FINANCE', color: '#22d3ee', tagline: 'Every dollar tracked. Every invoice sent.', bullets: ['Tracks invoices and payment status', 'Flags overdue accounts automatically', 'Generates monthly cash flow summaries'], stat: '$0 invoices missed this quarter', statColor: '#22d3ee' },
]

const DEPARTMENTS = ['All', 'SALES', 'MARKETING', 'RESEARCH', 'SUPPORT', 'OPS', 'FINANCE']

export default function AgentCards() {
  const [activeTab, setActiveTab] = useState('All')
  const [selectedAgent, setSelectedAgent] = useState<typeof AGENTS[0] | null>(null)

  const filtered = activeTab === 'All' ? AGENTS : AGENTS.filter(a => a.role === activeTab)

  return (
    <div>
      <div className="flex gap-2 flex-wrap mb-12 justify-center">
        {DEPARTMENTS.map(dept => (
          <button key={dept} onClick={() => setActiveTab(dept)}
            className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all ${
              activeTab === dept ? 'bg-[#e8ff47] text-[#0a0a0a]' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
            }`}>
            {dept}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(agent => (
          <AgentCard key={agent.name} agent={agent} onRecruit={() => setSelectedAgent(agent)} />
        ))}
      </div>

      <AnimatePresence>
        {selectedAgent && (
          <AgentModal agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

function AgentCard({ agent, onRecruit }: { agent: typeof AGENTS[0]; onRecruit: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-[#111] rounded-2xl border border-white/7 overflow-hidden flex flex-col">
      
      {/* Agent avatar with image */}
      <div className="aspect-square w-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
        <img src={`/agents/${agent.name.toLowerCase()}.jpg`} alt={agent.name}
          className="w-full h-full object-cover" onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            target.nextElementSibling?.classList.remove('hidden')
          }} />
        <div className="hidden w-full h-full flex items-center justify-center">
          <span className="text-6xl font-black" style={{ color: agent.color, fontFamily: 'var(--font-cabinet, sans-serif)' }}>
            {agent.name[0]}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold tracking-widest px-2 py-0.5 rounded"
            style={{ backgroundColor: `${agent.color}20`, color: agent.color }}>{agent.role}</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Available</span>
          </div>
        </div>

        <h3 className="text-2xl font-black text-white mb-1 tracking-tight"
          style={{ fontFamily: 'var(--font-cabinet, sans-serif)' }}>{agent.name}</h3>
        <p className="text-white/40 text-xs italic mb-4 leading-relaxed">"{agent.tagline}"</p>

        <ul className="space-y-2 mb-4 flex-1">
          {agent.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: agent.color }} />
              <span className="text-white/55 text-xs leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>

        <div className="rounded-lg p-2.5 mb-4 text-center"
          style={{ backgroundColor: `${agent.color}10`, border: `1px solid ${agent.color}25` }}>
          <span className="text-xs font-bold" style={{ color: agent.statColor }}>{agent.stat}</span>
        </div>

        <button onClick={onRecruit}
          className="w-full py-3 rounded-xl font-bold text-sm text-center transition-all hover:brightness-110 active:scale-[0.98]"
          style={{ backgroundColor: agent.color, color: '#0a0a0a' }}>
          RECRUIT →
        </button>
      </div>
    </motion.div>
  )
}

function AgentModal({ agent, onClose }: { agent: typeof AGENTS[0]; onClose: () => void }) {
  const profile = AGENT_PROFILES[agent.name]
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-2xl bg-[#111] rounded-2xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        
        {/* Header with avatar */}
        <div className="bg-[#0a0a0a] p-8 flex items-center gap-6">
          <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 border-2" style={{ borderColor: agent.color }}>
            <img src={`/agents/${agent.name.toLowerCase()}.jpg`} alt={agent.name}
              className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-xs font-bold tracking-widest px-2 py-0.5 rounded inline-block mb-2"
              style={{ backgroundColor: `${agent.color}20`, color: agent.color }}>{agent.role}</span>
            <h2 className="text-4xl font-black text-white"
              style={{ fontFamily: 'var(--font-cabinet, sans-serif)' }}>{agent.name}</h2>
            <p className="text-white/40 text-sm italic mt-1">"{agent.tagline}"</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/40">Available for hire</span>
            </div>
          </div>
          <button onClick={onClose}
            className="ml-auto w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:bg-white/20 transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* About */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-white/30 uppercase mb-2">About</h3>
            <p className="text-white/70 text-sm leading-relaxed">{profile.about}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(profile.stats).map(([key, value]) => (
              <div key={key} className="bg-[#0a0a0a] rounded-xl p-3 text-center">
                <div className="text-lg font-black" style={{ color: agent.color }}>{value}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider mt-1">{key}</div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-white/30 uppercase mb-3">Skills & Capabilities</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <span key={skill} className="px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${agent.color}15`, color: agent.color, border: `1px solid ${agent.color}30` }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Responsibilities */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-white/30 uppercase mb-3">Responsibilities</h3>
            <ul className="space-y-2">
              {profile.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center mt-0.5 shrink-0"
                    style={{ backgroundColor: `${agent.color}20` }}>
                    <svg className="w-3 h-3" style={{ color: agent.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white/70 text-sm">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-white/30 uppercase mb-3">Integrations</h3>
            <div className="flex flex-wrap gap-2">
              {profile.tools.map(tool => (
                <span key={tool} className="px-3 py-1.5 rounded-lg text-xs bg-white/5 text-white/60">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4 border-t border-white/10">
            <a href="/start"
              className="block w-full py-4 rounded-xl font-bold text-center text-sm transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundColor: agent.color, color: '#0a0a0a' }}>
              Recruit {agent.name} →
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
