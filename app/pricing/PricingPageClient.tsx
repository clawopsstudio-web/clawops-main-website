'use client';

import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PLANS = [
  {
    name: "Starter",
    price: 49,
    originalPrice: 79,
    tagline: "Your first AI worker. Everything included.",
    highlight: false,
    color: "#00D4FF",
    specs: {
      vcpus: "2 vCPU",
      ram: "4 GB",
      storage: "50 GB NVMe SSD",
      uptime: "99.5%",
    },
    agents: "2 AI Agents",
    workflows: "5 n8n Workflows",
    browser: "1 Browser Session",
    localModel: "Gemma 4 2B (local)",
    models: ["Claude Opus 4.6", "GPT-4.4", "MiniMax 2.5"],
    features: [
      "2 AI Agents (any roles)",
      "Telegram integration",
      "Browser automation",
      "5 n8n workflows",
      "1 browser session",
      "Gemma 4 2B (local Ollama)",
      "All cloud models",
      "30-day history",
      "Email support",
    ],
    cta: "Start with Starter",
    popular: false,
  },
  {
    name: "Pro",
    price: 99,
    originalPrice: 149,
    tagline: "Full AI team. Real leverage.",
    highlight: true,
    color: "#6600FF",
    specs: {
      vcpus: "4 vCPU",
      ram: "8 GB",
      storage: "100 GB NVMe SSD",
      uptime: "99.9%",
    },
    agents: "5 AI Agents",
    workflows: "20 n8n Workflows",
    browser: "3 Browser Sessions",
    localModel: "Gemma 4 2B + 7B",
    models: ["Claude Opus 4.6", "GPT-4.4", "MiniMax 2.5", "GPT-4o", "Gemini 2.5"],
    features: [
      "5 AI Agents (any roles)",
      "Telegram + WhatsApp + Slack",
      "Browser + API automation",
      "20 n8n workflows",
      "3 browser sessions",
      "Gemma 4 2B + 7B (local)",
      "All cloud models",
      "60-day history",
      "Priority support",
      "Webhook + Zapier + n8n",
      "Custom agent instructions",
    ],
    cta: "Go Pro",
    popular: true,
  },
  {
    name: "Business",
    price: 149,
    originalPrice: 249,
    tagline: "Unlimited scale. White-label ready.",
    highlight: false,
    color: "#00D4FF",
    specs: {
      vcpus: "6 vCPU",
      ram: "12 GB",
      storage: "200 GB NVMe SSD",
      uptime: "99.95%",
    },
    agents: "Unlimited AI Agents",
    workflows: "Unlimited n8n",
    browser: "5 Browser Sessions",
    localModel: "Gemma 4 2B + 7B + Custom",
    models: ["Claude Opus 4.6", "GPT-4.4", "MiniMax 2.5", "GPT-4o", "Gemini 2.5", "Any Ollama model"],
    features: [
      "Unlimited AI Agents",
      "All messaging platforms",
      "Browser + API + MCP automation",
      "Unlimited n8n workflows",
      "5 browser sessions",
      "Gemma 4 2B + 7B + Custom models",
      "All cloud models + any Ollama",
      "90-day history",
      "Dedicated support (1h SLA)",
      "White-label dashboard",
      "Client sub-accounts",
      "Custom integrations",
      "Monthly strategy sessions",
      "SLA guarantee",
    ],
    cta: "Go Business",
    popular: false,
  },
];

const COMPARISON = [
  { feature: "AI Agents", starter: "2", pro: "5", business: "Unlimited" },
  { feature: "n8n Workflows", starter: "5", pro: "20", business: "Unlimited" },
  { feature: "Browser Sessions", starter: "1", pro: "3", business: "5" },
  { feature: "Cloud Models", starter: "3", pro: "5+", business: "All + Custom" },
  { feature: "Local Model (Ollama)", starter: "Gemma 2B", pro: "Gemma 2B + 7B", business: "Any model" },
  { feature: "Messaging Platforms", starter: "Telegram", pro: "3 platforms", business: "All platforms" },
  { feature: "History Retention", starter: "30 days", pro: "60 days", business: "90 days" },
  { feature: "Support", starter: "Email", pro: "Priority (4h)", business: "Dedicated (1h)" },
  { feature: "White-label", starter: false, pro: false, business: true },
  { feature: "Client Sub-accounts", starter: false, pro: false, business: true },
  { feature: "Strategy Sessions", starter: false, pro: "Monthly", business: "Weekly" },
  { feature: "SLA Guarantee", starter: false, pro: false, business: true },
];

const FAQS = [
  {
    q: "How does billing work?",
    a: "All plans are billed monthly. You can upgrade or downgrade anytime. No long-term contracts required.",
  },
  {
    q: "What's included in the VPS?",
    a: "Every plan includes a dedicated Contabo VPS with the specified resources. Your OpenClaw instance runs 24/7 on your own server.",
  },
  {
    q: "What AI models can I use?",
    a: "All plans include access to Claude Opus 4.6, GPT-4.4, and MiniMax 2.5 via API. Pro and Business also include Gemma running locally via Ollama — zero API cost.",
  },
  {
    q: "What's n8n and why does it matter?",
    a: "n8n is a powerful workflow automation tool. It handles repetitive, high-volume tasks (like syncing data between apps) so your AI agents only handle complex reasoning. This saves tokens and reduces costs significantly.",
  },
  {
    q: "Can I use my own VPS?",
    a: "Yes. You can connect your own Contabo VPS or use ours. Your VPS is provisioned with OpenClaw, Ollama, n8n, and all integrations pre-configured.",
  },
  {
    q: "What happens if I exceed my plan limits?",
    a: "We'll notify you when you're approaching limits. Plans can be upgraded anytime — changes take effect immediately.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 7-day money-back guarantee on all plans. If you're not satisfied within the first week, we'll refund you in full.",
  },
];

