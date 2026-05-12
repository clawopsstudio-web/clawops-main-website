'use client';

import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

const reasons = [
  {
    title: "You focus on your business",
    description: "We handle everything — building, deploying, monitoring, and optimizing your AI employees. You just tell us what you need done.",
    icon: "🎯",
  },
  {
    title: "Unlimited everything",
    description: "No caps on agents, no usage limits, no surprise bills. Your AI employees work as hard as your business needs them to.",
    icon: "⚡",
  },
  {
    title: "48 hours to your first AI employee",
    description: "From discovery call to deployed and working. We move fast — because your time is valuable.",
    icon: "🚀",
  },
  {
    title: "We manage, you grow",
    description: "Weekly optimization, constant monitoring, and improvements included. You're never left hanging when something breaks.",
    icon: "🛡️",
  },
];

export default function WhyClawOps() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="bg-[#0a0a0a] py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(232,255,71,0.6)] mb-4">
            WHY US
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Not an app. A team.
          </h2>
          <p className="text-[rgba(255,255,255,0.45)] max-w-xl mx-auto">
            We don't hand you software and leave. We build your AI employees, connect them to your business, and manage them — forever.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="bg-[#111] rounded-2xl p-6 border border-white/7 text-center"
            >
              <div className="text-3xl mb-4">{reason.icon}</div>
              <h3 className="text-lg font-bold text-white mb-2">{reason.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
