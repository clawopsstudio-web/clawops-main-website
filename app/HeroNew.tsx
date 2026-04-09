'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

/* ─── Floating 3D shapes that react to scroll ─── */
function FloatingShapes() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()

  const orb1Y = useTransform(scrollYProgress, [0, 1], ['0%', '-40%'])
  const orb2Y = useTransform(scrollYProgress, [0, 1], ['0%', '-20%'])
  const ringRotate = useTransform(scrollYProgress, [0, 1], ['0deg', '180deg'])

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Glowing orb 1 */}
      <motion.div style={{ y: orb1Y }} className="absolute -top-32 -left-32 w-[500px] h-[500px]">
        <div className="w-full h-full rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0.04) 40%, transparent 70%)' }}
        />
      </motion.div>

      {/* Glowing orb 2 */}
      <motion.div style={{ y: orb2Y }} className="absolute -bottom-40 right-0 w-[600px] h-[600px]">
        <div className="w-full h-full rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(102,0,255,0.18) 0%, rgba(102,0,255,0.04) 40%, transparent 70%)' }}
        />
      </motion.div>

      {/* Rotating ring */}
      <motion.div style={{ rotate: ringRotate }} className="absolute top-1/4 right-[10%] w-64 h-64">
        <svg viewBox="0 0 256 256" className="w-full h-full opacity-20">
          <circle cx="128" cy="128" r="100" fill="none" stroke="#00D4FF" strokeWidth="1" strokeDasharray="8 12" />
          <circle cx="128" cy="128" r="80" fill="none" stroke="#6600FF" strokeWidth="0.5" strokeDasharray="4 16" />
          <circle cx="128" cy="128" r="60" fill="none" stroke="#00D4FF" strokeWidth="0.5" />
        </svg>
      </motion.div>

      {/* Particle dots */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-[#00D4FF]"
          style={{ left: `${8 + i * 8}%`, top: `${15 + (i % 5) * 15}%` }}
          animate={{ y: [0, -12, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

/* ─── Floating social proof cards ─── */
function FloatingCards() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Agent status card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute top-[22%] right-[7%] hidden md:block"
      >
        <div className="w-44 md:w-48 h-28 md:h-32 rounded-xl border border-[rgba(0,212,255,0.15)] bg-[rgba(6,6,15,0.85)] backdrop-blur-md p-4"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-xs text-[rgba(255,255,255,0.5)]">Agent live</span>
          </div>
          <div className="text-lg font-bold text-white">Sales Agent</div>
          <div className="text-xs text-[rgba(255,255,255,0.3)] mt-1">Processing 47 leads</div>
        </div>
      </motion.div>

      {/* API cost card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.85 }}
        className="absolute bottom-[28%] left-[4%] hidden lg:block"
      >
        <div className="w-40 h-26 rounded-xl border border-[rgba(102,0,255,0.2)] bg-[rgba(6,6,15,0.85)] backdrop-blur-md p-4"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
        >
          <div className="text-xs text-[rgba(255,255,255,0.4)] mb-1">API Costs</div>
          <div className="text-2xl font-bold text-white">$0.00</div>
          <div className="text-xs text-[#10b981] mt-1">-100% vs last month</div>
        </div>
      </motion.div>

      {/* Integrations card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.05 }}
        className="absolute top-[48%] right-[2%] hidden xl:block"
      >
        <div className="w-36 h-22 rounded-xl border border-[rgba(0,212,255,0.12)] bg-[rgba(6,6,15,0.85)] backdrop-blur-md p-4"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
        >
          <div className="text-xs text-[rgba(255,255,255,0.4)] mb-2">Integrations</div>
          <div className="flex -space-x-1.5">
            {['T', 'W', 'S', 'N', 'H'].map((l, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-[rgba(0,212,255,0.2)] border border-[rgba(0,0,0,0.3)] flex items-center justify-center text-[8px] text-[#00D4FF] font-bold">
                {l}
              </div>
            ))}
            <div className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[8px] text-[rgba(255,255,255,0.35)]">
              +495
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const QUICK_STATS = [
  { value: '$2,400', label: 'Avg saved / month' },
  { value: '3 min', label: 'Time to first agent' },
  { value: '500+', label: 'Integrations ready' },
]

export default function HeroNew() {
  const { scrollYProgress } = useScroll()
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95])

  return (
    <div className="relative overflow-hidden">

      {/* Fixed depth background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#08081a]" />

      {/* 3D shapes */}
      <FloatingShapes />
      <FloatingCards />

      {/* Hero Content — fades + scales on scroll */}
      <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10">
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex items-center px-6 lg:px-12 pt-28 pb-12">
            <div className="max-w-3xl mx-auto md:mx-0">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-[#00D4FF] px-4 py-1.5 rounded-full text-xs font-medium mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                Deploy Your First AI Agent in 3 Minutes — No Credit Card
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-[clamp(2.5rem,7vw,5rem)] font-black leading-[1.05] tracking-[-0.03em] mb-6"
              >
                <span className="text-white">Deploy Unlimited</span>
                <br />
                <span className="bg-gradient-to-r from-[#00D4FF] via-[#9966FF] to-[#00D4FF] bg-clip-text text-transparent">AI Agents.</span>
                <br />
                <span className="text-white">Pay Once.</span>
              </motion.h1>

              {/* Sub */}
              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-[rgba(255,255,255,0.5)] mb-10 max-w-xl leading-relaxed"
              >
                ClawOps runs your entire AI workforce — Sales, Support, Research, Ops — on{' '}
                <span className="text-white">your own infrastructure</span>. No per-agent API bills.
                No token costs. Just flat, predictable pricing from day one.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-12"
              >
                <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00D4FF] to-[#6600FF] hover:opacity-90 text-white font-semibold px-8 py-4 rounded-xl transition-opacity text-base">
                  Start Free — No Credit Card
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                <Link href="/how-it-works" className="inline-flex items-center gap-2 bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white font-medium px-8 py-4 rounded-xl transition-all text-base">
                  See How It Works
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap gap-8 border-t border-[rgba(255,255,255,0.08)] pt-8"
              >
                {QUICK_STATS.map((s) => (
                  <div key={s.label}>
                    <div className="text-2xl md:text-3xl font-bold text-white">{s.value}</div>
                    <div className="text-xs md:text-sm text-[rgba(255,255,255,0.4)] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2" aria-hidden="true">
          <span className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-[rgba(0,212,255,0.4)] to-transparent" />
        </div>
      </motion.div>
    </div>
  )
}
