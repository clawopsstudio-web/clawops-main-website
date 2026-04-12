'use client';

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

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
      className="relative bg-[#04040c] px-6 py-16 md:py-24"
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
            APP STORE
          </p>
          <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.03em] text-white md:text-5xl">
            500+ Apps. One AI OS.<br className="hidden md:block" /> Zero API Bills.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-[rgba(255,255,255,0.45)] leading-relaxed">
            Connect GHL, n8n, Google Workspace, and 500+ other tools — like installing apps on your phone. Pre-built, pre-authenticated, running on managed infrastructure.
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
              <div
                className="mb-4 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: `${cat.color}12`, color: cat.color }}
              >
                {cat.label}
              </div>
              <ul className="space-y-2">
                {cat.items.map((tool) => (
                  <li key={tool} className="flex items-center gap-2.5 text-sm text-[rgba(255,255,255,0.5)]">
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-[rgba(255,255,255,0.3)]">
            Don&apos;t see your tool? Our MCP protocol connects to any REST API.
          </p>
          <Link href="/dashboard" className="mt-2 inline-block text-sm font-medium text-[#00D4FF] hover:text-white hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all">
            Request an integration &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
