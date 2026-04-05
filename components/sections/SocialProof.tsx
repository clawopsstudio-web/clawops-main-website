"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    quote:
      "We went from drowning in support tickets to having AI handle 80% of them in week two. ClawOps paid for itself in the first month.",
    name: "Marcus Reid",
    role: "Founder, GrowthLoop Agency",
    initials: "MR",
    accent: "#00D4FF",
    verified: true,
  },
  {
    quote:
      "The Research Worker alone replaced a $3k/month VA contract. It finds decision-makers, pulls tech stacks, and builds prospect lists — automatically.",
    name: "Priya Nair",
    role: "CEO, ScalePad Digital",
    initials: "PN",
    accent: "#6600FF",
    verified: true,
  },
  {
    quote:
      "I stopped being the bottleneck. Every approval, every follow-up — my Ops Worker handles it. I finally have time to think about strategy.",
    name: "Jordan Klein",
    role: "Director, Meridian Media",
    initials: "JK",
    accent: "#00D4FF",
    verified: true,
  },
];

const metrics = [
  { value: "247", label: "Avg tasks handled per week" },
  { value: "98.2%", label: "Worker uptime" },
  { value: "< 30s", label: "Avg response time" },
];

export default function SocialProof() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="social-proof" className="py-16 md:py-24 relative" ref={ref}>
      {/* Top gradient divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(102,0,255,0.3), transparent)",
        }}
      />
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <p className="pre-label mb-4">RESULTS</p>
          <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-bold text-white mb-4">
            What Teams Are Saying
          </h2>
          <p className="text-[rgba(255,255,255,0.5)] text-lg max-w-xl mx-auto">
            Real results from teams running ClawOps workers in production — across
            agencies, SaaS, and operations.
          </p>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 md:gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative rounded-2xl p-px"
              style={{
                background: `linear-gradient(135deg, ${t.accent}33, transparent)`,
              }}
            >
              <div
                className="rounded-[15px] p-6 h-full"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {/* Quote mark */}
                <div
                  className="text-3xl sm:text-4xl font-bold mb-3 leading-none"
                  style={{
                    background: `linear-gradient(135deg, ${t.accent}, ${t.accent}80)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  &ldquo;
                </div>
                <p className="text-white/80 leading-relaxed mb-6 text-[15px]">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: `${t.accent}25`, border: `1px solid ${t.accent}40` }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      {t.verified && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-label="Verified">
                          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <p className="text-[rgba(255,255,255,0.4)] text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Metrics strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-3 gap-8 text-center"
        >
          {metrics.map((m, i) => (
            <div key={m.label}>
              <div
                className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-black mb-2"
                style={{
                  background: "linear-gradient(135deg, #00D4FF, #6600FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {m.value}
              </div>
              <p className="text-[rgba(255,255,255,0.4)] text-sm">{m.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
