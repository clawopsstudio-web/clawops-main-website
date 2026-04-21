'use client';

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const INTEGRATIONS = [
  {
    category: "Messaging",
    color: "#e8ff47",
    items: [
      { name: "Telegram", desc: "Primary interface. Message your workers like a colleague.", icon: "T" },
      { name: "WhatsApp", desc: "Customer-facing support via WhatsApp Business API.", icon: "W" },
      { name: "Discord", desc: "Team communication with AI workers in server channels.", icon: "D" },
      { name: "Slack", desc: "Workers live in your Slack workspace alongside your team.", icon: "S" },
      { name: "Microsoft Teams", desc: "Enterprise-grade integration for Teams environments.", icon: "M" },
    ],
  },
  {
    category: "Browser & Automation",
    color: "#e8ff47",
    items: [
      { name: "Virtual Chrome", desc: "Headless browser automation. Works with any web app.", icon: "C" },
      { name: "Authenticated Sessions", desc: "Workers access web apps with your credentials securely.", icon: "A" },
      { name: "Form Auto-Fill", desc: "Workers complete web forms and submit data automatically.", icon: "F" },
      { name: "Multi-Tab Operations", desc: "Coordinate actions across multiple browser tabs.", icon: "M" },
      { name: "Web Scraping", desc: "Extract structured data from any website at scale.", icon: "S" },
    ],
  },
  {
    category: "Data & APIs",
    color: "#e8ff47",
    items: [
      { name: "REST API", desc: "Full REST API to trigger workers, query status, and manage data.", icon: "R" },
      { name: "Webhooks", desc: "Trigger workers via incoming webhooks from any platform.", icon: "H" },
      { name: "MCP Protocol", desc: "Model Context Protocol for deep AI-to-tool integrations.", icon: "P" },
      { name: "GraphQL", desc: "Flexible GraphQL endpoint for complex data queries.", icon: "G" },
      { name: "500+ App Connectors", desc: "Pre-built connectors to Notion, Gmail, HubSpot, Slack, and 500+ more.", icon: "Z" },
    ],
  },
  {
    category: "Productivity & CRM",
    color: "#e8ff47",
    items: [
      { name: "Google Workspace", desc: "Gmail, Drive, Sheets, and Calendar integration.", icon: "G" },
      { name: "Notion", desc: "Read/write Notion databases and pages automatically.", icon: "N" },
      { name: "Airtable", desc: "Manage Airtable bases with AI-powered workflows.", icon: "A" },
      { name: "HubSpot", desc: "Sync CRM data, create contacts, log activities.", icon: "H" },
      { name: "GHL / GoHighLevel", desc: "Full GHL integration for CRM automation.", icon: "L" },
    ],
  },
  {
    category: "AI & Infrastructure",
    color: "#e8ff47",
    items: [
      { name: "ClawOps Gateway", desc: "Central hub for managing all AI workers.", icon: "O" },
      { name: "Ollama (Local)", desc: "Run Gemma 4 2B and other models on managed infrastructure.", icon: "L" },
      { name: "Supabase", desc: "Database, auth, and real-time subscriptions.", icon: "S" },
      { name: "Contabo VPS", desc: "Fully managed infrastructure provisioning and management.", icon: "V" },
      { name: "CLI Access", desc: "SSH access, manage workers from terminal.", icon: "C" },
    ],
  },
  {
    category: "Content & Research",
    color: "#e8ff47",
    items: [
      { name: "Web Search", desc: "Real-time web search for market research and intel.", icon: "S" },
      { name: "PDF Processing", desc: "Read, extract, and summarize PDF documents.", icon: "P" },
      { name: "Content Summarization", desc: "Summarize articles, reports, and long-form content.", icon: "U" },
      { name: "Data Extraction", desc: "Extract structured data from unstructured sources.", icon: "X" },
      { name: "Monitoring & Alerts", desc: "Watch for changes and trigger actions automatically.", icon: "M" },
    ],
  },
];

export default function IntegrationsPageClient() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true });

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div ref={headerRef} className="relative overflow-hidden px-6 pt-32 pb-20 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(102,0,255,0.08),transparent_60%)]" />
          <div className="absolute inset-0 grid-bg opacity-30" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mx-auto max-w-4xl"
        >
          <p className="pre-label mb-4">INTEGRATIONS</p>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.04em] text-white md:text-5xl lg:text-6xl">
            Connects to
            <span className="bg-gradient-to-r from-[#e8ff47] to-[#e8ff47] bg-clip-text text-transparent">
              {" "}Your Entire Stack
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-[rgba(255,255,255,0.5)] sm:text-lg">
            Workers don&apos;t just chat — they operate. Connect via messaging apps,
            browser sessions, APIs, webhooks, or MCP. Virtually any web app works.
          </p>
        </motion.div>
      </div>

      {/* Integration grid */}
      <div className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {INTEGRATIONS.map((cat, ci) =>
              cat.items.map((item, ii) => (
                <motion.div
                  key={`${cat.category}-${item.name}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (ci * 5 + ii) * 0.03 }}
                  className="group relative overflow-hidden rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5 transition-all hover:border-[rgba(255,255,255,0.15)]"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle at 50% 0%, ${cat.color}08, transparent 60%)` }}
                  />

                  <div className="relative z-10 flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold"
                      style={{
                        background: `${cat.color}12`,
                        border: `1px solid ${cat.color}25`,
                        color: cat.color,
                      }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-[rgba(255,255,255,0.4)]">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  {/* Category tag */}
                  <div className="absolute right-4 top-4">
                    <span
                      className="text-[8px] font-mono uppercase tracking-wider"
                      style={{ color: `${cat.color}50` }}
                    >
                      {cat.category}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Any web app section */}
      <div className="relative border-t border-[rgba(255,255,255,0.06)] px-6 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(0,212,255,0.05),transparent_60%)]" />

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.06)]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8ff47" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M8 21h8M12 17v4"/>
              </svg>
            </div>

            <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-[-0.03em] text-white">
              Works with Any Web App
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[rgba(255,255,255,0.45)]">
              Don&apos;t see your tool? Workers use Virtual Chrome browser automation — meaning
              they work with <em>virtually any web application</em>, even ones without an
              API. That&apos;s the difference between an AI chatbot and an AI employee.
            </p>
          </motion.div>
        </div>
      </div>

      {/* MCP deep dive */}
      <div className="relative border-t border-[rgba(255,255,255,0.06)] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <p className="pre-label mb-3">ADVANCED</p>
            <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-[-0.03em] text-white">
              MCP Protocol — Deep AI Integration
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-[rgba(255,255,255,0.45)]">
              The Model Context Protocol lets AI workers connect directly to tools with
              structured, type-safe integrations. More reliable than fragile API scrapes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                title: "Structured Tool Calls",
                desc: "Workers call typed tools with verified inputs and outputs. No more prompt engineering fragile API calls.",
                color: "#e8ff47",
              },
              {
                title: "Multi-Tool Chaining",
                desc: "Chain multiple tools in sequence. Research → Extract → Summarize → Send — all in one worker task.",
                color: "#e8ff47",
              },
              {
                title: "Tool Registry",
                desc: "Browse and add tools from our registry. Community-contributed MCP servers for popular platforms.",
                color: "#00FF88",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6"
                style={{ borderColor: `${item.color}20` }}
              >
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm text-[rgba(255,255,255,0.45)]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
