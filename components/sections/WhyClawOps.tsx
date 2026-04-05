"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#00D4FF]" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[rgba(255,255,255,0.25)]" aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

const comparisons = [
  { dimension: "Setup time", diy: "Weeks to months", clawops: "Under 48 hours" },
  { dimension: "Prompt engineering", diy: "Ongoing, every task", clawops: "Zero — preconfigured" },
  { dimension: "Integration work", diy: "You figure it out", clawops: "We handle it" },
  { dimension: "Maintenance", diy: "Your responsibility", clawops: "Included ongoing" },
  { dimension: "Multi-tool workflows", diy: "Complex, fragile", clawops: "Built-in orchestration" },
  { dimension: "Messaging-native", diy: "DIY with webhooks", clawops: "Native to Telegram, WhatsApp, etc." },
  { dimension: "Multi-agent coordination", diy: "Build from scratch", clawops: "Agent swarms included" },
  { dimension: "Support", diy: "Community forums", clawops: "Direct access to the team" },
];

const differentiators = [
  {
    title: "Preconfigured, Not Blank Slate",
    description: "You shouldn't have to teach your AI worker how to do its job. ClawOps ships with skills and workflows already built for real business tasks.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "#00D4FF",
  },
  {
    title: "Works Where Your Team Works",
    description: "Workers live in Telegram, WhatsApp, Slack, and Discord — the apps your team already uses. Not another dashboard to check.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "#6600FF",
  },
  {
    title: "Authenticated Browser Sessions",
    description: "Workers run in a real browser, logged into your apps, with full session context. If a human can do it in a browser, a worker can too.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2"/>
        <path d="M3 9h18"/>
      </svg>
    ),
    color: "#00D4FF",
  },
  {
    title: "Built for Operations, Not Chat",
    description: "This isn't a chatbot you prompt. It's an automation layer that handles real workflows — research pipelines, support queues, content operations — 24/7.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6" aria-hidden="true">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: "#6600FF",
  },
];

export default function WhyClawOps() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="why-clawops"
      className="relative overflow-hidden bg-[#04040c] px-4 py-24 md:py-24"
    >
      {/* Top gradient divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(102,0,255,0.3), transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,212,255,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.45)]">
            WHY CLAWOPS
          </p>
          <h2 className="mt-3 text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-[-0.03em] text-white md:text-5xl">
            Why Not Just Build It Yourself?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-[rgba(255,255,255,0.5)]">
            You could cobble together agents, APIs, and automation tools. Or you could
            deploy workers that are already configured and running in your apps today.
          </p>
        </motion.div>

        {/* Comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)]"
        >
          {/* Header */}
          <div className="grid grid-cols-3 border-b border-[rgba(255,255,255,0.06)]">
            <div className="bg-[rgba(255,255,255,0.02)] px-6 py-4">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[rgba(255,255,255,0.35)]">
                Dimension
              </span>
            </div>
            <div className="border-x border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-6 py-4 text-center">
              <span className="font-mono text-[11px] uppercase tracking-widest text-[rgba(255,255,255,0.35)]">
                DIY AI Setup
              </span>
            </div>
            <div className="bg-[rgba(0,212,255,0.04)] px-6 py-4 text-center">
              <span className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "#00D4FF" }}>
                ClawOps
              </span>
            </div>
          </div>

          {/* Rows */}
          {comparisons.map((row, i) => (
            <div
              key={row.dimension}
              className={`grid grid-cols-3 ${i < comparisons.length - 1 ? "border-b border-[rgba(255,255,255,0.05)]" : ""}`}
            >
              <div className="px-6 py-4">
                <span className="text-sm text-white/70">{row.dimension}</span>
              </div>
              <div className="flex items-center justify-center gap-2 border-x border-[rgba(255,255,255,0.06)] px-6 py-4">
                <CrossIcon />
                <span className="text-sm text-[rgba(255,255,255,0.35)]">{row.diy}</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-6 py-4">
                <CheckIcon />
                <span className="text-sm text-white/80">{row.clawops}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Differentiators */}
        <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6">
          {differentiators.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.55, delay: 0.15 + 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
              className="group flex gap-5 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] p-6 transition-all duration-300 hover:-translate-y-0.5"
            >
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${item.color}15`, color: item.color }}
              >
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
