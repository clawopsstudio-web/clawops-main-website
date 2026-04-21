'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AGENTS = [
  {
    name: 'Ryan',
    role: 'Sales Rep',
    department: 'Sales',
    departmentColor: '#e8ff47',
    tagline: 'Books meetings you never could.',
    personality: 'Cold-calling at 7am before the coffee kicks in.',
    experience: [
      'Finds your ICP from your target market',
      'Sends personalized cold outreach at scale',
      'Follows up until they book a call',
      'Hands warm leads directly to your calendar',
    ],
    skills: ['Cold Email', 'LinkedIn Outreach', 'CRM Pipeline', 'HubSpot', 'Follow-up Sequences'],
    problems: ['No time for outreach', 'Leads going cold', 'Manual follow-ups'],
    rating: 4.8,
    reviews: 849,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
  },
  {
    name: 'Tyler',
    role: 'Marketing Agent',
    department: 'Marketing',
    departmentColor: '#e8ff47',
    tagline: "Posts daily. You don't have to.",
    personality: 'Drafting LinkedIn posts between espresso shots.',
    experience: [
      'Researches your audience and competitors',
      'Creates content across all channels',
      'Schedules and posts automatically',
      'Reports what worked in weekly digest',
    ],
    skills: ['Content Creation', 'SEO Audit', 'Social Posts', 'Email Sequences', 'Blog Writing'],
    problems: ['No time for content', 'Inconsistent posting', 'SEO ignored'],
    rating: 4.7,
    reviews: 1243,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face',
  },
  {
    name: 'Arjun',
    role: 'Research Agent',
    department: 'Research',
    departmentColor: '#10b981',
    tagline: 'Finds what your competitors are hiding.',
    personality: 'Reading SEC filings for fun.',
    experience: [
      'Scrapes competitor websites and pricing',
      'Monitors market for changes in real-time',
      'Logs findings to Notion automatically',
      'Alerts you when something matters',
    ],
    skills: ['Competitor Intel', 'Market Research', 'Deep Research', 'Notion Logging', 'Web Scraping'],
    problems: ['No time for research', 'Missing market intel', 'Decisions based on gut'],
    rating: 4.9,
    reviews: 567,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84e45a1fc?w=400&h=400&fit=crop&crop=face',
  },
  {
    name: 'Helena',
    role: 'Support Agent',
    department: 'Support',
    departmentColor: '#f59e0b',
    tagline: 'Every ticket. Every time.',
    personality: 'Answering questions at 2am so you don\'t have to.',
    experience: [
      'Learns your knowledge base instantly',
      'Handles Tier 1 support questions',
      'Escalates what matters to you',
      'Logs everything for your records',
    ],
    skills: ['FAQ Handler', 'Ticket Response', 'Knowledge Base', 'Escalation', 'Customer Support'],
    problems: ['Tickets eating your day', 'FAQ answered 100 times', 'Customers going unanswered'],
    rating: 4.6,
    reviews: 2103,
    avatar: 'https://images.unsplash.com/photo-1494790108378-2e7a5bccd87?w=400&h=400&fit=crop&crop=face',
  },
  {
    name: 'Marcus',
    role: 'Engineering Agent',
    department: 'Engineering',
    departmentColor: '#ec4899',
    tagline: 'Ships code while you sleep.',
    personality: 'Refactoring legacy code between coffee runs.',
    experience: [
      'Reviews pull requests automatically',
      'Deploys tested code to staging',
      'Monitors uptime and errors 24/7',
      'Reports what shipped, what broke, what needs attention',
    ],
    skills: ['Code Review', 'Deployment Automation', 'GitHub Management', 'Error Monitoring', 'CI/CD'],
    problems: ['Code reviews taking days', 'Deployments manual', 'Bugs discovered late'],
    rating: 4.8,
    reviews: 421,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43?w=400&h=400&fit=crop&crop=face',
  },
  {
    name: 'Maya',
    role: 'Finance Agent',
    department: 'Finance',
    departmentColor: '#06b6d4',
    tagline: 'Every dollar tracked. Every invoice sent.',
    personality: 'Running P&L reports at 6am.',
    experience: [
      'Tracks all income and expenses automatically',
      'Sends invoices and follows up on payments',
      'Generates financial reports weekly',
      'Flags anomalies before they become problems',
    ],
    skills: ['Invoice Automation', 'Expense Tracking', 'Financial Reports', 'Stripe Integration', 'Billing'],
    problems: ['Invoices untracked', 'Cash flow blind spots', 'Reporting manual'],
    rating: 4.7,
    reviews: 312,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face',
  },
];

const DEPARTMENTS = ['All', 'Sales', 'Marketing', 'Research', 'Support', 'Engineering', 'Finance', 'Operations'];

