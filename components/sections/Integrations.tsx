'use client';

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const integrationCategories = [
  {
    label: "Messaging",
    color: "#00D4FF",
    items: ["Telegram", "WhatsApp", "Discord", "Slack", "Microsoft Teams"],
  },
  {
    label: "Browser & Web",
    color: "#6600FF",
    items: ["Virtual Chrome", "Authenticated Sessions", "Web Scraping", "Form Filling", "Multi-Tab Automation"],
  },
  {
    label: "Marketing & Sales",
    color: "#00D4FF",
    items: ["Go High Level", "HubSpot", "Pipedrive", "Salesforce", "Calendly"],
  },
  {
    label: "Productivity",
    color: "#6600FF",
    items: ["Google Workspace", "Notion", "Airtable", "Trello", "Linear"],
  },
  {
    label: "Automation",
    color: "#00D4FF",
    items: ["n8n", "Zapier", "Make.com", "MCP Protocol", "REST API / Webhooks"],
  },
  {
    label: "Research & Data",
    color: "#6600FF",
    items: ["Firecrawl", "Web Search", "PDF Processing", "Data Extraction", "Monitoring"],
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
          background: "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(0,212,255,0.06), transparent 60%)",
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
            Integrations
          </p>
          <h2 className="mt-3 text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-[-0.03em] text-white md:text-5xl">
            Connects to Everything You Already Use
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[rgba(255,255,255,0.5)]">
            Pre-built connectors for 500+ tools. If it has an API or runs in a browser, your AI workers can use it.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {integrationCategories.map((cat) => (
            <motion.div
              key={cat.label}
              variants={item}
              className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6"
            >
              <div
                className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider"
                style={{ background: `${cat.color}15`, color: cat.color }}
              >
                {cat.label}
              </div>
              <ul className="space-y-2">
                {cat.items.map((tool) => (
                  <li key={tool} className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.5)]">
                    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 flex-shrink-0" style={{ color: cat.color }} aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {tool}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-[rgba(255,255,255,0.35)]">
            Don&apos;t see your tool? Our MCP protocol connects to any REST API in minutes.
          </p>
          <a href="/signup" className="mt-2 inline-block text-sm font-medium text-[#00D4FF] hover:text-white transition-colors">
            Request an integration &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  );
}
