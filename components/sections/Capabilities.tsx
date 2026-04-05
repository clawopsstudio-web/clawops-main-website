"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

function BrainIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M12 4C8 4 5 7 5 11c0 2 .9 3.8 2.4 5.1L7 18h10l-.4-1.9C18.1 14.8 19 13 19 11c0-4-3-7-7-7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 12h6M12 9v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

function BrowserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="7" cy="6.5" r="0.75" fill="currentColor"/>
      <circle cx="10" cy="6.5" r="0.75" fill="currentColor"/>
      <circle cx="13" cy="6.5" r="0.75" fill="currentColor"/>
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function BlocksIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <rect x="2" y="7" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="15" y="7" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="2" y="16" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M15 13.5h5M17.5 16v-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

const capabilities = [
  {
    icon: BrainIcon,
    label: "Skills Stack",
    title: "Preconfigured, Not Prompted",
    description: "Each worker ships with battle-tested skills — research, content, outreach, support, ops — ready on day one. No prompt engineering required.",
    accent: "#00D4FF",
  },
  {
    icon: BrowserIcon,
    label: "Virtual Chrome",
    title: "Browser Automation",
    description: "Workers browse in a real browser with full session context. Scrape, interact, and extract from any site — even ones without APIs.",
    accent: "#6600FF",
  },
  {
    icon: ZapIcon,
    label: "Integration Paths",
    title: "API · Webhook · MCP · Browser",
    description: "Connect everything: direct API calls, authenticated browser sessions, webhook triggers, and native MCP protocol. Pick what fits your stack.",
    accent: "#00D4FF",
  },
  {
    icon: ChatIcon,
    label: "Messaging Native",
    title: "Works in Your Chat Apps",
    description: "Deploy workers on Telegram, WhatsApp, Discord, or Slack. Your team talks to the automation like a colleague — no dashboards to learn.",
    accent: "#6600FF",
  },
  {
    icon: CloudIcon,
    label: "Content Autopilot",
    title: "Always-On Research",
    description: "Workers monitor your data sources, surface changes, and push summaries to your team automatically. NotebookLM-style intelligence, deployed.",
    accent: "#00D4FF",
  },
  {
    icon: BlocksIcon,
    label: "AI Teams",
    title: "Workers That Coordinate",
    description: "Specialized AI workers assigned to research, drafting, review, and delivery — collaborating as a real team. No bottleneck at a single chatbot.",
    accent: "#6600FF",
  },
];

export default function Capabilities() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section
      ref={ref}
      id="capabilities"
      className="relative overflow-hidden bg-[#04040c] px-4 py-16 md:py-20"
    >
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(102,0,255,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.45)]">
            WHAT YOU GET
          </p>
          <h2 className="mt-3 text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-[-0.03em] text-white md:text-5xl">
            Prebuilt Workers, Not a Chatbot
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-[rgba(255,255,255,0.5)] sm:mt-5 sm:text-base">
            Not a chatbot you have to prompt. A worker with skills, integrations, and
            automation primitives — deployed and running in days.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.label}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.65, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                className="group relative rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] p-6 transition-all duration-500 hover:-translate-y-1"
                style={{ "--cap-accent": cap.accent } as React.CSSProperties}
              >
                {/* Top accent line */}
                <div className="absolute inset-x-6 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background: `linear-gradient(90deg, transparent, ${cap.accent}60, transparent)`}} />

                {/* Label badge */}
                <div className="mb-5 flex items-center gap-2">
                  <div
                    className="flex h-6 w-6 items-center justify-center rounded-md text-white"
                    style={{ background: `${cap.accent}18` }}
                  >
                    <Icon />
                  </div>
                  <span
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: cap.accent }}
                  >
                    {cap.label}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white">{cap.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[rgba(255,255,255,0.48)]">
                  {cap.description}
                </p>

                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${cap.accent}0c 0%, transparent 70%)`,
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
