'use client';

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PLAN = {
  name: "Agentic OS",
  price: 499,
  tagline: "Everything you need. Unlimited AI employees. Zero compromises.",
  color: "#e8ff47",
  specs: {
    vcpus: "8 vCPU",
    ram: "16 GB",
    storage: "250 GB NVMe SSD",
    uptime: "99.95%",
  },
  agents: "Unlimited AI Agents",
  workflows: "Unlimited Automations",
  browser: "5 Browser Sessions",
  localModel: "Cloud + Custom models",
  models: ["Claude Opus 4.6", "GPT-4.4", "Anthropic 2.5", "GPT-4o", "Gemini 2.5"],
  features: [
    "Unlimited AI Agents (any roles)",
    "All messaging platforms — Telegram, WhatsApp, Slack, Email",
    "Browser + API + MCP automation",
    "Unlimited automations",
    "5 browser sessions",
    "Cloud inference + custom model support",
    "All cloud AI models included",
    "90-day history retention",
    "Dedicated support (1h SLA)",
    "White-label dashboard",
    "Client sub-accounts",
    "Custom integrations & webhooks",
    "Weekly strategy sessions",
    "SLA guarantee",
    "VPS on your own server or ours",
  ],
  cta: "Get Started",
  popular: true,
};

const FAQS = [
  {
    q: "How does billing work?",
    a: "All plans are billed monthly. You can upgrade or downgrade anytime. No long-term contracts required.",
  },
  {
    q: "What's included in the plan?",
    a: "Every plan includes managed infrastructure with the specified resources. Your AI agents run 24/7 on dedicated servers — no setup required.",
  },
  {
    q: "What AI models can I use?",
    a: "All plans include access to Claude Opus 4.6, GPT-4.4, Anthropic 2.5, GPT-4o, and Gemini 2.5 via API. Cloud inference is included — no local setup required.",
  },
  {
    q: "How many AI employees can I hire?",
    a: "Unlimited. Sales, support, research, ops, finance — hire as many as your business needs. Add new roles anytime.",
  },
  {
    q: "Can I use my own VPS?",
    a: "Yes. You can connect your own Contabo VPS or use ours. Your VPS is provisioned with your AI agents and all integrations pre-configured.",
  },
  {
    q: "What happens if I exceed my plan limits?",
    a: "There are no usage caps. Your AI employees work as hard as your business needs them to.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 7-day money-back guarantee. If you're not satisfied within the first week, we'll refund you in full.",
  },
  {
    q: "How long does it take to get started?",
    a: "48 hours from your discovery call to your first AI employee deployed and working.",
  },
];

export default function PricingPageClient() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  const annualPrice = Math.round(PLAN.price * 0.6);
  const displayPrice = annual ? annualPrice : PLAN.price;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <div className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,212,255,0.12),transparent)]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.06)] mb-6">
            <span className="text-xs font-mono text-[#e8ff47]">Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            The cost of not automating
            <br />
            <span className="bg-gradient-to-r from-[#e8ff47] to-[#e8ff47] bg-clip-text text-transparent">
              is higher than this.
            </span>
          </h1>
          <p className="text-lg text-[rgba(255,255,255,0.5)] max-w-xl mx-auto">
            One plan. Unlimited AI employees. Deploy your team in 48 hours.
          </p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm ${!annual ? "text-white" : "text-white/40"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${annual ? "bg-[#e8ff47]" : "bg-white/10"}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${annual ? "translate-x-8" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm ${annual ? "text-white" : "text-white/40"}`}>
              Annual <span className="text-[#e8ff47] text-xs font-bold">(-40%)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Single Pricing Card */}
      <div className="max-w-2xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="relative rounded-2xl border border-[#e8ff47] bg-[rgba(102,0,255,0.06)] overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#e8ff47] to-[#e8ff47]" />

          <div className="p-8">
            {/* Plan header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold">{PLAN.name}</h3>
                <p className="text-sm text-white/50 mt-1">{PLAN.tagline}</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e8ff47] text-white">
                BEST VALUE
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-end gap-1">
                <span className="text-5xl font-bold">${displayPrice}</span>
                <span className="text-white/40 mb-1 ml-1">/month</span>
              </div>
              {annual && (
                <p className="text-xs text-white/30 mt-1">
                  Billed ${annualPrice * 12} yearly
                </p>
              )}
              {!annual && (
                <p className="text-xs text-white/30 mt-1">
                  Or ${annualPrice}/mo billed annually (save 40%)
                </p>
              )}
            </div>

            {/* VPS Specs */}
            <div className="mb-6 p-4 rounded-xl bg-black/30 border border-white/5">
              <p className="text-[10px] font-mono text-white/30 mb-2 uppercase tracking-wider">Infrastructure</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PLAN.specs).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[#e8ff47] text-xs">{value}</span>
                    <span className="text-white/30 text-[10px] capitalize">{key}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key capabilities */}
            <div className="space-y-1.5 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400">&#10003;</span>
                <span>{PLAN.agents}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400">&#10003;</span>
                <span>{PLAN.workflows}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400">&#10003;</span>
                <span>{PLAN.browser}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400">&#10003;</span>
                <span>{PLAN.localModel}</span>
              </div>
            </div>

            {/* Features */}
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-8">
              {PLAN.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                  <span className="text-green-400 mt-0.5 flex-shrink-0">&#10003;</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href="/start"
              className="block w-full py-4 rounded-xl font-semibold text-sm text-center transition-all hover:-translate-y-0.5 bg-gradient-to-r from-[#e8ff47] to-[#e8ff47] text-white shadow-lg shadow-purple-500/20"
            >
              {PLAN.cta} →
            </a>
          </div>
        </motion.div>
      </div>

      {/* AI Agents + Built-in Automations */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)] p-8">
          <h2 className="text-2xl font-bold mb-2">AI Agents + Built-in Automations</h2>
          <p className="text-white/50 mb-6">
            Most AI tools make you choose between intelligence and automation. We give you both.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 text-[#e8ff47]">AI Agents</h3>
              <p className="text-sm text-white/50">
                Handles complex reasoning, multi-step tasks, web browsing, code execution, and conversations.
                Your AI brain — understands context, makes decisions, adapts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-[#e8ff47]">Automations</h3>
              <p className="text-sm text-white/50">
                Handles repetitive, high-volume tasks — syncing data, sending emails, updating spreadsheets,
                triggering webhooks. Zero AI tokens wasted on boring work.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/40">
            <strong className="text-white">Result:</strong> Your AI team runs faster, cheaper, and smarter — because each part does what it&apos;s best at.
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-6 pb-24" ref={ref}>
        <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="font-medium text-sm">{faq.q}</span>
                <span className={`text-white/40 text-lg transition-transform ${openFaq === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-white/50 leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="rounded-2xl p-8 text-center" style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(102,0,255,0.1))", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 className="text-2xl font-bold mb-2">Still not sure?</h2>
          <p className="text-white/50 mb-6">Book a free 30-min strategy call. We&apos;ll help you figure out the best setup.</p>
          <a
            href="mailto:hello@clawops.studio"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #e8ff47, #e8ff47)" }}
          >
            Book a Free Strategy Call
          </a>
        </div>
      </div>
    </div>
  );
}
