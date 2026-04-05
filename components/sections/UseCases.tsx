"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const useCases = [
  {
    title: "Support Automation",
    description:
      "Your Support Worker handles inbound tickets, answers FAQs, and routes unresolved issues to your team. 24/7 coverage. Zero burnout.",
    badge: "SUPPORT",
    badgeColor: "#00D4FF",
    icon: (
      <path d="M3 13a9 9 0 0 1 18 0M21 14v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
    ),
    metrics: "80% tickets auto-resolved",
  },
  {
    title: "Lead Research",
    description:
      "Your Research Worker finds qualified prospects, pulls tech stacks, finds decision-makers, and builds outreach lists — automatically, around the clock.",
    badge: "SALES",
    badgeColor: "#6600FF",
    icon: (
      <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    ),
    metrics: "340 qualified leads / week",
  },
  {
    title: "Client Reporting",
    description:
      "Your Ops Worker pulls data from all your tools every morning, builds the report, and delivers it — before you're out of bed.",
    badge: "OPS",
    badgeColor: "#00D4FF",
    icon: (
      <path d="M9 17V7m0 10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 10V7m0 10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 10V7" />
    ),
    metrics: "Zero manual data entry",
  },
  {
    title: "Content Operations",
    description:
      "Your Content Worker researches topics, drafts posts, schedules them, and tracks performance — without you touching it.",
    badge: "CONTENT",
    badgeColor: "#6600FF",
    icon: (
      <path d="M12 20h9M12 12h9M12 4h9M5 12H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1M8 8H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2M16 8h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
    ),
    metrics: "14 pieces / week",
  },
  {
    title: "Internal Workflows",
    description:
      "Your Ops Worker manages approvals, syncs data across tools, handles routing, and keeps your processes running without you in the loop.",
    badge: "AUTOMATION",
    badgeColor: "#00D4FF",
    icon: (
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    ),
    metrics: "Removes approval bottlenecks",
  },
  {
    title: "Market Intelligence",
    description:
      "Your Research Worker monitors competitors, tracks pricing changes, and surfaces market signals — delivering a daily briefing straight to your inbox or chat.",
    badge: "RESEARCH",
    badgeColor: "#6600FF",
    icon: (
      <path d="M22 7 13.5 15.5l-4-4L2 19M16 7h6v6" />
    ),
    metrics: "Daily market briefings",
  },
];

export default function UseCases() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="use-cases" className="relative pt-12 pb-32 md:pt-16" ref={ref}>
      {/* Top gradient divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(102,0,255,0.3), transparent)",
        }}
      />
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <p className="pre-label mb-4">USE CASES</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Built for Real Business Work
          </h2>
          <p className="text-[rgba(255,255,255,0.5)] text-lg max-w-xl mx-auto">
            Not a generic chatbot. Workers trained on how operations actually run —
            support, research, content, and ops workflows.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: i * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="group relative rounded-2xl p-px overflow-hidden cursor-default"
            >
              {/* Gradient border on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(135deg, ${uc.badgeColor}20, transparent 60%)`,
                }}
              />

              <div
                className="relative rounded-2xl p-7 h-full"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${uc.badgeColor}15`,
                      border: `1px solid ${uc.badgeColor}30`,
                    }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={uc.badgeColor}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {uc.icon}
                    </svg>
                  </div>
                  <span
                    className="text-[10px] font-mono font-bold tracking-widest px-2 py-1 rounded"
                    style={{
                      background: `${uc.badgeColor}15`,
                      border: `1px solid ${uc.badgeColor}30`,
                      color: uc.badgeColor,
                    }}
                  >
                    {uc.badge}
                  </span>
                </div>

                <h3 className="text-white font-bold text-lg mb-3">{uc.title}</h3>
                <p className="text-[rgba(255,255,255,0.5)] text-sm leading-relaxed mb-5">
                  {uc.description}
                </p>

                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: uc.badgeColor, boxShadow: `0 0 8px ${uc.badgeColor}` }}
                  />
                  <p
                    className="text-xs font-mono font-medium"
                    style={{ color: uc.badgeColor }}
                  >
                    {uc.metrics}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
