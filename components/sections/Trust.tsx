"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const proofCards = [
  {
    title: "Deploy in 48 Hours",
    body: "Most agencies are live within 48 hours of kickoff — no months-long implementations, no IT department required.",
    accent: "#00D4FF",
  },
  {
    title: "Your Data Stays Yours",
    body: "Enterprise-grade security, private deployments, and full data ownership — because your client data is your competitive moat.",
    accent: "#6600FF",
  },
  {
    title: "Works in Every Timezone",
    body: "AI employees handle leads, support, and follow-ups while you sleep — so your agency never misses an opportunity.",
    accent: "#00D4FF",
  },
];

const integrations = ["OpenClaw", "Supabase", "Vercel", "n8n", "Telegram", "Slack"];

export default function Trust() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      id="trust"
      className="relative overflow-hidden bg-[#04040c] px-6 pt-16 pb-20 md:pt-20 md:pb-28"
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
        <div className="absolute right-0 top-10 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(102,0,255,0.12),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[rgba(255,255,255,0.5)]">
            TRUSTED INFRASTRUCTURE
          </p>
          <h2 className="mt-3 text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-tight text-white md:text-5xl">
            Built on Systems That Scale
          </h2>
        </motion.div>

        <motion.div
          className="mt-12 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-6 py-5 text-center md:px-10"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-mono text-sm text-[rgba(255,255,255,0.45)] md:gap-x-4">
            <span className="text-[rgba(255,255,255,0.6)]">Integrated with:</span>
            {integrations.map((item, index) => (
              <div key={item} className="flex items-center gap-3 md:gap-4">
                <span>{item}</span>
                {index < integrations.length - 1 ? <span className="text-[rgba(255,255,255,0.18)]">·</span> : null}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="mt-6 grid gap-4 md:grid-cols-3 md:gap-5"
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.12, delayChildren: 0.25 },
            },
          }}
        >
          {proofCards.map((card) => (
            <motion.div
              key={card.title}
              variants={{
                hidden: { opacity: 0, y: 36 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.65, ease: "easeOut" },
                },
              }}
              className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-8"
            >
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <div
                className="mt-1 h-0.5 w-6 rounded-full"
                style={{ background: card.accent }}
              />
              <p className="mt-4 text-base leading-7 text-[rgba(255,255,255,0.5)]">
                {card.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
