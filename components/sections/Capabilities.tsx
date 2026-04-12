'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const capabilities = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2"/>
        <rect x="2" y="14" width="20" height="8" rx="2"/>
        <line x1="6" y1="6" x2="6.01" y2="6"/>
        <line x1="6" y1="18" x2="6.01" y2="18"/>
      </svg>
    ),
    label: "HARDWARE",
    title: "Managed Infrastructure",
    description: "Your agents run on optimized infrastructure — no cloud rental markup, no per-call API fees. We handle the setup, you own the workforce.",
    highlight: "Predictable cost. Unlimited agent hours.",
    color: "#00D4FF",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6600FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    label: "KERNEL",
    title: "Local Models",
    description: "Gemma 4 2B, Qwen, DeepSeek — running on managed infrastructure. No data leaves your server. No per-call API bills.",
    highlight: "Private by architecture. Zero per-call costs.",
    color: "#6600FF",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
        <path d="M10 6.5h4M6.5 10v4M17.5 10v4M10 17.5h4"/>
      </svg>
    ),
    label: "PROCESSES",
    title: "Multi-Agent Runtime",
    description: "Run unlimited agents simultaneously. Sales, Support, Research, Ops — each as an independent process. They share context and collaborate.",
    highlight: "5,400+ skills. One runtime.",
    color: "#00D4FF",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6600FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    label: "APP STORE",
    title: "5,400+ Skills & Plugins",
    description: "Skills and plugins for GHL, n8n, Google Workspace, and 500+ other tools. Install an agent skill in one click — like an app store for your AI workforce.",
    highlight: "Skills for every vertical. One-click install.",
    color: "#6600FF",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    label: "EXECUTION",
    title: "Edge Execution",
    description: "Agents run on managed infrastructure, close to your data. No round-trip to cloud APIs. Real-time automation with zero latency.",
    highlight: "Local execution. Zero network latency.",
    color: "#00D4FF",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6600FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    label: "FIREWALL",
    title: "Data Sovereignty",
    description: "Your client data, your prompts, your business intelligence — all stays on managed infrastructure. Not training data for someone else's model. Not subject to their API outages.",
    highlight: "Your data. Your server. Your control.",
    color: "#6600FF",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

const trustItems = [
  "Runs on optimized infrastructure",
  "Local AI models — zero per-call fees",
  "5,400+ skills ready to install",
  "One-time infrastructure cost",
  "Your data never leaves your server",
];

export default function Capabilities() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="capabilities" className="relative bg-[#04040c] px-6 py-16 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,212,255,0.04), transparent 70%)",
      }} />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-14"
        >
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.4)]">
            The Architecture
          </p>
          <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.03em] text-white md:text-5xl">
            The Operating System<br className="hidden md:block" /> for Your AI Stack.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-[rgba(255,255,255,0.45)] leading-relaxed">
            Hardware. Kernel. Processes. App Store. Firewall. Everything your AI stack needs — running on managed infrastructure you control.
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
              className="group rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-5 md:p-6 transition-all duration-300 hover:bg-[rgba(255,255,255,0.04)] hover:-translate-y-1"
              style={{ borderLeftColor: cap.color, borderLeftWidth: '2px' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {cap.icon}
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(255,255,255,0.2)]">
                    {cap.label}
                  </span>
                </div>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-white mb-2">{cap.title}</h3>
              <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.45)]">{cap.description}</p>
              <div className="mt-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] px-3 py-2">
                <p className="text-xs font-medium" style={{ color: cap.color }}>{cap.highlight}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

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