export default function PricingPageClient() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <div className="min-h-screen bg-[#04040c] text-white">
      {/* Hero */}
      <div className="relative py-24 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,212,255,0.12),transparent)]" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.06)] mb-6">
            <span className="text-xs font-mono text-[#00D4FF]">Simple, transparent pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            The cost of not automating
            <br />
            <span className="bg-gradient-to-r from-[#00D4FF] to-[#6600FF] bg-clip-text text-transparent">
              is higher than this.
            </span>
          </h1>
          <p className="text-lg text-[rgba(255,255,255,0.5)] max-w-xl mx-auto">
            Pick a plan. Get your VPS. Deploy your AI team in minutes — not weeks.
          </p>

          {/* Annual toggle */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <span className={`text-sm ${!annual ? "text-white" : "text-white/40"}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${annual ? "bg-[#6600FF]" : "bg-white/10"}`}
            >
              <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${annual ? "translate-x-8" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm ${annual ? "text-white" : "text-white/40"}`}>
              Annual <span className="text-[#00D4FF] text-xs font-bold">(-40%)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border overflow-hidden ${
                plan.highlight
                  ? "border-[#6600FF] bg-[rgba(102,0,255,0.06)]"
                  : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]"
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#6600FF] to-[#00D4FF]" />
              )}

              <div className="p-6">
                {/* Plan header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-white/50 mt-1">{plan.tagline}</p>
                  </div>
                  {plan.highlight && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#6600FF] text-white">
                      POPULAR
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold">${annual ? Math.round(plan.price * 0.6) : plan.price}</span>
                    <span className="text-white/40 mb-1 ml-1">/month</span>
                  </div>
                  {annual && (
                    <p className="text-xs text-white/30 mt-1">
                      Billed ${Math.round(plan.price * 0.6 * 12)} yearly
                    </p>
                  )}
                </div>

                {/* VPS Specs */}
                <div className="mb-4 p-4 rounded-xl bg-black/30 border border-white/5">
                  <p className="text-[10px] font-mono text-white/30 mb-2 uppercase tracking-wider">VPS Hardware</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(plan.specs).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-[#00D4FF] text-xs">{value}</span>
                        <span className="text-white/30 text-[10px] capitalize">{key}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key capabilities */}
                <div className="space-y-1.5 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">&#10003;</span>
                    <span>{plan.agents}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">&#10003;</span>
                    <span>{plan.workflows}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">&#10003;</span>
                    <span>{plan.browser}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400">&#10003;</span>
                    <span>{plan.localModel}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-white/60">
                      <span className="text-green-400 mt-0.5">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 ${
                    plan.highlight
                      ? "bg-gradient-to-r from-[#6600FF] to-[#00D4FF] text-white shadow-lg shadow-purple-500/20"
                      : "border border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)] text-white/80"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Why n8n + OpenClaw */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)] p-8">
          <h2 className="text-2xl font-bold mb-2">Why n8n + OpenClaw together?</h2>
          <p className="text-white/50 mb-6">
            Most AI automation tools make you choose between power and simplicity. We give you both.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 text-[#00D4FF]">OpenClaw</h3>
              <p className="text-sm text-white/50">
                Handles complex reasoning, multi-step tasks, web browsing, code execution, and conversations.
                Your AI brain — understands context, makes decisions, adapts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-[#6600FF]">n8n</h3>
              <p className="text-sm text-white/50">
                Handles repetitive, high-volume automations — syncing data, sending emails, updating spreadsheets,
                triggering webhooks. Zero AI tokens wasted on boring work.
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/40">
            <strong className="text-white">Result:</strong> Your AI team runs faster, cheaper, and smarter — because each tool does what it's best at.
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
        <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                <th className="text-left p-4 text-white/40 text-sm font-medium">Feature</th>
                <th className="text-center p-4 text-sm font-medium">Starter</th>
                <th className="text-center p-4 text-sm font-medium text-[#6600FF]">Pro</th>
                <th className="text-center p-4 text-sm font-medium">Business</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row, i) => (
                <tr key={row.feature} className={`border-b border-[rgba(255,255,255,0.04)] ${i % 2 === 0 ? "bg-white/[0.01]" : ""}`}>
                  <td className="p-4 text-sm text-white/60">{row.feature}</td>
                  <td className="p-4 text-center text-sm">
                    {typeof row.starter === "boolean" ? (
                      row.starter ? <span className="text-green-400">&#10003;</span> : <span className="text-white/20">&#10005;</span>
                    ) : (
                      <span className="text-white/80">{row.starter}</span>
                    )}
                  </td>
                  <td className="p-4 text-center text-sm">
                    {typeof row.pro === "boolean" ? (
                      row.pro ? <span className="text-green-400">&#10003;</span> : <span className="text-white/20">&#10005;</span>
                    ) : (
                      <span className="text-white/80">{row.pro}</span>
                    )}
                  </td>
                  <td className="p-4 text-center text-sm">
                    {typeof row.business === "boolean" ? (
                      row.business ? <span className="text-green-400">&#10003;</span> : <span className="text-white/20">&#10005;</span>
                    ) : (
                      <span className="text-white/80">{row.business}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <h2 className="text-2xl font-bold mb-2">Still not sure which plan is right?</h2>
          <p className="text-white/50 mb-6">Book a free 30-min strategy call. We'll help you figure out the best setup.</p>
          <a
            href="mailto:hello@clawops.studio"
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg, #00D4FF, #6600FF)" }}
          >
            Book a Free Strategy Call
          </a>
        </div>
      </div>
    </div>
  );
}