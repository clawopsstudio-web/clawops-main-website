"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const testimonials = [
  {
    quote:
      "We went from drowning in support tickets to having AI handle the bulk of first-line responses. ClawOps paid for itself in the first month.",
    name: "Operations Lead",
    role: "50-person service company, US",
    initials: "OL",
    accent: "#00D4FF",
    verified: false,
  },
  {
    quote:
      "The Research Worker handles prospect discovery and tech stack research that used to take days. It now runs automatically every week.",
    name: "Growth Lead",
    role: "B2B SaaS company, 30 people",
    initials: "GL",
    accent: "#6600FF",
    verified: false,
  },
  {
    quote:
      "I stopped being the bottleneck. Every approval, every follow-up — my Ops Worker handles it. I finally have time to think about strategy.",
    name: "Founder",
    role: "Digital agency, 12-person team",
    initials: "FO",
    accent: "#00D4FF",
    verified: false,
  },
];

const metrics = [
  { value: "200+", label: "Tasks handled per week, per worker" },
  { value: "99%+", label: "Uptime maintained" },
  { value: "< 2min", label: "Average response time" },
];

export default function SocialProof() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="social-proof" className="py-12 md:py-24 relative" ref={ref}>
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

      <div className="max-w-6xl mx-auto px-6 relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8 md:mb-12"
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 md:mb-12 md:gap-6">
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
          className="grid grid-cols-3 gap-4 md:gap-8 text-center"
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
