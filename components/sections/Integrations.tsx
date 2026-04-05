"use client";

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
    items: ["Virtual Chrome", "Authenticated Sessions", "Web Scraping", "Form Filling", "Multi-Tab"],
  },
  {
    label: "Data & APIs",
    color: "#00D4FF",
    items: ["REST API", "Webhooks", "MCP Protocol", "GraphQL", "Zapier / n8n"],
  },
  {
    label: "Productivity",
    color: "#6600FF",
    items: ["Google Workspace", "Notion", "Airtable", "HubSpot", "GHL / GoHighLevel"],
  },
  {
    label: "Content & Research",
    color: "#00D4FF",
    items: ["Web Search", "PDF Processing", "Content Summarization", "Data Extraction", "Monitoring"],
  },
  {
    label: "Custom",
    color: "#6600FF",
    items: ["Any web app", "Internal tools", "Legacy systems", "Custom APIs", "SaaS platforms"],
  },
];

export default function Integrations() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="integrations"
      className="relative overflow-hidden bg-[#04040c] px-4 py-24 md:py-32"
    >
      {/* Top gradient divider */}
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
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(102,0,255,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.45)]">
            INTEGRATIONS
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-white sm:text-5xl md:text-6xl">
            Connects to Your Stack
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-[rgba(255,255,255,0.5)]">
            Workers don&apos;t just chat — they operate. Connect via messaging apps,
            browser sessions, APIs, webhooks, or MCP. Your stack, your way.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrationCategories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 32 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.55, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.025)] p-6"
            >
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: cat.color }}
                >
                  {cat.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-1.5 text-xs text-[rgba(255,255,255,0.65)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 text-center"
        >
          <p className="text-sm text-[rgba(255,255,255,0.35)]">
            Don&apos;t see your tool? Workers operate through browser automation — meaning they work with
            virtually any web app, even ones without an API.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
