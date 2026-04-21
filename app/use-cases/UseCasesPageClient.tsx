'use client';

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const PERSONAS = [
  {
    id: "solopreneur",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: "Solopreneur",
    subtitle: "1-person business",
    description: "You wear every hat. Support, sales, ops, content — all you. We give you an AI team that handles the repeatable work so you can focus on the work only you can do.",
    workers: ["Support Worker", "Research Worker", "Content Worker"],
    color: "#e8ff47",
    metrics: ["Save 20+ hrs/week", "Handle 10x more inquiries", "Never miss a lead"],
    quote: "\"I went from drowning in tickets to having a team that handles everything while I sleep.\"",
  },
  {
    id: "agency",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Agency",
    subtitle: "Marketing & service agencies",
    description: "Scale your delivery without scaling headcount. Deploy AI workers that handle client research, content creation, reporting, and outreach — while you focus on strategy and relationships.",
    workers: ["Research Worker", "Content Worker", "Ops Worker"],
    color: "#e8ff47",
    metrics: ["Serve 3x more clients", "Cut delivery time 60%", "White-label for clients"],
    quote: "\"We now deliver full-service content operations for 12 clients with a team of 4 humans + AI.\"",
  },
  {
    id: "freelancer",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
        <path d="M7 8h2M7 12h4"/>
      </svg>
    ),
    title: "Freelancer",
    subtitle: "Independent consultant",
    description: "Win bigger projects and deliver more value. AI research assistants find the right insights, content tools draft faster, and ops agents handle the admin that eats your billable hours.",
    workers: ["Research Worker", "Content Worker"],
    color: "#00FF88",
    metrics: ["Bid on 2x more projects", "Double your output", "Bill more, admin less"],
    quote: "\"My proposal response time dropped from 3 days to 3 hours. I closed a $8k project last week.\"",
  },
  {
    id: "founder",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: "Founder / CEO",
    subtitle: "Early-stage startup",
    description: "Every hour counts when you're building. AI workers handle the operational load — investor research, competitor analysis, customer support, content — so you stay focused on product and fundraising.",
    workers: ["Research Worker", "Support Worker", "Ops Worker", "Content Worker"],
    color: "#FF6B35",
    metrics: ["Recover 30+ hrs/week", "Market intel on demand", "Scale support without hiring"],
    quote: "\"I went from doing 60-hour weeks to 40. The AI handles everything routine.\"",
  },
];

const USE_CASE_CARDS = [
  {
    title: "24/7 Customer Support",
    description: "Support workers answer FAQs, route tickets, and escalate complex issues. Your customers get responses in seconds, not hours.",
    badge: "Support",
    badgeColor: "#e8ff47",
    metrics: "80% auto-resolution",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 13a9 9 0 0 1 18 0M21 14v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z"/>
      </svg>
    ),
  },
  {
    title: "Lead Research & Prospecting",
    description: "Research workers find qualified prospects, pull tech stacks, find decision-makers, and build outreach lists — automatically every morning.",
    badge: "Sales",
    badgeColor: "#e8ff47",
    metrics: "340 qualified leads/week",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/>
      </svg>
    ),
  },
  {
    title: "Automated Content Pipeline",
    description: "Content workers research topics, draft posts, schedule them, and track performance — without you touching it. 14 pieces a week is the baseline.",
    badge: "Content",
    badgeColor: "#e8ff47",
    metrics: "14 pieces/week baseline",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20h9M12 12h9M12 4h9M5 12H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1M8 8H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M16 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
      </svg>
    ),
  },
  {
    title: "Daily Client Reporting",
    description: "Ops workers pull data from all your tools every morning, build the report, and deliver it to your inbox — before you're out of bed.",
    badge: "Ops",
    badgeColor: "#e8ff47",
    metrics: "Zero manual data entry",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 17V7m0 10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 10V7m0 10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 10V7"/>
      </svg>
    ),
  },
  {
    title: "Market Intelligence",
    description: "Research workers monitor competitors, track pricing changes, and surface market signals — delivering a daily briefing straight to Telegram.",
    badge: "Research",
    badgeColor: "#e8ff47",
    metrics: "Daily market briefings",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M22 7 13.5 15.5l-4-4L2 19M16 7h6v6"/>
      </svg>
    ),
  },
  {
    title: "Workflow Automation",
    description: "Ops workers manage approvals, sync data across tools, handle routing, and keep your processes running without you in the loop.",
    badge: "Automation",
    badgeColor: "#e8ff47",
    metrics: "Removes bottlenecks",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
  },
];

