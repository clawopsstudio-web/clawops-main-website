"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import CinematicBackground from "@/components/ui/CinematicBackground";

/* ─── Story phases ─────────────────────────────────────────────────────── */
const PHASES = [
  {
    id: "message",
    badge: "The request arrives",
    headline: "Every task your team handles —",
    headlineAccent: "automated.",
    subtext:
      "From customer queries to data entry, your AI workforce handles the operational load. You focus on growth; they handle the grind.",
    agentIndex: 0,
    accent: "#00D4FF",
  },
  {
    id: "delegate",
    badge: "Your AI team mobilizes",
    headline: "The right agent.",
    headlineAccent: "Every time.",
    subtext:
      "No prompt engineering. No manual routing. Your AI team reads the context, picks the right specialist, and gets to work instantly.",
    agentIndex: 1,
    accent: "#6600FF",
  },
  {
    id: "action",
    badge: "They're already working",
    headline: "Parallel execution.",
    headlineAccent: "Zero lag.",
    subtext:
      "Research, draft, send, update — multiple agents working simultaneously. What took your team hours happens in minutes.",
    agentIndex: 2,
    accent: "#00FF88",
  },
  {
    id: "result",
    badge: "Done. Delivered. Moving on.",
    headline: "Your operations run",
    headlineAccent: "themselves.",
    subtext:
      "Every task completed, logged, and delivered. Your AI team closes the loop while you focus on what only humans can do.",
    agentIndex: 3,
    accent: "#FF9500",
  },
] as const;

