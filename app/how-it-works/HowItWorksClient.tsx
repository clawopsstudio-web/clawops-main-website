'use client';

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

const FLOW_STEPS = [
  {
    step: "01",
    label: "Subscribe",
    title: "Pick Your Plan",
    description:
      "Choose the plan that fits your workload. Starter, Pro, or Agency. You're up and running in minutes.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    color: "#00D4FF",
    detail: "Card or PayPal. Cancel anytime. No setup fee.",
    detailIcon: "💳",
  },
  {
    step: "02",
    label: "Onboarding",
    title: "Tell Us Your Workflow",
    description:
      "Fill out a 5-minute form: what tools you use, what tasks you want automated, and which worker roles you need.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <path d="M14 2v6h6"/>
        <path d="M16 13H8M16 17H8M10 9H8"/>
      </svg>
    ),
    color: "#6600FF",
    detail: "Tools • Tasks • Worker roles • Integrations",
    detailIcon: "📋",
  },
  {
    step: "03",
    label: "Provisioning",
    title: "AI Sets Up Your OS",
    description:
      "We handle the setup. You get autonomous agents running your business — configured, connected, and working.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
        <path d="M7 8l3 3-3 3M12 14h4"/>
      </svg>
    ),
    color: "#00D4FF",
    detail: "~15 minutes. Fully automated.",
    detailIcon: "⚡",
  },
  {
    step: "04",
    label: "Activate",
    title: "Workers Go Live",
    description:
      "Your AI team clocks in. Workers start handling tasks on Telegram, Discord, WhatsApp, or your browser — wherever your team already works.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <path d="M22 4L12 14.01l-3-3"/>
      </svg>
    ),
    color: "#00FF88",
    detail: "24/7. No supervision required.",
    detailIcon: "🤖",
  },
];

const TECH_DETAILS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Secure by Default",
    desc: "Hardened infrastructure, encrypted comms, role-based access, audit logs.",
    color: "#00D4FF",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    title: "48-Hour Target",
    desc: "From subscribe to live workers. Our record: 4 hours.",
    color: "#6600FF",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 20V10M12 20V4M6 20v-6"/>
      </svg>
    ),
    title: "Transparent Scaling",
    desc: "Scale your infrastructure anytime. Workers adapt automatically.",
    color: "#00FF88",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    title: "Real Human Handoff",
    desc: "Unresolved issues escalate to your team with full context.",
    color: "#00D4FF",
  },
];

function FlowArrow() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="hidden lg:block">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  );
}

