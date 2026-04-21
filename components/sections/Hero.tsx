'use client';

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M7 8l3 3 7-7" stroke="#00D4FF" />
    </svg>
  );
}

const MESSAGES = [
  "Leads falling through the cracks?",
  "Slow follow-ups killing your conversions?",
  "Reports taking hours every week?",
  "Missed calls, missed revenue?",
  "Staff stretched too thin?",
  "Same tasks, different day?",
  "Manual work eating your margins?",
  "Scale without hiring?",
];

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const [verticalIdx, setVerticalIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setVerticalIdx((i) => (i + 1) % MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center overflow-hidden bg-[#04040c] pt-20"
    >
      {/* Layered background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(0,212,255,0.12),transparent_60%),radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(102,0,255,0.1),transparent_60%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#04040c] to-transparent" />
      </div>

      {/* Floating orbs */}
      <div className="pointer-events-none absolute left-[15%] top-[25%] h-64 w-64 rounded-full bg-[rgba(0,212,255,0.06)] blur-[80px]" />
      <div className="pointer-events-none absolute right-[10%] top-[35%] h-48 w-48 rounded-full bg-[rgba(102,0,255,0.08)] blur-[70px]" />

      <motion.div style={{ y, opacity }} className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28">
        <div className="flex flex-col items-center text-center">

          {/* Animated pain-point ticker badge */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <div className="pill-breathe group inline-flex items-center gap-2.5 rounded-full border border-[rgba(0,212,255,0.25)] bg-[rgba(0,212,255,0.06)] px-4 py-1.5 pl-5">
              <span className="relative flex h-2 w-2">
                <span className="dot-glow-pulse absolute inline-flex h-full w-full rounded-full bg-[#00D4FF] opacity-60" />
                <span className="dot-breathe relative inline-flex h-2 w-2 rounded-full bg-[#00D4FF]" />
              </span>
              <span className="font-mono text-xs font-medium tracking-wide text-[rgba(0,212,255,0.9)]">
                <span key={verticalIdx} className="inline-block">
                  {MESSAGES[verticalIdx]}
                </span>
              </span>
              <span className="text-[rgba(255,255,255,0.2)] text-xs"> — </span>
              <span className="font-mono text-xs font-medium tracking-wide text-[rgba(0,212,255,0.9)]">
                ClawOps fixes it.
              </span>
              <span className="pill-shimmer absolute inset-0 rounded-full" />
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.04em] text-white md:text-6xl lg:text-7xl"
          >
            The Agentic OS
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-[#00D4FF] to-[#6600FF] bg-clip-text text-transparent">
              {" "}For Your Business.
            </span>
            <br className="hidden md:block" />
            <span className="text-white/80">
              Built for Your Team.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-[rgba(255,255,255,0.48)] sm:text-lg md:text-xl"
          >
            Your leads don't follow themselves up. Your reports don't write themselves. Your calendar doesn't manage itself. Deploy AI agents that do all of this — and more — 24/7.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Link
              href="#pricing"
              className="group flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #00D4FF, #6600FF)",
                boxShadow: "0 0 28px rgba(0,212,255,0.25), 0 4px 24px rgba(0,0,0,0.5)",
              }}
            >
              <OsIcon />
              Deploy Your First Agent
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRightIcon />
              </span>
            </Link>
            <Link
              href="#how-it-works"
              className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-[rgba(255,255,255,0.09)] hover:border-[rgba(255,255,255,0.22)]"
            >
              See How It Works
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 grid w-full max-w-lg grid-cols-1 gap-px rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-0.5 backdrop-blur-sm sm:mt-14 sm:grid-cols-3"
          >
            {[
              { value: "5,400+", label: "Skills & Plugins", color: "#00D4FF" },
              { value: "< 30 min", label: "To Running Agents", color: "#6600FF" },
              { value: "24/7", label: "Autonomous Teams", color: "#00D4FF" },
            ].map((p) => (
              <div key={p.label} className="flex flex-col items-center bg-[rgba(4,4,12,0.6)] py-5 first:rounded-l-xl last:rounded-r-xl">
                <span
                  className="text-3xl font-bold tracking-tight text-white md:text-4xl"
                  style={{ textShadow: `0 0 20px ${p.color}40` }}
                >
                  {p.value}
                </span>
                <span className="mt-1 text-xs text-[rgba(255,255,255,0.38)]">{p.label}</span>
              </div>
            ))}
          </motion.div>

          {/* Setup time explanation */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-3 text-center font-mono text-[10px] text-[rgba(255,255,255,0.22)] max-w-sm"
          >
            Others say 1-click. We say 30 min — because your agents land with skills, plugins, and workflows already wired. Ready to work, not ready to be set up.
          </motion.p>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-14 w-full"
          >
            <p className="mb-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-[rgba(255,255,255,0.2)]">
              Works with your stack
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {["GoHighLevel", "Notion", "Slack", "Telegram", "Gmail"].map((name) => (
                <span key={name} className="font-mono text-xs font-medium tracking-wide text-[rgba(255,255,255,0.18)]">
                  {name}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 bounce-y"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </section>
  );
}