const TEAM_MEMBERS = [
  {
    role: "Research",
    label: "Scouts the web & data sources",
    status: "active" as const,
    accent: "#00D4FF",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    role: "Content",
    label: "Drafts, edits & formats output",
    status: "active" as const,
    accent: "#6600FF",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    role: "Ops",
    label: "Sends messages & updates records",
    status: "active" as const,
    accent: "#00FF88",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    role: "Review",
    label: "Checks quality before delivery",
    status: "standby" as const,
    accent: "#FF9500",
    icon: (
      <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M8 3l1.5 3 3.5.5-2.5 2.4.6 3.6L8 11l-3.1 1.5.6-3.6L3 6.5 6.5 6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* ─── Icons ─────────────────────────────────────────────────────────────── */
function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Hero ─────────────────────────────────────────────────────────────── */
export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  /* Sync phase index with scroll position */
  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      if (v < 0.28) setPhaseIndex(0);
      else if (v < 0.5) setPhaseIndex(1);
      else if (v < 0.72) setPhaseIndex(2);
      else setPhaseIndex(3);
    });
  }, [scrollYProgress]);

  const phase = PHASES[phaseIndex];

  /* Scroll-driven transforms */
  const contentOpacity = useTransform(scrollYProgress, [0, 0.62], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.62], [0, -32]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.3]);
  const metricsOpacity = useTransform(scrollYProgress, [0, 0.28], [1, 0]);
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen items-center overflow-hidden bg-[#04040c] pt-20"
    >
      {/* ─── Layer 1: Cinematic background ──────────────────────────── */}
      <motion.div style={{ opacity: bgOpacity }} className="absolute inset-0">
        <CinematicBackground phase={phaseIndex} scrollProgress={scrollYProgress} />
      </motion.div>

      {/* ─── Layer 2: Scroll progress bar ───────────────────────────── */}
      <motion.div
        className="absolute left-0 top-0 z-20"
        style={{ width: progressWidth }}
      >
        <div
          className="h-px w-full"
          style={{
            background: "linear-gradient(90deg, #00D4FF, #6600FF)",
            boxShadow: "0 0 8px rgba(0,212,255,0.5)",
          }}
        />
      </motion.div>

      {/* ─── Content ─────────────────────────────────────────────────── */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 mx-auto w-full max-w-6xl px-6 pb-28"
      >
        <div className="flex flex-col items-center text-center">

          {/* ── Minimal command strip — premium micro-motion pill ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 sm:mb-10"
          >
            {/* Clean pill: live dot + badge text + progress dots */}
            <div className="pill-shimmer pill-breathe inline-flex items-center gap-2.5 rounded-full border border-[rgba(255,255,255,0.09)] bg-[rgba(0,0,0,0.65)] px-4 py-2.5 backdrop-blur-xl sm:px-5">
              {/* Live indicator dot with ambient glow pulse */}
              <span className="relative flex h-2 w-2 flex-shrink-0">
                {/* Soft ambient glow halo */}
                <span
                  className="dot-glow-pulse absolute inset-0 rounded-full"
                  style={{ backgroundColor: phase.accent, transform: "scale(1.5)" }}
                />
                {/* Ripple ping */}
                <span
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundColor: phase.accent,
                    animation: `ping 2.2s cubic-bezier(0, 0, 0.25, 1) infinite`,
                  }}
                />
                {/* Solid core */}
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: phase.accent,
                    boxShadow: `0 0 8px ${phase.accent}, 0 0 16px ${phase.accent}60`,
                  }}
                />
              </span>

              {/* Phase badge */}
              <span
                className="font-mono text-[11px] font-medium tracking-wide sm:text-sm"
                style={{ color: phase.accent }}
              >
                {phase.badge}
              </span>

              {/* Thin separator */}
              <span className="hidden h-4 w-px bg-[rgba(255,255,255,0.12)] sm:block" />

              {/* Progress dots */}
              <div className="hidden items-center gap-1.5 sm:flex">
                {PHASES.map((p, i) => (
                  <span
                    key={p.id}
                    className={`block h-1 rounded-full transition-all duration-500 ${
                      i === phaseIndex ? "dot-breathe" : ""
                    }`}
                    style={{
                      width: i === phaseIndex ? 18 : 6,
                      backgroundColor: i <= phaseIndex ? p.accent : "rgba(255,255,255,0.18)",
                      boxShadow: i === phaseIndex ? `0 0 8px ${p.accent}` : "none",
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Phase headline — transitions between story beats */}
          <motion.h1
            key={phaseIndex}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl text-[2.5rem] font-bold leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl md:text-7xl lg:text-8xl"
          >
            {phase.headline}{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${phase.accent} 0%, #6600FF 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {phase.headlineAccent}
            </span>
            <br className="hidden md:block" />
          </motion.h1>

          {/* Phase subtext */}
          <motion.p
            key={`sub-${phaseIndex}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-2xl text-base leading-relaxed text-[rgba(255,255,255,0.48)] sm:mt-6 sm:text-lg md:text-xl"
          >
            {phase.subtext}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <a
              href="#cta"
              className="group flex items-center gap-2 rounded-xl px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(135deg, #00D4FF, #6600FF)",
                boxShadow: "0 0 20px rgba(0,212,255,0.18), 0 4px 24px rgba(0,0,0,0.4)",
              }}
            >
              Deploy Your AI Team
              <span className="transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRightIcon />
              </span>
            </a>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] px-7 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-[rgba(255,255,255,0.09)] hover:border-[rgba(255,255,255,0.22)]"
            >
              See How It Works
            </a>
          </motion.div>

          {/* AI Team cards — phase-aware glow highlight */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 sm:mt-12"
          >
            <p className="mb-4 text-center font-mono text-[10px] uppercase tracking-widest text-[rgba(255,255,255,0.18)]">
              Your AI team — standing by
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {TEAM_MEMBERS.map((member, i) => {
                const isFocused = i === phase.agentIndex;
                return (
                  <motion.div
                    key={member.role}
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative flex items-center gap-2.5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-2.5 backdrop-blur-sm transition-all duration-500"
                    style={
                      isFocused
                        ? {
                            borderColor: `${member.accent}50`,
                            background: `${member.accent}08`,
                            boxShadow: `0 0 16px ${member.accent}18, inset 0 0 8px ${member.accent}0a`,
                          }
                        : {}
                    }
                  >
                    {/* Icon */}
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg transition-colors duration-500"
                      style={{
                        background: isFocused ? `${member.accent}22` : `${member.accent}14`,
                        color: member.accent,
                      }}
                    >
                      {member.icon}
                    </div>

                    {/* Text */}
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-xs font-semibold transition-colors duration-500"
                          style={{ color: isFocused ? member.accent : "white" }}
                        >
                          {member.role}
                        </span>
                        <span
                          className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{
                            background: member.status === "active" ? "#00FF88" : "#FF9500",
                            boxShadow: member.status === "active" ? "0 0 5px #00FF88" : "0 0 5px #FF9500",
                          }}
                        />
                      </div>
                      <p className="mt-0.5 text-[10px] leading-tight text-[rgba(255,255,255,0.35)] transition-colors duration-500">
                        {member.label}
                      </p>
                    </div>

                    {/* Focused pulse ring */}
                    {isFocused && (
                      <motion.span
                        layoutId={`glow-${member.role}`}
                        className="pointer-events-none absolute inset-0 rounded-xl"
                        style={{
                          boxShadow: `0 0 0 1px ${member.accent}30`,
                        }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Metrics — fade on scroll */}
          <motion.div
            style={{ opacity: metricsOpacity }}
            className="mt-8 grid w-full max-w-lg grid-cols-1 gap-3 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-4 backdrop-blur-sm sm:mt-10 sm:grid-cols-3 sm:gap-px sm:p-0"
          >
            {[
              { value: "24/7", label: "Always Running" },
              { value: "< 2 days", label: "Deploy Time" },
              { value: "99.9%", label: "Uptime SLA" },
            ].map((p) => (
              <div key={p.label} className="flex flex-col items-center py-4 sm:py-5">
                <span className="text-2xl font-bold text-white md:text-3xl">{p.value}</span>
                <span className="mt-1 text-xs text-[rgba(255,255,255,0.38)]">{p.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Scroll hint ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(255,255,255,0.15)]">
            Scroll to explore
          </span>
          <svg viewBox="0 0 16 24" fill="none" className="h-4 w-3 text-[rgba(255,255,255,0.12)]">
            <path d="M8 4v16M3 15l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
