'use client';

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const useCases = [
  {
    title: "Autonomous Sales",
    description: "Your Sales Agent doesn't wait for you. It proactively reaches out to new leads, follows up on stale deals, enriches CRM data, and schedules calls — autonomously. You wake up to a pipeline that's been growing while you slept.",
    badge: "SALES",
    badgeColor: "#e8ff47",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    metrics: "340 leads enriched / week — autonomously",
    color: "#e8ff47",
  },
  {
    title: "24/7 Support Automation",
    description: "Your Support Agent handles tickets around the clock — on WhatsApp, Telegram, or Slack. It answers FAQs, routes complex issues, and escalates only what truly needs human judgment. Your response time goes from hours to seconds.",
    badge: "SUPPORT",
    badgeColor: "#e8ff47",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    metrics: "80% tickets resolved without human input",
    color: "#e8ff47",
  },
  {
    title: "Market Research on Autopilot",
    description: "Your Research Agent monitors competitors, tracks pricing changes, scrapes market data, and alerts you to opportunities — every day, automatically. Intelligence flows to you before your competitors know what's happening.",
    badge: "RESEARCH",
    badgeColor: "#e8ff47",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6" />
        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    metrics: "Daily intelligence delivered before 8 AM",
    color: "#e8ff47",
  },
  {
    title: "Operations That Run Themselves",
    description: "Your Ops Agent pulls data every morning, builds reports, monitors your tools, and flags anomalies — without you asking. You arrive at work with a full brief. The data work is already done.",
    badge: "OPS",
    badgeColor: "#e8ff47",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
    metrics: "Daily reports delivered — zero manual work",
    color: "#e8ff47",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function UseCases() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id="use-cases" className="relative bg-[#0a0a0a] px-6 py-16 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{
        background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(102,0,255,0.05), transparent 60%)",
      }} />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }} className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.5)]">
            Autonomous Use Cases
          </p>
          <h2 className="mt-3 text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-[-0.03em] text-white md:text-5xl">
            Scale Every Department.<br className="hidden md:block" /> Without Hiring a Single Person.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[rgba(255,255,255,0.5)]">
            Every agent runs autonomously — executing tasks, following schedules, and reporting back. Your business grows. Headcount doesn't.
          </p>
        </motion.div>

        <motion.div variants={container} initial="hidden" animate={isInView ? "show" : "hidden"}
          className="mt-12 grid gap-4 md:grid-cols-2">
          {useCases.map((uc) => (
            <motion.div key={uc.title} variants={item}
              className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6 transition-all duration-300 hover:border-[rgba(255,255,255,0.15)]">
              <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${uc.color}, transparent)` }} />
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: `${uc.color}15`, color: uc.color }}>{uc.badge}</span>
                  <h3 className="mt-3 text-xl font-semibold text-white">{uc.title}</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `${uc.color}10`, color: uc.color }}>{uc.icon}</div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">{uc.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-[#10b981]" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-xs font-medium text-[#10b981]">{uc.metrics}</span>
                </div>
                <a href="/auth/signup" className="text-xs font-medium text-[rgba(255,255,255,0.3)] hover:text-white hover:bg-white/5 px-2 py-1 rounded transition-all">
                  Activate &rarr;
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