export default function AgentCards() {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedAgent, setSelectedAgent] = useState<typeof AGENTS[0] | null>(null);

  const filtered = activeTab === 'All' 
    ? AGENTS 
    : AGENTS.filter(a => a.department === activeTab);

  return (
    <div>
      {/* Department Tabs */}
      <div className="flex gap-2 flex-wrap mb-12 justify-center">
        {DEPARTMENTS.map(dept => (
          <button
            key={dept}
            onClick={() => setActiveTab(dept)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === dept 
                ? 'bg-[#e8ff47] text-[#0a0a0a]' 
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((agent) => (
          <AgentCard 
            key={agent.name} 
            agent={agent} 
            onRecruit={() => setSelectedAgent(agent)} 
          />
        ))}
      </div>

      {/* Agent Sheet/Modal */}
      <AnimatePresence>
        {selectedAgent && (
          <AgentSheet agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function AgentCard({ agent, onRecruit }: { agent: typeof AGENTS[0]; onRecruit: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#0a0a14] border border-white/10 cursor-pointer"
      onClick={onRecruit}
    >
      {/* Image */}
      <img 
        src={agent.avatar} 
        alt={agent.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      
      {/* Status dot */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
      </div>

      {/* Department tag */}
      <div className="absolute top-4 left-4">
        <span 
          className="text-xs font-medium px-3 py-1 rounded-full"
          style={{ backgroundColor: `${agent.departmentColor}20`, color: agent.departmentColor }}
        >
          {agent.department}
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
        <p className="text-white/60 text-sm mb-3">{agent.role}</p>
        <p className="text-white/40 text-sm italic mb-4">"{agent.tagline}"</p>
        
        {/* Rating */}
        <div className="flex items-center gap-2">
          <span className="text-[#f59e0b] text-sm">★ {agent.rating}</span>
          <span className="text-white/30 text-sm">{agent.reviews} reviews</span>
        </div>
      </div>

      {/* Recruit Button — appears on hover */}
      <motion.button
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      >
        <span className="px-6 py-3 bg-[#e8ff47] text-[#0a0a0a] font-semibold rounded-xl">
          RECRUIT
        </span>
      </motion.button>
    </motion.div>
  );
}

function AgentSheet({ agent, onClose }: { agent: typeof AGENTS[0]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0a0a14] border border-white/10 rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-64 overflow-hidden">
          <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] to-transparent" />
          <div className="absolute bottom-6 left-6">
            <span 
              className="text-xs font-medium px-3 py-1 rounded-full mb-2 inline-block"
              style={{ backgroundColor: `${agent.departmentColor}20`, color: agent.departmentColor }}
            >
              {agent.department}
            </span>
            <h2 className="text-3xl font-bold text-white">{agent.name}</h2>
            <p className="text-white/60">{agent.role}</p>
            <p className="text-white/40 italic mt-1">"{agent.tagline}"</p>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Experience */}
          <div>
            <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-4">Experience</h4>
            <ol className="space-y-3">
              {agent.experience.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#e8ff47]/20 text-[#e8ff47] text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-white/80">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Problems */}
          <div>
            <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Problems I Solve</h4>
            <ul className="space-y-2">
              {agent.problems.map((p, i) => (
                <li key={i} className="flex items-center gap-2 text-white/70">
                  <span className="w-1.5 h-1.5 bg-[#e8ff47] rounded-full" />
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* Skills */}
          <div>
            <h4 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {agent.skills.map(skill => (
                <span key={skill} className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-sm border border-white/10">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Personality */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-white/40 text-sm mb-1">Personality</p>
            <p className="text-white/80 italic">"{agent.personality}"</p>
          </div>

          {/* CTA */}
          <div className="flex gap-3">
            <button className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/15 transition-colors">
              Available now
            </button>
            <button className="flex-1 py-3 bg-[#e8ff47] text-[#0a0a0a] font-semibold rounded-xl hover:bg-[#e8ff47]/90 transition-colors">
              Recruit
            </button>
          </div>

          {/* Onboarding */}
          <div className="p-4 rounded-xl bg-[#e8ff47]/5 border border-[#e8ff47]/20">
            <h4 className="text-sm font-semibold text-[#e8ff47] mb-3">How onboarding works</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { step: '1', label: 'Connect channel' },
                { step: '2', label: 'Configure agent' },
                { step: '3', label: 'Starts working' },
              ].map(s => (
                <div key={s.step}>
                  <div className="w-8 h-8 rounded-full bg-[#e8ff47] text-[#0a0a0a] font-bold text-sm flex items-center justify-center mx-auto mb-2">
                    {s.step}
                  </div>
                  <p className="text-xs text-white/50">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
