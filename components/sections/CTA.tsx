"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function CTA() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id="cta"
      className="relative overflow-hidden bg-[#04040c] px-6 py-16 md:py-24"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(102,0,255,0.15) 0%, transparent 70%)",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          {/* Label */}
          <span className="inline-block text-xs font-bold tracking-[0.3em] uppercase text-accent/80 mb-6">
            Get Started Today
          </span>

          {/* Headline */}
          <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
            Your competitors are{" "}
            <span
              className="italic"
              style={{
                WebkitTextStroke: "1px #00D4FF",
                color: "transparent",
              }}
            >
              already building
            </span>{" "}
            their AI workforce.
          </h2>

          {/* Sub */}
          <p className="text-white/50 text-lg md:text-xl mb-10 max-w-xl mx-auto">
            Stop losing deals to agencies that respond in seconds, not hours.
            Deploy your first AI agent today — it takes less than 3 minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#cta"
              className="group relative px-8 py-4 rounded-xl font-bold text-[#04040c] text-sm tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(0,212,255,0.3)]"
              style={{
                background: "linear-gradient(135deg, #00D4FF, #6600FF)",
              }}
            >
              Book a Demo — Free for 14 Days
              <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: "0 0 40px rgba(0,212,255,0.35)" }} />
            </a>
            <a
              href="#pricing"
              className="px-8 py-4 rounded-xl font-semibold text-sm border border-[rgba(255,255,255,0.16)] text-white/80 hover:border-[#00D4FF]/50 hover:text-white hover:bg-[rgba(0,212,255,0.04)] transition-all duration-300"
            >
              See Pricing
            </a>
          </div>

          {/* Trust line */}
          <p className="text-white/25 text-xs mt-6">
            No credit card required &bull; Setup in 30 minutes &bull; Cancel anytime
          </p>
        </motion.div>
      </div>
    </section>
  );
}
