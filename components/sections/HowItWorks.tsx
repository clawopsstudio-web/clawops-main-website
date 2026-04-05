"use client";

import { useId, useRef } from "react";
import { motion, useInView } from "framer-motion";

type Step = {
  number: string;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: "01",
    title: "Pick Your Workers",
    description:
      "Choose the roles you need — support, research, content, ops, or sales. We match your needs to a preconfigured stack.",
  },
  {
    number: "02",
    title: "Connect Your Tools",
    description:
      "Workers get authenticated into your messaging apps, browser sessions, and data sources. Usually takes under 48 hours.",
  },
  {
    number: "03",
    title: "They Start Working",
    description:
      "Your workers clock in and start handling tasks. You monitor results, not micromanage prompts.",
  },
];

function DesktopConnector({ isInView }: { isInView: boolean }) {
  const pathId = useId();

  return (
    <div className="pointer-events-none absolute left-0 right-0 top-[7.5rem] hidden px-8 lg:block xl:px-12">
      <svg viewBox="0 0 1200 120" className="h-[120px] w-full" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={pathId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#00D4FF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#6600FF" stopOpacity="0.75" />
          </linearGradient>
        </defs>
        <motion.path
          d="M84 60 C 220 60, 200 60, 336 60 S 520 60, 656 60 S 840 60, 976 60 S 1040 60, 1116 60"
          fill="none"
          stroke={`url(#${pathId})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="8 10"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.4, ease: "easeInOut", delay: 0.15 }}
        />
      </svg>
    </div>
  );
}

function MobileConnector({ isInView }: { isInView: boolean }) {
  const pathId = useId();

  return (
    <div className="pointer-events-none absolute left-1/2 top-24 block h-[calc(100%-8rem)] w-10 -translate-x-1/2 lg:hidden">
      <svg viewBox="0 0 40 800" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={pathId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6600FF" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <motion.path
          d="M20 12 L20 780"
          fill="none"
          stroke={`url(#${pathId})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="8 10"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 1.2, ease: "easeInOut", delay: 0.1 }}
        />
      </svg>
    </div>
  );
}

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-120px" });

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative overflow-hidden bg-[#04040c] px-4 pt-12 pb-16 md:pt-16 md:pb-20"
    >
      {/* Top gradient divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(102,0,255,0.3), transparent)",
        }}
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(0,212,255,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(102,0,255,0.12),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-10 max-w-3xl text-center md:mb-14"
        >
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-[rgba(255,255,255,0.5)]">
            HOW IT WORKS
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
            Live in 48 Hours, Not 48 Days
          </h2>
        </motion.div>

        <div className="relative">
          <DesktopConnector isInView={isInView} />
          <MobileConnector isInView={isInView} />

          <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {steps.map((step, index) => (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, y: 36 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
                className="relative flex"
              >
                <div className="relative w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-8 pt-24 md:pt-28 lg:pl-20 lg:pt-8">
                  <div className="pointer-events-none absolute left-8 top-6 bg-[linear-gradient(135deg,#00D4FF,#6600FF)] bg-clip-text text-[72px] font-semibold leading-none tracking-[-0.08em] text-transparent opacity-10 md:text-[96px] lg:left-6 lg:top-4">
                    {step.number}
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-[15px] leading-7 text-[rgba(255,255,255,0.5)]">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
