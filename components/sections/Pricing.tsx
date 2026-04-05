"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type Tier = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlight: boolean;
  badge?: string;
};

const tiers: Tier[] = [
  {
    name: "One Worker",
    price: "$299",
    period: "/month",
    description: "For one specific role: Support / Research / Content / Ops / Sales",
    features: [
      "Setup & configuration",
      "Connected to your apps",
      "Ongoing optimization",
      "Performance monitoring",
      "Email support",
    ],
    cta: "Get Started",
    href: "#cta",
    highlight: false,
  },
  {
    name: "Full Team",
    price: "$799",
    period: "/month",
    description: "All worker roles deployed: Support, Research, Content, Ops, Sales + more",
    features: [
      "All worker roles",
      "Priority support",
      "Monthly strategy call",
      "Advanced analytics",
      "White-label option",
      "Agent swarm setup",
    ],
    cta: "Get Started",
    href: "#cta",
    highlight: true,
    badge: "Most Popular",
  },
];

export default function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative overflow-hidden px-4 pt-12 pb-16 md:pt-16 md:pb-24"
    >
      {/* Top gradient divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(102,0,255,0.3), transparent)",
        }}
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-14 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.1),transparent_65%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[rgba(255,255,255,0.5)]">
            PRICING
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 mx-auto max-w-xl text-base text-[rgba(255,255,255,0.45)]">
            No hidden fees. No per-task charges. One flat monthly rate per worker role.
          </p>
        </motion.div>

        <div className="mt-10 flex flex-col justify-center gap-5 md:flex-row md:items-stretch md:gap-6">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 48 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.12 + index * 0.14, ease: "easeOut" }}
              className={[
                "relative flex w-full max-w-[420px] flex-col rounded-[28px] border bg-[rgba(255,255,255,0.03)] p-8 md:p-10",
                tier.highlight
                  ? "scale-100 border-[#00D4FF] md:scale-[1.03]"
                  : "border-[rgba(255,255,255,0.08)]",
              ].join(" ")}
              style={
                tier.highlight
                  ? {
                      background:
                        "linear-gradient(180deg, rgba(0,212,255,0.07) 0%, rgba(255,255,255,0.03) 48%, rgba(102,0,255,0.08) 100%)",
                      boxShadow: "0 0 40px rgba(0,212,255,0.08)",
                    }
                  : undefined
              }
            >
              {tier.badge ? (
                <div className="absolute right-6 top-6 rounded-full bg-[#00D4FF] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#04040c]">
                  {tier.badge}
                </div>
              ) : null}

              <span className="inline-flex w-fit rounded-full bg-[rgba(0,212,255,0.12)] px-3 py-1 text-xs uppercase tracking-wider text-[#00D4FF]">
                {tier.name}
              </span>

              <div className="mt-6 flex items-end gap-1">
                <span className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">{tier.price}</span>
                <span className="mb-1 text-sm text-[rgba(255,255,255,0.5)]">{tier.period}</span>
              </div>

              <p className="mt-4 min-h-[56px] text-base leading-7 text-[rgba(255,255,255,0.5)]">
                {tier.description}
              </p>

              <div className="mt-8 h-px w-full bg-[rgba(255,255,255,0.08)]" />

              <ul className="mt-8 space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-white/80 md:text-base">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#00D4FF] shadow-[0_0_12px_rgba(0,212,255,0.75)]" />
                    <span className="text-[rgba(255,255,255,0.8)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href={tier.href}
                className={[
                  "mt-10 inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold transition-all duration-300",
                  tier.highlight
                    ? "bg-[#00D4FF] text-[#04040c] hover:bg-[#33ddff] hover:shadow-[0_0_28px_rgba(0,212,255,0.35)]"
                    : "border border-[rgba(255,255,255,0.16)] bg-transparent text-white hover:border-[#00D4FF] hover:text-[#00D4FF] hover:bg-[rgba(0,212,255,0.05)]",
                ].join(" ")}
              >
                {tier.cta}
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <p className="text-base text-[rgba(255,255,255,0.5)]">
            Not sure where to start? Book a free strategy call and we&apos;ll recommend the right setup.
          </p>
          <a
            href="#cta"
            className="mt-3 inline-flex items-center gap-1.5 font-mono text-sm text-[#00D4FF] transition-all duration-200 hover:opacity-80"
          >
            Book a 30-minute strategy call
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
