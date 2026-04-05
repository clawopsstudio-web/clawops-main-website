"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export default function FinalCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="cta" className="relative pt-12 pb-20 md:pt-16 md:pb-24" ref={ref}>
      {/* Top gradient divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(102,0,255,0.3), transparent)",
        }}
      />
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,212,255,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-4xl mx-auto px-6 relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Glowing orb */}
          <div className="relative w-20 h-20 mx-auto mb-10">
            <div
              className="absolute inset-0 rounded-full animate-pulse"
              style={{
                background: "radial-gradient(circle, rgba(0,212,255,0.3) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute inset-3 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, #00D4FF, #6600FF)",
                boxShadow: "0 0 30px rgba(0,212,255,0.4), 0 0 60px rgba(102,0,255,0.2)",
              }}
            />
          </div>

          <p className="pre-label mb-4">START TODAY</p>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Your Workers.
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #00D4FF, #6600FF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Ready to Deploy.
            </span>
          </h2>
          <p className="text-[rgba(255,255,255,0.55)] text-lg mb-10 max-w-lg mx-auto leading-relaxed">
            Book a 30-minute strategy call. We&apos;ll map your workflows, identify the highest-impact
            automation, and have a worker running in your apps within 48 hours.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#cta"
              className="group relative px-8 py-4 rounded-xl font-semibold text-white overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #00D4FF, #6600FF)",
                boxShadow: "0 0 30px rgba(0,212,255,0.25)",
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Book a 30-Minute Strategy Call
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:translate-x-1 transition-transform"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </a>
            <a
              href="#pricing"
              className="px-8 py-4 rounded-xl font-semibold text-[rgba(255,255,255,0.7)] border border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.25)] hover:text-white transition-all"
            >
              See Pricing
            </a>
          </div>

          <p className="mt-6 text-[rgba(255,255,255,0.25)] text-xs font-mono">
            No credit card required &middot; Live in 48 hours &middot; Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
