'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const agents = [
  { name: 'Ryan', role: 'Sales', emoji: '🤝', color: '#e8ff47', accent: 'rgba(232,255,71,0.12)' },
  { name: 'Arjun', role: 'Research', emoji: '🔍', color: '#00d4ff', accent: 'rgba(0,212,255,0.12)' },
  { name: 'Tyler', role: 'Marketing', emoji: '📣', color: '#ff6b6b', accent: 'rgba(255,107,107,0.12)' },
  { name: 'Ava', role: 'Support', emoji: '🎧', color: '#a78bfa', accent: 'rgba(167,139,250,0.12)' },
  { name: 'Sage', role: 'Operations', emoji: '⚙️', color: '#34d399', accent: 'rgba(52,211,153,0.12)' },
  { name: 'Max', role: 'Finance', emoji: '📊', color: '#fb923c', accent: 'rgba(251,146,60,0.12)' },
]

const steps = [
  {
    number: '01',
    title: 'Pick your agents.',
    description: 'Choose from 6 specialized agents — Sales, Research, Marketing, Support, Ops, and Finance. Each is trained for their domain.',
    icon: '🤖',
  },
  {
    number: '02',
    title: 'Connect your tools.',
    description: 'Link your CRM, email, calendar, and messaging apps. Agents learn your workflows and integrate into how you already work.',
    icon: '🔗',
  },
  {
    number: '03',
    title: 'Go to sleep.',
    description: 'Your team runs 24/7. Agents prospect, research, support, and report — autonomously. You wake up to done work.',
    icon: '😴',
  },
]

const faqs = [
  {
    q: 'What makes ClawOps different from hiring?',
    a: 'ClawOps agents work around the clock, never call in sick, and scale instantly. You get a full team from day one without recruiting, onboarding, or management overhead.',
  },
  {
    q: 'How do I communicate with agents?',
    a: 'Telegram, WhatsApp, Slack, Discord — your agents live where you already work. You can also manage them from your dashboard.',
  },
  {
    q: 'Can I customize agent behavior?',
    a: 'Yes. Every agent has a configurable name, tone, and instruction set. They learn your product, your voice, and your processes over time.',
  },
  {
    q: 'What if an agent makes a mistake?',
    a: 'Agents flag uncertainty and escalate. You set approval thresholds and review workflows. They improve continuously based on your feedback.',
  },
  {
    q: 'Do agents really work 24/7?',
    a: 'Yes. ClawOps runs on dedicated VPS infrastructure. Your agents are always active, always monitoring, always responding — no sleeping, no weekends.',
  },
  {
    q: 'Can I start with just one agent?',
    a: 'Every plan starts with 2 agents included. You can add more as your needs grow — the Personal plan goes up to 5, Business up to 20.',
  },
]

function FAQItem({ faq, index }: { faq: typeof faqs[0]; index: number }) {
  return (
    <motion.details
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      viewport={{ once: true }}
      className="group border-b border-white/10 py-5 cursor-pointer"
    >
      <summary className="flex items-center justify-between text-white font-medium list-none">
        <span className="text-base">{faq.q}</span>
        <span className="text-white/30 group-open:rotate-45 transition-transform duration-300 text-xl ml-4 shrink-0">+</span>
      </summary>
      <p className="text-white/40 text-sm mt-3 leading-relaxed max-w-2xl">
        {faq.a}
      </p>
    </motion.details>
  )
}

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8ff47] animate-pulse" />
            Now in early access — 500 teams onboarded
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] mb-8"
          >
            The OS for your
            <br />
            <span className="text-[#e8ff47]">AI business team.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Deploy specialized AI agents that work 24/7 across your business.
            Sales, research, marketing, support, ops, and finance —
            all connected to your tools and channels.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/start"
              className="w-full sm:w-auto px-8 py-4 bg-[#e8ff47] text-[#0a0a0a] font-bold text-lg rounded-2xl hover:bg-[#d4eb3a] transition-all hover:shadow-[0_0_40px_rgba(232,255,71,0.25)] text-center"
            >
              Get Early Access →
            </Link>
            <Link
              href="/team"
              className="w-full sm:w-auto px-8 py-4 border border-white/20 text-white font-medium text-lg rounded-2xl hover:border-white/40 hover:bg-white/5 transition-all text-center"
            >
              Meet the team
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 text-xs animate-bounce">
          <span>scroll</span>
          <span>↓</span>
        </div>
      </section>

      {/* Agent Roster */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">The Roster</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Six agents. Every role.
            </h2>
            <p className="text-white/50 max-w-lg mx-auto">
              Each agent is specialized for a specific business function. Deploy the ones that matter to you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="group relative rounded-2xl border border-white/10 bg-[#0d0d0d] p-6 hover:border-white/20 transition-all duration-300 cursor-pointer"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
                  style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }}
                />
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: agent.accent, border: `1px solid ${agent.color}30` }}
                  >
                    {agent.emoji}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-base">{agent.name}</p>
                    <p className="text-sm" style={{ color: agent.color }}>{agent.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/team"
              className="inline-flex items-center gap-2 text-[#e8ff47] text-sm font-medium hover:underline"
            >
              See full agent breakdown →
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Step Explainer */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">How it works</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Three steps to a full AI team.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 w-full h-px bg-gradient-to-r from-white/10 to-transparent z-10" />
                )}
                <div className="text-[64px] mb-4 leading-none">{step.icon}</div>
                <div className="text-[10px] font-mono text-white/30 mb-3">Step {step.number}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA Strip */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple pricing. No surprises.
            </h2>
            <p className="text-white/50 mb-12 max-w-lg mx-auto">
              Flat monthly rates. All agents included. Scale up when you're ready.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { name: 'Personal', price: '$49', agents: '2 agents', highlight: false },
                { name: 'Team', price: '$149', agents: '5 agents', highlight: true },
                { name: 'Business', price: '$299', agents: '10 agents', highlight: false },
                { name: 'Enterprise', price: '$349', agents: '20 agents', highlight: false },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-6 text-center border ${
                    plan.highlight
                      ? 'border-[#e8ff47]/50 bg-[rgba(232,255,71,0.08)]'
                      : 'border-white/10 bg-[#0d0d0d]'
                  }`}
                >
                  <p className={`text-xs font-mono mb-2 ${plan.highlight ? 'text-[#e8ff47]' : 'text-white/40'}`}>
                    {plan.name}
                  </p>
                  <p className="text-3xl font-bold text-white mb-1">{plan.price}</p>
                  <p className="text-xs text-white/40">/month</p>
                  <p className="text-xs mt-3" style={{ color: plan.highlight ? '#e8ff47' : '#ffffff60' }}>
                    {plan.agents}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/start"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#e8ff47] text-[#0a0a0a] font-bold text-lg rounded-2xl hover:bg-[#d4eb3a] transition-all hover:shadow-[0_0_40px_rgba(232,255,71,0.25)]"
            >
              Get Early Access →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-32 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-[10px] font-mono text-white/30 uppercase tracking-widest mb-4">FAQ</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Questions. Answers.
            </h2>
          </motion.div>

          <div>
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} index={i} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
