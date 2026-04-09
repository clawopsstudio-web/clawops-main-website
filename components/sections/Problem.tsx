'use client';

import { motion, animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function DollarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CpuIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="9" y="9" width="6" height="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path d="M16 16l3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1zM2 16l3-8 3 8c-.87.65-1.92 1-3 1S.87 16.65 2 16zM12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CountUpNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.8 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value]);

  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

const problems = [
  {
    icon: DollarIcon,
    title: "You're Paying Twice",
    description:
      "Every AI tool you use charges per token. GPT calls, Claude API, Gemini searches. The bills stack up fast — and they scale against your growth.",
  },
  {
    icon: CpuIcon,
    title: "Your Data Leaves Your Control",
    description:
      "Every prompt sent to OpenAI or Anthropic goes through their servers. Confidential client data. Internal strategies. Sales pipelines. You're handing it over.",
  },
  {
    icon: ScaleIcon,
    title: "Latency Kills the Experience",
    description:
      "API queues. Rate limits. Expensive context windows. Your AI worker is waiting in line when it should be working.",
  },
];

export default function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      id="problem"
      className="relative overflow-hidden bg-[#04040c] px-6 pt-14 pb-12 md:pt-20 md:pb-20"
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
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 50% 10%, rgba(102,0,255,0.12), transparent 32%), radial-gradient(circle at 50% 90%, rgba(0,212,255,0.08), transparent 28%)",
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
            The Problem
          </p>
          <h2 className="mt-3 text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-[-0.03em] text-white md:text-5xl">
            You&apos;re Paying for AI the Wrong Way
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[rgba(255,255,255,0.5)]">
            Most businesses pay for AI twice — once in API bills, once in the limitations that come with it.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.article
                key={problem.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : undefined}
                transition={{
                  duration: 0.7,
                  delay: 0.15 * index,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#00D4FF]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[#00D4FF] transition duration-300 group-hover:border-[rgba(0,212,255,0.4)] group-hover:shadow-[0_0_30px_rgba(0,212,255,0.12)]">
                  <Icon />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white sm:mt-6 sm:text-2xl">{problem.title}</h3>
                <p className="mt-4 text-base leading-7 text-[rgba(255,255,255,0.5)]">
                  {problem.description}
                </p>
              </motion.article>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, delay: 0.55 }}
          className="mx-auto mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
        >
          {[
            { value: 3000, prefix: "$", suffix: "+", label: "avg AI API spend/month" },
            { value: 40, prefix: "", suffix: "%", label: "data privacy risk" },
            { value: 500, prefix: "+", suffix: "ms", label: "avg API latency" },
            { value: 100, prefix: "", suffix: "%", label: "predictable cost model" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-5 text-center">
              <div className="text-2xl font-bold text-[#00D4FF] md:text-3xl">
                <CountUpNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)]">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
