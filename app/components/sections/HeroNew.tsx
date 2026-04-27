'use client';

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

// ── Robot Avatar Components ───────────────────────────────────────────────

function RobotAvatar({ name, color, size = 96 }: { name: string; color: string; size?: number }) {
  const initials = name.slice(0, 2)
  return (
    <div
      className="relative rounded-2xl overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: '#0a0a0a',
        border: `1px solid ${color}30`,
      }}
    >
      {/* Robot face grid */}
      <div className="absolute inset-0 grid opacity-5">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="border border-white/20" />
        ))}
      </div>

      {/* Face */}
      <div className="relative flex flex-col items-center gap-1">
        {/* Eyes */}
        <div className="flex gap-3 mb-1">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 12px ${color}80` }} />
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: color, boxShadow: `0 0 12px ${color}80`, animationDelay: '0.3s' }} />
        </div>
        {/* Mouth */}
        <div className="w-6 h-0.5 rounded-full" style={{ background: `${color}60` }} />
      </div>

      {/* Antenna */}
      <div
        className="absolute top-2 left-1/2 -translate-x-1/2 w-px h-3 rounded-full"
        style={{ background: `linear-gradient(to top, transparent, ${color})` }}
      />
    </div>
  )
}

// ── Featured Agents for Hero ───────────────────────────────────────────────

const FEATURED_AGENTS = [
  { name: 'AT', label: 'ATLAS', role: 'Sales', color: '#e8ff47', stat: '127 leads this week' },
  { name: 'NV', label: 'NOVA', role: 'Marketing', color: '#a78bfa', stat: '14 posts published' },
  { name: 'RX', label: 'REX', role: 'Research', color: '#34d399', stat: '89 sources monitored' },
  { name: 'ZR', label: 'ZARA', role: 'Support', color: '#fb923c', stat: '98% resolved < 2min' },
  { name: 'MK', label: 'MARCUS', role: 'Ops', color: '#60a5fa', stat: 'Zero missed tasks' },
  { name: 'MY', label: 'MAYA', role: 'Finance', color: '#22d3ee', stat: '$0 invoices missed' },
]

// ── Pain point ticker ─────────────────────────────────────────────────────

const PAIN_POINTS = [
  "Leads falling through the cracks?",
  "Slow follow-ups killing conversions?",
  "Reports taking hours every week?",
  "Staff stretched too thin?",
  "Scale without hiring?",
  "Manual work eating margins?",
]

// ── Hero Section ────────────────────────────────────────────────────────────

export default function HeroNew() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const [tickIdx, setTickIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setTickIdx(i => (i + 1) % PAIN_POINTS.length), 2800)
    return () => clearInterval(t)
  }, [])

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] pt-20 pb-16 px-6"
    >
      {/* Layered background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `linear-gradient(rgba(232,255,71,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(232,255,71,0.03) 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#0a0a0a]" />
        {/* Subtle warm glow at bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(ellipse, rgba(232,255,71,0.3), transparent 70%)' }}
        />
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 w-full max-w-5xl mx-auto text-center">

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <span className="inline-block font-mono text-[10px] uppercase tracking-[0.3em] text-[rgba(232,255,71,0.5)] border border-[rgba(232,255,71,0.2)] rounded-full px-4 py-1.5">
            AI Agents for Business
          </span>
        </motion.div>

        {/* Main headline — editorial, serif feel */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(2.5rem,6vw,5rem)] font-black leading-[0.95] tracking-[-0.03em] text-white mb-6"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Your AI workforce.
          <br />
          <span style={{ color: '#e8ff47' }}>Built in minutes.</span>
          <br />
          <span className="text-white/40">Works 24/7.</span>
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-[rgba(255,255,255,0.45)] text-lg md:text-xl max-w-xl mx-auto mb-8 leading-relaxed"
        >
          Recruit AI agents for sales, marketing, research, support & ops.
          Each one is specialized, autonomous, and wired into your tools.
        </motion.p>

        {/* Pain-point ticker */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mb-10"
        >
          <span className="font-mono text-xs text-[rgba(0,212,255,0.7)]">
            <span key={tickIdx} className="inline-block animate-fade-in">
              {PAIN_POINTS[tickIdx]}
            </span>
          </span>
          <span className="text-[rgba(255,255,255,0.15)] text-xs ml-2">→ ClawOps fixes it.</span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/start"
            className="inline-flex items-center gap-2 bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a] font-bold px-8 py-4 rounded-xl text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(232,255,71,0.3)]"
          >
            Deploy Your First Agent →
          </Link>
          <Link
            href="/team"
            className="inline-flex items-center gap-2 border border-white/15 hover:border-white/25 bg-white/5 hover:bg-white/8 text-white font-semibold px-8 py-4 rounded-xl text-sm transition-all"
          >
            Meet the Agents
          </Link>
        </motion.div>

        {/* Agent robot avatars row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/20 mb-5">
            Your AI team — live stats
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {FEATURED_AGENTS.map((agent, i) => (
              <motion.div
                key={agent.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="group flex items-center gap-2.5 bg-[#111] border border-white/7 rounded-full pl-2 pr-4 py-1.5 hover:border-white/15 transition-all"
              >
                <RobotAvatar name={agent.name} color={agent.color} size={32} />
                <div className="text-left">
                  <div className="text-[10px] font-black tracking-widest" style={{ color: agent.color }}>{agent.label}</div>
                  <div className="text-[9px] text-white/30">{agent.stat}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-px rounded-2xl border border-white/7 bg-white/3 max-w-lg mx-auto overflow-hidden"
        >
          {[
            { val: '850+', lbl: 'Integrations' },
            { val: '< 30 min', lbl: 'To running' },
            { val: '24/7', lbl: 'Always on' },
          ].map(s => (
            <div key={s.lbl} className="bg-[rgba(0,0,0,0.4)] py-5 px-4">
              <div className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-cabinet)' }}>{s.val}</div>
              <div className="text-[10px] text-white/30 mt-0.5 uppercase tracking-wider">{s.lbl}</div>
            </div>
          ))}
        </motion.div>

      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-4 h-7 rounded-full border border-white/20 flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1 h-1.5 rounded-full bg-white/30"
          />
        </div>
      </motion.div>
    </section>
  )
}
