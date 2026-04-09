'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const capabilities = [
  {
    emoji: "🖥️",
    title: "Your AI Infrastructure",
    description: "Pre-configured VPS with GPU-ready specs. 2-6 vCPUs, 4-12GB RAM, 50-200GB NVMe SSD. Yours exclusively.",
    highlight: "No shared resources. No noisy neighbors.",
  },
  {
    emoji: "🔒",
    title: "Local, Private AI",
    description: "Run Gemma 4 2B, 7B, or any open model completely on your VPS. Zero API calls to OpenAI or Anthropic. Your data never leaves.",
    highlight: "100% data sovereignty. Zero API costs.",
  },
  {
    emoji: "🤖",
    title: "Multi-Agent Ecosystem",
    description: "Deploy specialized agents — Sales, Support, Research, Ops — all running on the same VPS. Each agent handles what it does best.",
    highlight: "Unlimited agents on Business plan.",
  },
  {
    emoji: "🔌",
    title: "500+ Integrations",
    description: "Chrome browser automation, WhatsApp, Telegram, Slack, GHL, n8n, webhooks, MCP protocol. If it has an API, we connect it.",
    highlight: "Playwright + native integrations built in.",
  },
  {
    emoji: "⚡",
    title: "Zero Latency",
    description: "Your agents run on your VPS. No API queues. No rate limits. No per-token billing. Instant responses, always.",
    highlight: "<50ms response time. Guaranteed.",
  },
  {
    emoji: "🔐",
    title: "Complete Privacy",
    description: "Your client data, strategies, and workflows stay on your infrastructure. GDPR compliant. Enterprise-grade encryption.",
    highlight: "HIPAA-ready configuration available.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function Capabilities() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="capabilities"
      className="relative overflow-hidden bg-[#04040c] px-6 py-20 md:py-32"
    >
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
          background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(0,212,255,0.05), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.5)]">
            What You Get
          </p>
          <h2 className="mt-3 text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-[-0.03em] text-white md:text-5xl">
            Everything Your AI Workers Need to Work
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[rgba(255,255,255,0.5)]">
            One subscription. Full infrastructure. No per-user fees. No API bills.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {capabilities.map((cap) => (
            <motion.div
              key={cap.title}
              variants={item}
              className="group relative rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6 transition-all duration-300 hover:border-[rgba(0,212,255,0.3)] hover:bg-[rgba(255,255,255,0.04)]"
            >
              <div className="text-4xl mb-4">{cap.emoji}</div>
              <h3 className="text-lg font-semibold text-white">{cap.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[rgba(255,255,255,0.45)]">
                {cap.description}
              </p>
              <div className="mt-4 rounded-lg bg-[rgba(0,212,255,0.08)] px-3 py-1.5">
                <p className="text-xs font-medium text-[#00D4FF]">{cap.highlight}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-10"
        >
          {[
            "Pre-configured in 3 minutes",
            "No credit card to start",
            "Cancel anytime",
            "24/7 operation",
            "SSL encrypted",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#00D4FF]" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-sm text-[rgba(255,255,255,0.4)]">{item}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
