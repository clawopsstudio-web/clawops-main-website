'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

/* eslint-disable @typescript-eslint/no-explicit-any */
/* ─── Animated background — visible floating elements with 3D scroll parallax ─── */
function FloatingShapes({ bgOrb1Y, bgOrb1X, bgOrb2Y, bgOrb2X, bgRingScale, bgRingOpacity, bgParticleY, scrollYProgress }: {
  bgOrb1Y: any; bgOrb1X: any; bgOrb2Y: any; bgOrb2X: any;
  bgRingScale: any; bgRingOpacity: any; bgParticleY: any;
  scrollYProgress: any;
}) {
  const ringRotate = useTransform(scrollYProgress, [0, 1], ['0deg', '180deg'])
  const ring2Rotate = useTransform(scrollYProgress, [0, 1], ['0deg', '-120deg'])
  const particleOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])

  // 24 animated particles scattered across the hero
  const particles = [
    { x: 8, y: 15, size: 3, delay: 0, color: '#e8ff47' },
    { x: 22, y: 25, size: 2, delay: 0.3, color: '#e8ff47' },
    { x: 35, y: 10, size: 3, delay: 0.6, color: '#e8ff47' },
    { x: 48, y: 35, size: 2, delay: 0.9, color: '#a78bff' },
    { x: 60, y: 20, size: 3, delay: 1.2, color: '#e8ff47' },
    { x: 72, y: 40, size: 2, delay: 0.2, color: '#e8ff47' },
    { x: 85, y: 15, size: 3, delay: 0.5, color: '#a78bff' },
    { x: 92, y: 30, size: 2, delay: 0.8, color: '#e8ff47' },
    { x: 15, y: 55, size: 3, delay: 1.1, color: '#e8ff47' },
    { x: 30, y: 70, size: 2, delay: 1.4, color: '#e8ff47' },
    { x: 45, y: 60, size: 3, delay: 0.1, color: '#a78bff' },
    { x: 58, y: 75, size: 2, delay: 0.4, color: '#e8ff47' },
    { x: 70, y: 55, size: 3, delay: 0.7, color: '#e8ff47' },
    { x: 82, y: 68, size: 2, delay: 1.0, color: '#a78bff' },
    { x: 95, y: 50, size: 3, delay: 1.3, color: '#e8ff47' },
    { x: 5, y: 80, size: 2, delay: 0.2, color: '#e8ff47' },
    { x: 20, y: 88, size: 3, delay: 0.5, color: '#a78bff' },
    { x: 38, y: 82, size: 2, delay: 0.8, color: '#e8ff47' },
    { x: 55, y: 90, size: 3, delay: 1.1, color: '#e8ff47' },
    { x: 67, y: 85, size: 2, delay: 1.4, color: '#e8ff47' },
    { x: 78, y: 92, size: 3, delay: 0.3, color: '#a78bff' },
    { x: 88, y: 78, size: 2, delay: 0.6, color: '#e8ff47' },
    { x: 96, y: 85, size: 3, delay: 0.9, color: '#e8ff47' },
    { x: 50, y: 45, size: 4, delay: 0, color: '#e8ff47' },
  ]

  // Constellation lines connecting nearby particles
  const lines = [
    { x1: 8, y1: 15, x2: 22, y2: 25 },
    { x1: 22, y1: 25, x2: 35, y2: 10 },
    { x1: 48, y1: 35, x2: 60, y2: 20 },
    { x1: 60, y1: 20, x2: 72, y2: 40 },
    { x1: 72, y1: 40, x2: 85, y2: 15 },
    { x1: 15, y1: 55, x2: 30, y2: 70 },
    { x1: 30, y1: 70, x2: 45, y2: 60 },
    { x1: 58, y1: 75, x2: 70, y2: 55 },
    { x1: 70, y1: 55, x2: 82, y2: 68 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">

      {/* Large glowing orbs — 3D parallax */}
      <motion.div style={{ y: bgOrb1Y, x: bgOrb1X }}
        className="absolute -top-16 -left-16 w-[500px] h-[500px]">
        <div className="w-full h-full rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.25) 0%, rgba(0,212,255,0.12) 30%, transparent 65%)' }} />
      </motion.div>
      <motion.div style={{ y: bgOrb2Y, x: bgOrb2X }}
        className="absolute -bottom-20 right-0 w-[600px] h-[600px]">
        <div className="w-full h-full rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(102,0,255,0.28) 0%, rgba(102,0,255,0.12) 30%, transparent 65%)' }} />
      </motion.div>
      {/* Third orb — bottom left */}
      <motion.div
        animate={{ y: [0, 30, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-20 left-10 w-[300px] h-[300px]">
        <div className="w-full h-full rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.15) 0%, transparent 65%)' }} />
      </motion.div>

      {/* Rotating ring set — 3D scroll parallax */}
      <motion.div style={{ rotate: ringRotate, scale: bgRingScale, opacity: bgRingOpacity }}
        className="absolute top-[10%] right-[5%] w-64 h-64 md:w-80 md:h-80">
        <svg viewBox="0 0 256 256" className="w-full h-full opacity-25">
          <circle cx="128" cy="128" r="110" fill="none" stroke="#e8ff47" strokeWidth="1" strokeDasharray="6 8" />
          <circle cx="128" cy="128" r="88" fill="none" stroke="#e8ff47" strokeWidth="0.75" strokeDasharray="3 12" />
          <circle cx="128" cy="128" r="65" fill="none" stroke="#e8ff47" strokeWidth="0.5" strokeDasharray="2 6" />
        </svg>
      </motion.div>
      {/* Second ring set — bottom left, counter-rotating */}
      <motion.div style={{ rotate: ring2Rotate }}
        className="absolute bottom-[20%] left-[2%] w-48 h-48 opacity-20">
        <svg viewBox="0 0 256 256" className="w-full h-full">
          <circle cx="128" cy="128" r="110" fill="none" stroke="#a78bff" strokeWidth="1" strokeDasharray="8 10" />
          <circle cx="128" cy="128" r="75" fill="none" stroke="#e8ff47" strokeWidth="0.75" strokeDasharray="4 14" />
        </svg>
      </motion.div>

      {/* Animated particles — 3D parallax */}
      <motion.div style={{ opacity: particleOpacity, y: bgParticleY }} className="absolute inset-0">
        {particles.map((p, i) => (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            }}
            animate={{
              y: [0, -18 + (i % 7) * -3, 0],
              opacity: [0.3, 0.9, 0.3],
              scale: [1, 1.3, 1],
            }}
            transition={{ duration: 3 + (i % 5) * 0.8, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
          />
        ))}

        {/* Constellation lines — connecting particles */}
        <svg className="absolute inset-0 w-full h-full">
          {lines.map((l, i) => (
            <motion.line key={i}
              x1={`${l.x1}%`} y1={`${l.y1}%`} x2={`${l.x2}%`} y2={`${l.y2}%`}
              stroke="#e8ff47" strokeWidth="0.5" opacity="0.15"
              animate={{ opacity: [0.08, 0.2, 0.08] }}
              transition={{ duration: 4 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Floating grid — perspective floor */}
      <PerspectiveGrid />

      {/* Animated horizontal scan line */}
      <motion.div
        animate={{ y: ['-10%', '110%'], opacity: [0, 0.06, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8ff47] to-transparent"
      />
    </div>
  )
}

function PerspectiveGrid() {
  const { scrollYProgress } = useScroll()
  const gridOpacity = useTransform(scrollYProgress, [0, 0.15], [0.6, 0])
  const gridScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.7])
  return (
    <motion.div style={{ opacity: gridOpacity, scale: gridScale }}
      className="absolute bottom-0 left-0 right-0 h-[50vh] pointer-events-none">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%]" style={{
        height: '100%',
        backgroundImage: `linear-gradient(to right, rgba(0,212,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,212,255,0.12) 1px, transparent 1px)`,
        backgroundSize: '60px 40px',
        transform: 'perspective(400px) rotateX(65deg)',
        transformOrigin: 'bottom center',
      }} />
      <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: 'linear-gradient(to top, #0a0a0a 0%, transparent 100%)' }} />
    </motion.div>
  )
}

function FloatingCards() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-[6%] right-[3%] hidden xl:block">
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
        className="absolute top-[6%] left-[3%] hidden xl:block">
        <div className="w-44 h-28 rounded-2xl border border-[rgba(102,0,255,0.22)] bg-[rgba(6,6,15,0.9)] backdrop-blur-md p-4"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(102,0,255,0.04)' }}>
          <div className="text-xs text-[rgba(255,255,255,0.4)] mb-1">Revenue This Month</div>
          <div className="text-2xl font-bold text-white">+$18,400</div>
          <div className="text-xs text-[#10b981] mt-1">From AI-sourced leads</div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 40, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.95, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-[20%] right-[3%] hidden xl:block">
        <div className="w-38 h-28 rounded-2xl border border-[rgba(0,212,255,0.14)] bg-[rgba(6,6,15,0.9)] backdrop-blur-md p-4"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,212,255,0.03)' }}>
          <div className="text-xs text-[rgba(255,255,255,0.4)] mb-2">Powered by</div>
          <div className="flex items-center gap-2">
            <div className="text-lg font-bold text-[#e8ff47]">ClawOps</div>
          </div>
          
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

  // 3D scroll parallax — text content moves up and fades as user scrolls
  // Each layer moves at a different speed for depth
  const headlineY = useTransform(scrollYProgress, [0, 0.12], ['0px', '-40px'])
  const headlineRotateX = useTransform(scrollYProgress, [0, 0.1], ['0deg', '-3deg'])
  const subtextY = useTransform(scrollYProgress, [0, 0.12], ['0px', '-20px'])
  const ctaY = useTransform(scrollYProgress, [0, 0.12], ['0px', '-10px'])
  const badgeY = useTransform(scrollYProgress, [0, 0.12], ['0px', '-15px'])

  // Background parallax — orbs and rings move at different speeds creating depth
  const bgOrb1Y = useTransform(scrollYProgress, [0, 0.3], ['0px', '-150px'])
  const bgOrb1X = useTransform(scrollYProgress, [0, 0.3], ['0px', '80px'])
  const bgOrb2Y = useTransform(scrollYProgress, [0, 0.3], ['0px', '-80px'])
  const bgOrb2X = useTransform(scrollYProgress, [0, 0.3], ['0px', '-40px'])
  const bgRingScale = useTransform(scrollYProgress, [0, 1], [1, 0.7])
  const bgRingOpacity = useTransform(scrollYProgress, [0, 0.3, 1], [1, 1, 0])
  const bgParticleY = useTransform(scrollYProgress, [0, 1], ['0px', '-200px'])

  return (
    <div className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #0a0a1a 0%, #0f0f2a 40%, #08081a 100%)' }} />
      <FloatingShapes
        bgOrb1Y={bgOrb1Y} bgOrb1X={bgOrb1X}
        bgOrb2Y={bgOrb2Y} bgOrb2X={bgOrb2X}
        bgRingScale={bgRingScale} bgRingOpacity={bgRingOpacity}
        bgParticleY={bgParticleY}
        scrollYProgress={scrollYProgress}
      />
      <motion.div style={{ opacity: textOpacity, y: textY }}
        className="relative z-30">
        <div className="min-h-screen flex flex-col">
          <div className="flex-1 flex items-center px-6 lg:px-12 pt-24 md:pt-28 pb-24 md:pb-12">
            <div className="max-w-3xl mx-auto text-center md:text-left">

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ y: badgeY }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 mx-auto md:mx-0 bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-[#e8ff47] px-4 py-1.5 rounded-full text-xs font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                AI OS — EARLY ACCESS
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ y: headlineY, rotateX: headlineRotateX, perspective: 1000 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-[clamp(2.5rem,7vw,5rem)] font-black leading-[1.05] tracking-[-0.03em] mb-6"
              >
                <span className="text-white">The OS your business runs on.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ y: subtextY }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg md:text-xl text-[rgba(255,255,255,0.5)] mb-10 max-w-xl leading-relaxed">
                One workspace. Multiple agents. Working while you sleep.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ y: ctaY }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-12">
                <Link href="/start?plan=personal"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#e8ff47] to-[#d4eb3a] hover:opacity-90 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,212,255,0.3)] active:scale-[0.98] text-white font-semibold px-8 py-4 rounded-xl transition-all text-base">
                  Start for $49
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7-7" />
                  </svg>
                </Link>
                <Link href="#how-it-works"
                  className="inline-flex items-center gap-2 bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] active:scale-[0.98] border border-[rgba(255,255,255,0.1)] text-white font-medium px-8 py-4 rounded-xl transition-all text-base">
                  See how it works
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap gap-8 border-t border-[rgba(255,255,255,0.08)] pt-8 justify-center md:justify-start">
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
