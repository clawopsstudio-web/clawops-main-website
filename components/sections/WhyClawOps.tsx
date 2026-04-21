'use client';

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const comparisonRows = [
  {
    feature: "Setup Time",
    diy: "2–4 weeks",
    clawops: "< 5 minutes",
    clawopsGood: true,
  },
  {
    feature: "Monthly Cost",
    diy: "$200–$800+ in API + hosting + tools",
    clawops: "Starts at $49/mo, everything included",
    clawopsGood: true,
  },
  {
    feature: "No-Code Setup",
    diy: "Requires developer or technical founder",
    clawops: "One-click install, no code needed",
    clawopsGood: true,
  },
  {
    feature: "Pre-Built Integrations",
    diy: "Build each integration from scratch",
    clawops: "Gmail, Notion, Slack, HubSpot + 500+ ready",
    clawopsGood: true,
  },
  {
    feature: "AI Agents That Actually Work",
    diy: "Prompt engineering, fine-tuning, babysitting",
    clawops: "Rules-based workflows, consistent outputs",
    clawopsGood: true,
  },
  {
    feature: "Browser Automation",
    diy: "Fragile scripts that break on UI updates",
    clawops: "AI-native browser control — even without APIs",
    clawopsGood: true,
  },
  {
    feature: "Ongoing Support",
    diy: "Community forums, Stack Overflow",
    clawops: "Direct support, workflow fixes included",
    clawopsGood: true,
  },
  {
    feature: "Scale Without Hiring",
    diy: "Hire, onboard, manage more humans",
    clawops: "Add agents in seconds, zero HR overhead",
    clawopsGood: true,
  },
];

export default function WhyClawOps() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-[#04040c] py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Why ClawOps vs. DIY?
          </h2>
          <p className="text-[rgba(255,255,255,0.45)] max-w-xl mx-auto">
            You could build this yourself. But why spend weeks and hundreds of dollars on tools when you could be up and running in 5 minutes?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="overflow-x-auto"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)]">
                <th className="text-left py-4 pr-6 font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider text-xs w-1/3">
                  Feature
                </th>
                <th className="text-center py-4 px-6 font-semibold text-[rgba(255,255,255,0.4)] uppercase tracking-wider text-xs w-1/3">
                  DIY / Building It Yourself
                </th>
                <th className="text-center py-4 pl-6 font-semibold text-[#00D4FF] uppercase tracking-wider text-xs w-1/3">
                  ClawOps
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, i) => (
                <motion.tr
                  key={row.feature}
                  initial={{ opacity: 0, x: -12 }}
                  animate={isInView ? { opacity: 1, x: 0 } : undefined}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                  className="border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <td className="py-4 pr-6 font-medium text-white text-sm">
                    {row.feature}
                  </td>
                  <td className="py-4 px-6 text-center text-[rgba(255,255,255,0.38)] text-sm">
                    {row.diy}
                  </td>
                  <td className="py-4 pl-6 text-center">
                    <span className="inline-flex items-center gap-1.5 text-[#00D4FF] font-medium text-sm">
                      <svg viewBox="0 0 12 12" fill="none" className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true">
                        <circle cx="6" cy="6" r="6" fill="rgba(0,212,255,0.15)" />
                        <path d="M3.5 6l1.8 1.8L8.5 4.5" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {row.clawops}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : undefined}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-[rgba(255,255,255,0.3)] text-sm">
            Most teams spend $500–$2,000 in API costs and 3–4 weeks building what ClawOps gives you in 5 minutes.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
