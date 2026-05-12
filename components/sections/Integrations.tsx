'use client';

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

const integrationCategories = [
  {
    label: "Messaging",
    color: "#e8ff47",
    items: ["Telegram", "WhatsApp", "Discord", "Slack", "Microsoft Teams"],
  },
  {
    label: "Browser & Web",
    color: "#e8ff47",
    items: ["Virtual Chrome", "Authenticated Sessions", "Web Scraping", "Form Filling", "Multi-Tab Automation"],
  },
  {
    label: "Marketing & Sales",
    color: "#e8ff47",
    items: ["Go High Level", "HubSpot", "Pipedrive", "Salesforce", "Calendly"],
  },
  {
    label: "Productivity",
    color: "#e8ff47",
    items: ["Google Workspace", "Notion", "Airtable", "Trello", "Linear"],
  },
  {
    label: "Automation",
    color: "#e8ff47",
    items: ["Gmail", "Notion", "Slack", "HubSpot", "GHL"],
  },
  {
    label: "Research & Data",
    color: "#e8ff47",
    items: ["Web Scraping", "Web Search", "PDF Processing", "Data Extraction", "Monitoring"],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export default function Integrations() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="integrations"
      className="relative bg-[#0a0a0a] px-6 py-16 md:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,212,255,0.05), transparent 60%)",
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
            CONNECTIONS
          </p>
          <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.03em] text-white md:text-5xl">
            Your AI employees connect<br className="hidden md:block" /> to everything you use.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-[rgba(255,255,255,0.45)] leading-relaxed">
            We connect to your tools, your data, and your workflows. Gmail, Notion, Slack, HubSpot — if your team uses it, your AI employees can too.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {integrationCategories.map((cat) => (
            <motion.div
              key={cat.label}
              variants={item}
              className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-5"
            >
              <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">{cat.label}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((app) => (
                  <span
                    key={app}
                    className="px-2.5 py-1 rounded-full text-xs bg-white/5 text-white/60 border border-white/8"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <p className="text-white/40 text-sm mb-4">
            Don't see your tool? We connect to virtually anything.
          </p>
          <Link
            href="/start"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a] font-semibold rounded-xl transition-colors"
          >
            Tell us what you use →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
