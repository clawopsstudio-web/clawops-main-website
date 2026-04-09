'use client';

import { useId, useRef } from "react";
import { motion, useInView } from "framer-motion";

type Step = {
  number: string;
  title: string;
  description: string;
  detail: string;
};

const steps: Step[] = [
  {
    number: "01",
    title: "Pick Your Plan",
    description: "Choose the VPS tier that matches your workload — Starter, Pro, or Business. Each comes with pre-configured AI infrastructure.",
    detail: "Starting at $49/month with your own dedicated VPS",
  },
  {
    number: "02",
    title: "Connect Your Stack",
    description: "Connect your messaging apps, browser sessions, and tools. Our pre-built integrations handle authentication in minutes.",
    detail: "Telegram, WhatsApp, Chrome, Slack, GHL, n8n — one-click setup",
  },
  {
    number: "03",
    title: "Deploy in 3 Minutes",
    description: "Your AI agents spin up on your VPS. No cloud configuration. No prompt engineering. They start working immediately.",
    detail: "Yours in 3 minutes. Running 24/7 from day one.",
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

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="relative overflow-hidden bg-[#04040c] px-6 py-20 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(102,0,255,0.3), transparent)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(102,0,255,0.1), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.5)]">
            How It Works
          </p>
          <h2 className="mt-3 text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-[-0.03em] text-white md:text-5xl">
            Live in 3 Minutes, Not 3 Months
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[rgba(255,255,255,0.5)]">
            No cloud setup. No DevOps. No prompt engineering. Just pick, connect, deploy.
          </p>
        </motion.div>

        <DesktopConnector isInView={isInView} />

        <div className="relative mt-16 grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, delay: 0.2 * index, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step number circle */}
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#00D4FF] bg-[#04040c] shadow-[0_0_30px_rgba(0,212,255,0.2)]">
                <span className="font-mono text-lg font-bold text-[#00D4FF]">{step.number}</span>
              </div>

              {/* Mobile connector line */}
              {index < steps.length - 1 && (
                <div className="absolute top-8 left-1/2 h-8 w-px bg-gradient-to-b from-[#00D4FF]/30 to-transparent md:hidden" />
              )}

              <div className="mt-6 w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6">
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
                  {step.description}
                </p>
                <div className="mt-4 rounded-lg bg-[rgba(0,212,255,0.08)] px-3 py-2">
                  <p className="text-xs font-medium text-[#00D4FF]">{step.detail}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Timeline total */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mx-auto mt-12 max-w-md rounded-2xl border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.04)] p-6 text-center"
        >
          <div className="text-4xl font-bold text-white">3 minutes</div>
          <p className="mt-2 text-sm text-[rgba(255,255,255,0.5)]">
            From signup to your first AI worker live on your VPS
          </p>
        </motion.div>
      </div>
    </section>
  );
}
