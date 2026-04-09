'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const capabilities = [
  {
    emoji: "🤖",
    title: "Deploy Unlimited Agents",
    description: "Run Sales, Support, Research, and Ops agents simultaneously. Each is independent. They share memory. They share context. One flat monthly fee covers them all.",
    highlight: "Unlimited agents. One price.",
    color: "#00D4FF",
  },
  {
    emoji: "💰",
    title: "No API Bills. Ever.",
    description: "Your queries run on your own infrastructure. No per-token billing. No token costs. No surprise invoices at the end of the month.",
    highlight: "Flat pricing. No token math.",
    color: "#6600FF",
  },
  {
    emoji: "🔌",
    title: "500+ Integrations Ready",
    description: "Telegram, WhatsApp, Chrome, Slack, GHL, HubSpot, Notion, n8n, and 495 more. Pre-built connectors, OAuth handled, live in minutes.",
    highlight: "Most integrations live in under 5 minutes.",
    color: "#00D4FF",
  },
  {
    emoji: "⚡",
    title: "Instant Response Times",
    description: "Every request processed on your own infrastructure. No API queues. No rate limits. Agents respond in under 50ms, every single time.",
    highlight: "50ms response. Every request.",
    color: "#6600FF",
  },
  {
    emoji: "🔒",
    title: "Complete Data Privacy",
    description: "Client data never touches a third-party API. Your prompts, your data, your responses — all on your own infrastructure. GDPR compliant by design.",
    highlight: "Your data never leaves your server.",
    color: "#00D4FF",
  },
  {
    emoji: "🌐",
    title: "Works 24/7 — Auto-Retries",
    description: "Agents recover from failures automatically. If a task fails, it retries. If a tool goes down, it adapts. No ops team required to babysit.",
    highlight: "Self-healing. Self-recovering.",
    color: "#6600FF",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.09 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const trustItems = [
  "Pre-configured in 3 minutes",
  "No credit card to start",
  "Cancel anytime",
  "Runs 24/7",
  "SSL encrypted",
];

export default function Capabilities() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="capabilities"
      className="relative bg-[#04040c] px-6 py-16 md:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,212,255,0.04), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-14"
        >
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.4)]">
            What You Get
          </p>
          <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.03em] text-white md:text-5xl">
            Everything Your AI Workforce Needs.<br className="hidden md:block" /> Nothing You Don&apos;t.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-[rgba(255,255,255,0.45)] leading-relaxed">
            ClawOps gives you a complete AI agent platform — deploy, connect, monitor, scale. One platform. One price. Every tool your agents need.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {capabilities.map((cap) => (
            <motion.div
              key={cap.title}
              variants={item}
              className="group rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-5 md:p-6 transition-all duration-300 hover:bg-[rgba(255,255,255,0.04)]"
              style={{ borderLeftColor: cap.color, borderLeftWidth: '2px' }}
            >
              <div className="text-3xl mb-3">{cap.emoji}</div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">{cap.title}</h3>
              <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.45)]">
                {cap.description}
              </p>
              <div className="mt-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] px-3 py-2">
                <p className="text-xs font-medium" style={{ color: cap.color }}>{cap.highlight}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-5 md:gap-8"
        >
          {trustItems.map((item) => (
            <div key={item} className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#00D4FF]" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs md:text-sm text-[rgba(255,255,255,0.35)]">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