export default function UseCasesPageClient() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true });

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
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
          <p className="pre-label mb-4">USE CASES</p>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.04em] text-white md:text-5xl lg:text-6xl">
            Built for
            <span className="bg-gradient-to-r from-[#e8ff47] to-[#e8ff47] bg-clip-text text-transparent">
              {" "}Real Business Work
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-[rgba(255,255,255,0.5)] sm:text-lg">
            Not a generic chatbot. Workers are preconfigured for how operations
            actually run — from solo founders to 50-person agencies.
          </p>
        </motion.div>
      </div>

      {/* Persona tabs */}
      <div className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {PERSONAS.map((persona, i) => (
              <motion.div
                key={persona.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-8 transition-all hover:border-[rgba(0,212,255,0.2)]"
              >
                {/* Glow on hover */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 0% 0%, ${persona.color}08, transparent 50%)` }}
                />

                <div className="relative z-10">
                  {/* Header */}
                  <div className="mb-5 flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl"
                      style={{
                        background: `${persona.color}15`,
                        border: `1px solid ${persona.color}30`,
                        color: persona.color,
                      }}
                    >
                      {persona.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{persona.title}</h3>
                      <p className="text-xs text-[rgba(255,255,255,0.35)]">{persona.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
                    {persona.description}
                  </p>

                  {/* Workers */}
                  <div className="mt-5">
                    <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[rgba(255,255,255,0.2)]">
                      Recommended Workers
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {persona.workers.map((w) => (
                        <span
                          key={w}
                          className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-1 text-xs text-[rgba(255,255,255,0.6)]"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {persona.metrics.map((m) => (
                      <div
                        key={m}
                        className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-2.5 text-center"
                      >
                        <p className="text-xs font-medium text-white">{m}</p>
                      </div>
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="mt-5 border-t border-[rgba(255,255,255,0.06)] pt-5">
                    <p className="text-sm italic text-[rgba(255,255,255,0.35)]">&ldquo;{persona.quote}&rdquo;</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Use case cards */}
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
            <p className="pre-label mb-3">USE CASES</p>
            <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-[-0.03em] text-white">
              What Workers Actually Do
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {USE_CASE_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6 transition-all hover:border-[rgba(255,255,255,0.15)]"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${card.badgeColor}08, transparent 60%)` }}
                />

                <div className="relative z-10">
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{
                        background: `${card.badgeColor}12`,
                        border: `1px solid ${card.badgeColor}25`,
                        color: card.badgeColor,
                      }}
                    >
                      {card.icon}
                    </div>
                    <span
                      className="rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{
                        background: `${card.badgeColor}15`,
                        border: `1px solid ${card.badgeColor}30`,
                        color: card.badgeColor,
                      }}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[rgba(255,255,255,0.45)]">
                    {card.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ background: card.badgeColor, boxShadow: `0 0 8px ${card.badgeColor}` }} />
                    <p className="text-xs font-mono font-medium" style={{ color: card.badgeColor }}>
                      {card.metrics}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-[-0.03em] text-white">
            Ready to deploy your AI team?
          </h2>
          <p className="mt-4 text-[rgba(255,255,255,0.5)]">
            Start with one worker and expand as you see results. No minimum commitment.
          </p>
          <a
            href="/pricing"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#e8ff47] to-[#e8ff47] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[rgba(0,212,255,0.2)] transition-all hover:-translate-y-0.5 hover:shadow-xl"
          >
            View Pricing
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </main>
  );
}
