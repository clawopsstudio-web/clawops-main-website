'use client';

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import FeatureCard from "@/components/ui/FeatureCard";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8ff47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: "Vertical-Specific AI",
    description: "Agents trained for your industry — real estate, healthcare, legal, e-commerce — not generic chatbots.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8ff47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v6m0 6v10M1 12h6m6 0h10"/>
        <path d="M5.6 5.6l4.3 4.3m4.2 4.2l4.3 4.3M18.4 5.6l-4.3 4.3m-4.2 4.2l-4.3 4.3"/>
      </svg>
    ),
    title: "Full Autonomy",
    description: "Agents make decisions, send emails, update CRMs, and book calls — without human input.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8ff47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M3 9h18M9 21V9"/>
      </svg>
    ),
    title: "GHL Native",
    description: "Built natively inside Go High Level. Agents operate inside your existing workflow, not a separate app.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8ff47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Real-Time Analytics",
    description: "Track every call, email, and conversion. Know exactly what your AI workforce is doing at all times.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8ff47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Enterprise Security",
    description: "SOC 2 compliant. Your data stays yours. End-to-end encryption and private cloud deployment available.",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e8ff47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
      </svg>
    ),
    title: "Infinite Scalability",
    description: "Add 1 agent or 100. Scale your AI workforce up or down based on demand — instantly.",
  },
];

export default function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      id="features"
      className="relative overflow-hidden bg-[#0a0a0a] px-6 py-16 md:py-24"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(102,0,255,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Section label + headline */}
        <motion.div
          className="text-center mb-8 md:mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-accent/70">
            Features
          </span>
          <h2 className="text-[clamp(1.5rem,4vw,2rem)] font-bold mt-3 mb-3">
            Everything your AI team needs
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Purpose-built tools for agencies who are done hiring and ready to
            automate.
          </p>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map((feature, i) => (
            <FeatureCard
              key={i}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              delay={0.1 * i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
