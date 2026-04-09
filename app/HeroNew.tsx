'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

/* ─── 3D floating shapes — fixed layer, always visible, parallax on scroll ─── */
function FloatingShapes() {
  const { scrollYProgress } = useScroll()

  const orb1Y = useTransform(scrollYProgress, [0, 0.3], ['0px', '-120px'])
  const orb2Y = useTransform(scrollYProgress, [0, 0.3], ['0px', '-60px'])
  const ringRotate = useTransform(scrollYProgress, [0, 1], ['0deg', '180deg'])
  const particleOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div style={{ y: orb1Y }} className="absolute -top-32 -left-32 w-[600px] h-[600px]">
        <div className="w-full h-full rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.18) 0%, rgba(0,212,255,0.06) 35%, transparent 65%)' }} />
      </motion.div>
      <motion.div style={{ y: orb2Y }} className="absolute -bottom-40 right-0 w-[700px] h-[700px]">
        <div className="w-full h-full rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(102,0,255,0.22) 0%, rgba(102,0,255,0.06) 35%, transparent 65%)' }} />
      </motion.div>
      <motion.div style={{ rotate: ringRotate }} className="absolute top-[15%] right-[8%] w-72 h-72 md:w-80 md:h-80">
        <svg viewBox="0 0 256 256" className="w-full h-full opacity-[0.15]">
          <circle cx="128" cy="128" r="100" fill="none" stroke="#00D4FF" strokeWidth="1" strokeDasharray="8 12" />
          <circle cx="128" cy="128" r="78" fill="none" stroke="#6600FF" strokeWidth="0.75" strokeDasharray="4 16" />
          <circle cx="128" cy="128" r="55" fill="none" stroke="#00D4FF" strokeWidth="0.5" strokeDasharray="2 8" />
        </svg>
      </motion.div>
      <motion.div style={{ opacity: particleOpacity }} className="absolute inset-0">
        {[...Array(14)].map((_, i) => (
          <motion.div key={i} className="absolute w-1 h-1 rounded-full"
            style={{ left: `${6 + (i * 7) % 88}%`, top: `${10 + (i * 13) % 80}%`, backgroundColor: i % 3 === 0 ? '#a78bff' : '#00D4FF' }}
            animate={{ y: [0, -14 + (i % 5) * -3, 0], opacity: [0.15, 0.45, 0.15] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.25, ease: 'easeInOut' }} />
        ))}
      </motion.div>
      <PerspectiveGrid />
    </div>
  )
}

function PerspectiveGrid() {
  const { scrollYProgress } = useScroll()
  const gridOpacity = useTransform(scrollYProgress, [0, 0.15], [0.5, 0])
  const gridScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.7])
  return (
    <motion.div style={{ opacity: gridOpacity, scale: gridScale }}
      className="absolute bottom-0 left-0 right-0 h-[45vh] pointer-events-none" aria-hidden="true">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%]" style={{
        height: '100%',
        backgroundImage: `linear-gradient(to right, rgba(0,212,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,212,255,0.07) 1px, transparent 1px)`,
        backgroundSize: '60px 40px',
        transform: 'perspective(400px) rotateX(65deg)',
        transformOrigin: 'bottom center',
      }} />
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to top, #04040c 0%, transparent 100%)' }} />
    </motion.div>
  )
}

function FloatingCards() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-[18%] right-[2%] hidden xl:block">
        <div className="w-48 h-32 rounded-2xl border border-[rgba(0,212,255,0.18)] bg-[rgba(6,6,15,0.9)] backdrop-blur-md p-4"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,212,255,0.04)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-xs text-[rgba(255,255,255,0.45)]">Agent active</span>
          </div>
          <div className="text-lg font-bold text-white">Sales Agent</div>
          <div className="text-xs text-[rgba(255,255,255,0.3)] mt-1">47 leads processed today</div>
          <div className="mt-3 flex gap-1.5">
            {[80, 65, 90, 45].map((w, i) => (
              <div key={i} className="h-1.5 rounded-full bg-[rgba(0,212,255,0.3)]" style={{ width: `${w}px` }} />
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-[18%] left-[2%] hidden xl:block">
        <div className="w-44 h-28 rounded-2xl border border-[rgba(102,0,255,0.22)] bg-[rgba(6,6,15,0.9)] backdrop-blur-md p-4"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(102,0,255,0.04)' }}>
          <div className="text-xs text-[rgba(255,255,255,0.4)] mb-1">Revenue This Month</div>
          <div className="text-2xl font-bold text-white">+$18,400</div>
          <div className="text-xs text-[#10b981] mt-1">From AI-sourced leads</div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-[44%] right-[1%] hidden xl:block">
        <div className="w-38 h-28 rounded-2xl border border-[rgba(0,212,255,0.14)] bg-[rgba(6,6,15,0.9)] backdrop-blur-md p-4"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,212,255,0.03)' }}>
          <div className="text-xs text-[rgba(255,255,255,0.4)] mb-2">Powered by</div>
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-[#00D4FF]">OpenClaw</div>
          </div>
          <div className="text-[10px] text-[rgba(255,255,255,0.25)] mt-1">215K+ GitHub stars</div>
        </div>
      </motion.div>
    </div>
  )
}

const QUICK_STATS = [
  { value: "$3,000", label: "Avg saved vs new hire" },
  { value: "24/7", label: "Autonomous operation" },
  { value: "3 min", label: "From signup to live" },
]

export default function HeroNew() {
  const { scrollYProgress } = useScroll()
  const textOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 0.12], ['0px', '-30px'])

  return (
    <div className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #0a0a1a 0%, #0f0f2a 40%, #08081a 100%)' }} />
      <FloatingShapes />
      <FloatingCards />

      <motion.div style={{ opacity: textOpacity, y: textY }} className="relative z-10">
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex items-center px-6 lg:px-12 pt-24 md:pt-28 pb-0 md:pb-12">
            <div className="max-w-3xl mx-auto md:mx-0">

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-[#00D4FF] px-4 py-1.5 rounded-full text-xs font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                Built on OpenClaw — The Agentic OS for Scale
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-[clamp(2.5rem,7vw,5rem)] font-black leading-[1.05] tracking-[-0.03em] mb-6">
                <span className="text-white">The Agentic OS for</span>
                <br />
                <span className="bg-gradient-to-r from-[#00D4FF] via-[#9966FF] to-[#00D4FF] bg-clip-text text-transparent">
                  Businesses That Scale.
                </span>
                <br />
                <span className="text-white">Without Hiring.</span>
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-[rgba(255,255,255,0.5)] mb-10 max-w-xl leading-relaxed">
                ClawOps is the business layer on OpenClaw — giving you autonomous AI agents that{" "}
                <span className="text-white">plan, execute, and report</span> without you managing them.
                Your Sales Agent closes. Your Support Agent resolves. Your Ops Agent runs. You sleep.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-12">
                <Link href="/auth/signup"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00D4FF] to-[#6600FF] hover:opacity-90 text-white font-semibold px-8 py-4 rounded-xl transition-opacity text-base">
                  Run Your Business on AI — Free
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link href="/how-it-works"
                  className="inline-flex items-center gap-2 bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] text-white font-medium px-8 py-4 rounded-xl transition-all text-base">
                  See How It Works
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap gap-8 border-t border-[rgba(255,255,255,0.08)] pt-8">
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

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2" aria-hidden="true">
          <span className="text-[rgba(255,255,255,0.2)] text-[10px] uppercase tracking-[0.2em]">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-[rgba(0,212,255,0.4)] to-transparent" />
        </div>
      </motion.div>
    </div>
  )
}