export default function HowItWorksClient() {
  const headerRef = useRef<HTMLDivElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true });
  const flowInView = useInView(flowRef, { once: true, margin: "-80px" });
  const { scrollYProgress } = useScroll({ target: flowRef, offset: ["start end", "end start"] });
  const arrowY = useTransform(scrollYProgress, [0, 1], [0, -20]);

  return (
    <main className="min-h-screen bg-[#04040c] overflow-x-hidden">
      {/* Hero */}
      <div ref={headerRef} className="relative overflow-hidden px-6 pt-32 pb-20 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,212,255,0.08),transparent_60%)]" />
          <div className="absolute inset-0 grid-bg opacity-30" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mx-auto max-w-4xl"
        >
          <p className="pre-label mb-4">HOW IT WORKS</p>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.04em] text-white md:text-5xl lg:text-6xl">
            From Zero to AI Team
            <br />
            <span className="bg-gradient-to-r from-[#00D4FF] to-[#6600FF] bg-clip-text text-transparent">
              in 48 Hours
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-[rgba(255,255,255,0.5)] sm:text-lg">
            No code. No integrations to build. No prompts to write. We handle
            the heavy lifting — you get a fully operational AI team.
          </p>

          {/* Timer badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.06)] px-5 py-2.5"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <span className="text-sm text-white/70">Target deployment:</span>
            <span className="text-sm font-bold text-white">48 hours</span>
            <span className="text-xs text-[rgba(255,255,255,0.3)]">(fastest: 4 hours)</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Visual flow */}
      <div ref={flowRef} className="relative px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-4">
            {FLOW_STEPS.map((step, i) => {
              const isEven = i % 2 === 0;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 40, x: isEven ? -20 : 20 }}
                  animate={flowInView ? { opacity: 1, y: 0, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <div
                    className="group relative rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 transition-all duration-300 hover:border-[rgba(0,212,255,0.2)] hover:bg-[rgba(255,255,255,0.05)]"
                  >
                    {/* Step number background */}
                    <div
                      className="absolute right-4 top-4 text-[64px] font-bold leading-none opacity-[0.06] select-none"
                      style={{ color: step.color }}
                    >
                      {step.step}
                    </div>

                    {/* Icon */}
                    <div
                      className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                      style={{
                        background: `${step.color}15`,
                        border: `1px solid ${step.color}30`,
                        color: step.color,
                      }}
                    >
                      {step.icon}
                    </div>

                    {/* Label */}
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full" style={{ background: step.color, boxShadow: `0 0 8px ${step.color}` }} />
                      <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: step.color }}>
                        {step.label}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[rgba(255,255,255,0.45)]">
                      {step.description}
                    </p>

                    {/* Detail pill */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm">{step.detailIcon}</span>
                      <span className="rounded-md border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-2.5 py-1 font-mono text-[11px] text-[rgba(255,255,255,0.4)]">
                        {step.detail}
                      </span>
                    </div>

                    {/* Glow */}
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                      style={{
                        background: `radial-gradient(circle at 50% 100%, ${step.color}08, transparent 60%)`,
                      }}
                    />
                  </div>

                  {/* Connector arrow */}
                  {i < FLOW_STEPS.length - 1 && (
                    <motion.div
                      style={{ y: arrowY }}
                      className="absolute -right-6 top-1/2 z-10 hidden -translate-y-1/2 lg:flex items-center"
                    >
                      <FlowArrow />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tech trust section */}
      <div className="relative border-t border-[rgba(255,255,255,0.06)] px-6 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(102,0,255,0.05),transparent_60%)]" />
        <div className="relative z-10 mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <p className="pre-label mb-3">THE INFRASTRUCTURE</p>
            <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-[-0.03em] text-white">
              Built on Battle-Tested Stack
            </h2>
          </motion.div>

          {/* Tech stack pills */}
          <div className="mb-12 flex flex-wrap justify-center gap-3">
            {[
              { name: "Gmail", color: "#00D4FF" },
              { name: "Notion", color: "#6600FF" },
              { name: "Slack", color: "#00FF88" },
              { name: "HubSpot", color: "#FF6B35" },
              { name: "Go High Level", color: "#FF6B35" },
              { name: "Telegram", color: "#00D4FF" },
              { name: "WhatsApp", color: "#6600FF" },
              { name: "Google Workspace", color: "#00FF88" },
              { name: "Airtable", color: "#FF6B35" },
            ].map((tech) => (
              <motion.span
                key={tech.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="rounded-full border px-4 py-1.5 font-mono text-xs"
                style={{
                  borderColor: `${tech.color}30`,
                  color: tech.color,
                  background: `${tech.color}08`,
                }}
              >
                {tech.name}
              </motion.span>
            ))}
          </div>

          {/* Trust grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {TECH_DETAILS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex items-start gap-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-4"
                style={{ borderColor: `${item.color}20` }}
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${item.color}12`, color: item.color }}
                >
                  {item.icon}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <p className="mt-0.5 text-xs text-[rgba(255,255,255,0.4)]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline detail */}
      <div className="relative border-t border-[rgba(255,255,255,0.06)] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <p className="pre-label mb-3">DETAILED TIMELINE</p>
            <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-[-0.03em] text-white">
              What Happens After You Subscribe
            </h2>
          </motion.div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-[rgba(0,212,255,0.4)] via-[rgba(102,0,255,0.3)] to-transparent" />

            {[
              { time: "0 min", title: "Subscription confirmed", desc: "Payment clears. You receive an onboarding form link via email.", color: "#00D4FF" },
              { time: "15 min", title: "Onboarding complete", desc: "You submit the form with your tools, tasks, and preferences.", color: "#00D4FF" },
              { time: "30 min", title: "Provisioning starts", desc: "Our system provisions your VPS and configures the gateway.", color: "#6600FF" },
              { time: "2 hrs", title: "Workers configured", desc: "AI workers are set up with your custom instructions, skills, and integrations.", color: "#6600FF" },
              { time: "4–48 hrs", title: "Testing & activation", desc: "We run validation tests, verify integrations, and hand off to you.", color: "#00FF88" },
              { time: "48 hrs", title: "AI team is live", desc: "Your workers are operational 24/7. You monitor results, they handle the work.", color: "#00FF88" },
            ].map((item, i) => (
              <motion.div
                key={item.time}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative mb-6 flex gap-5"
              >
                {/* Dot */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2"
                    style={{
                      borderColor: item.color,
                      background: `${item.color}15`,
                      boxShadow: `0 0 12px ${item.color}30`,
                    }}
                  >
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-4 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-semibold" style={{ color: item.color }}>
                      {item.time}
                    </span>
                    <h4 className="text-base font-semibold text-white">{item.title}</h4>
                  </div>
                  <p className="mt-1 text-sm text-[rgba(255,255,255,0.4)]">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
