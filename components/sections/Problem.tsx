"use client";

import { motion, animate, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M7.5 4.5H5.7C4.872 4.5 4.2 5.172 4.2 6C4.2 13.622 10.378 19.8 18 19.8C18.828 19.8 19.5 19.128 19.5 18.3V16.5L15.9 15.3L14.244 16.956C11.9 15.763 8.237 12.1 7.044 9.756L8.7 8.1L7.5 4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 7.8V12L15.3 13.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M12 4L20 8L12 12L4 8L12 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 12L12 16L20 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16L12 20L20 16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CountUpPercentage({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.8 });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => Math.round(latest));

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(motionValue, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => controls.stop();
  }, [isInView, motionValue, value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

const problems = [
  {
    icon: PhoneIcon,
    title: "Leads Go Cold",
    description:
      "Prospects wait hours for a response. By the time your team replies, they've moved on to a competitor.",
  },
  {
    icon: ClockIcon,
    title: "The Founder Bottleneck",
    description:
      "Every decision, every follow-up, every approval runs through you. You can't scale past 24 hours a day.",
  },
  {
    icon: LayersIcon,
    title: "Tools That Don't Talk",
    description:
      "Your stack doesn't connect to itself. Your team fills gaps with manual work that should be automated.",
  },
];

export default function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <section
      ref={sectionRef}
      id="problem"
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
            THE PROBLEM
          </p>
          <h2 className="mt-3 text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-[-0.03em] text-white md:text-5xl">
            Your Business Has a Scaling Problem
          </h2>
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
          className="mx-auto mt-14 max-w-3xl rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-6 py-8 text-center"
        >
          <p className="text-base font-medium leading-7 text-white sm:text-xl md:text-2xl">
            Most teams lose{" "}
            <span className="text-[#00D4FF]">
              <CountUpPercentage value={23} />%
            </span>{" "}
            of hot leads to slow response times. Every hour that passes cuts your close rate in half.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
