'use client';

import { useId, useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Install Your OS",
    description: "Point ClawOps at your infrastructure. Our installer handles the rest — kernel, models, agent runtime, and 5,400+ skills & plugins. Your AI OS boots in 30 minutes — pre-configured, not blank.",
    detail: "Powered by ClawOps's multi-agent runtime",
    color: "#00D4FF",
  },
  {
    number: "02",
    title: "Connect Your Apps",
    description: "Connect Gmail, Notion, Slack, and 500+ apps — like installing apps on a new phone. Each integration unlocks new agent capabilities. No API glue needed.",
    detail: "Gmail, Notion, Slack, HubSpot — like an app store",
    color: "#6600FF",
  },
  {
    number: "03",
    title: "Boot Your Agent Team",
    description: "Pick your vertical. Install the skills & plugins. Your agents wake up and start running — following up with leads, resolving tickets, building reports. On their own. 24/7.",
    detail: "Autonomous 24/7 operation — you only step in when needed",
    color: "#00D4FF",
  },
];

function DesktopConnector({ isInView }: { isInView: boolean }) {
  const pathId = useId();
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-[4.5rem] hidden px-8 lg:block xl:px-12">
      <svg viewBox="0 0 1200 120" className="h-[120px] w-full" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={pathId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#00D4FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6600FF" stopOpacity="0.75" />
          </linearGradient>
        </defs>
        <motion.path d="M84 60 C 220 60, 200 60, 336 60 S 520 60, 656 60 S 840 60, 976 60 S 1040 60, 1116 60"
          fill="none" stroke={`url(#${pathId})`} strokeWidth="2" strokeLinecap="round" strokeDasharray="8 10"
          initial={{ pathLength: 0, opacity: 0 }} animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.4, ease: "easeInOut", delay: 0.15 }} />
      </svg>
    </div>
  );
}

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="how-it-works" className="relative bg-[#04040c] px-6 py-16 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(102,0,255,0.08), transparent 70%)",
      }} />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }} className="text-center mb-12 md:mb-16">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.4)]">
            BOOT SEQUENCE
          </p>
          <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.03em] text-white md:text-5xl">
            From Signup to Running AI Team<br className="hidden md:block" /> in Under 30 Minutes
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-[rgba(255,255,255,0.45)] leading-relaxed">
            No DevOps. No configuration. No terminal. Your agents arrive pre-configured with skills and plugins — ready to work, not ready to be set up.
          </p>
        </motion.div>

        <DesktopConnector isInView={isInView} />

        <div className="relative mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <motion.div key={step.number}
              initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, delay: 0.2 * (index + 1), ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-2 bg-[#04040c]"
                style={{ borderColor: step.color, boxShadow: `0 0 24px ${step.color}33` }}>
                <span className="font-mono text-base font-bold" style={{ color: step.color }}>{step.number}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="absolute top-7 left-1/2 h-8 w-px bg-gradient-to-b from-[rgba(255,255,255,0.15)] to-transparent md:hidden" />
              )}
              <div className="mt-5 w-full rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-6 text-left">
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.45)]">{step.description}</p>
                <div className="mt-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] px-3 py-2">
                  <p className="text-xs font-medium" style={{ color: step.color }}>{step.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={isInView ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mx-auto mt-12 max-w-sm rounded-2xl border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.03)] p-6 text-center">
          <div className="text-3xl font-bold text-white">&lt; 30 minutes</div>
          <p className="mt-2 text-sm text-[rgba(255,255,255,0.45)]">
            From signup to your AI agent team up and running
          </p>
        </motion.div>
      </div>
    </section>
  );
}
