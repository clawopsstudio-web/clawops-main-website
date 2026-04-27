'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const STEPS = [
  {
    num: '01',
    title: 'Pick your agents.',
    body: 'Choose from Atlas (Sales), Nova (Marketing), Rex (Research), Zara (Support), Marcus (Ops), and Maya (Finance). Each one is pre-trained for your use case.',
    accent: '#e8ff47',
  },
  {
    num: '02',
    title: 'Connect your tools.',
    body: 'Wire in your Gmail, Notion, Slack, HubSpot, GoHighLevel, or any of 850+ apps. Agents land with your stack already wired — no config needed.',
    accent: '#a78bfa',
  },
  {
    num: '03',
    title: 'Go. 24/7.',
    body: 'Agents start working immediately. They send outreach, post content, answer support tickets, monitor competitors, and report back — autonomously.',
    accent: '#34d399',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="bg-[#0a0a0a] py-24 px-6 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[rgba(232,255,71,0.5)] mb-4">
            HOW IT WORKS
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Up and running in minutes.
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* Step number */}
              <div className="mb-5">
                <span
                  className="text-5xl font-black tracking-tight"
                  style={{ color: `${step.accent}30`, fontFamily: 'var(--font-display)' }}
                >
                  {step.num}
                </span>
              </div>

              {/* Accent line */}
              <div className="h-0.5 w-12 rounded-full mb-5" style={{ background: step.accent }} />

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                {step.title}
              </h3>

              {/* Body */}
              <p className="text-white/40 text-sm leading-relaxed">{step.body}</p>

              {/* Connector arrow (not on last) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-16 -right-3 text-white/10">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Link
            href="/start"
            className="inline-flex items-center gap-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a] font-bold px-8 py-4 rounded-xl text-sm transition-all hover:-translate-y-0.5"
          >
            Start deploying →
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
