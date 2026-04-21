'use client';

import { motion, animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const problems = [
  {
    number: "01",
    title: "You're Renting Hardware That Costs Twice.",
    description:
      "Every month you pay cloud providers to run AI models — and then pay again every time your agents make API calls. It's renting an apartment and paying per light switch. You're locked into two recurring costs for the same thing.",
    color: "#e8ff47",
    stat: "Cloud AI costs 10-30x more than running local models",
  },
  {
    number: "02",
    title: "Your Data Goes Through Someone Else's Servers.",
    description:
      "Every prompt, every client conversation, every business insight — routed through third-party AI APIs. Your data is their training fuel. Their downtime is your downtime. Their price hike is your problem.",
    color: "#e8ff47",
    stat: "Third-party AI APIs = third-party data access",
  },
  {
    number: "03",
    title: "Your AI Stack Has No Operating System.",
    description:
      "You have a model, a prompt library, a few scripts, and a Slack channel. That's not a stack — that's glue. Every new agent, every new tool, every new integration adds another fragile API connection. One update breaks everything.",
    color: "#e8ff47",
    stat: "Average business has 14 disconnected AI tools",
  },
];

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

export default function Problem() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });

  return (
    <section ref={sectionRef} id="problem" className="relative bg-[#0a0a0a] px-6 py-16 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-80" style={{
        background: "radial-gradient(circle at 50% 10%, rgba(102,0,255,0.1), transparent 32%), radial-gradient(circle at 50% 90%, rgba(0,212,255,0.06), transparent 28%)",
      }} />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.4)]">
            The Problem
          </p>
          <h2 className="mt-3 text-[clamp(1.75rem,4vw,2.5rem)] font-bold tracking-[-0.03em] text-white md:text-5xl">
            Your AI Stack Has<br className="hidden md:block" /> No Operating System.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-[rgba(255,255,255,0.45)] leading-relaxed">
            Renting hardware. Routing data through别人的 servers. No OS, no kernel, no app store — just fragile API glue holding it all together.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {problems.map((problem, index) => (
            <motion.article
              key={problem.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, delay: 0.1 * (index + 1), ease: [0.22, 1, 0.36, 1] }}
              className="group rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-6 md:p-7 transition-all duration-300 hover:-translate-y-1"
              style={{ borderTopColor: problem.color, borderTopWidth: '2px' }}
            >
              <div className="font-mono text-xs font-bold text-[rgba(255,255,255,0.25)] mb-4">{problem.number}</div>
              <h3 className="text-lg md:text-xl font-semibold text-white leading-snug mb-3">{problem.title}</h3>
              <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.45)]">{problem.description}</p>
              <div className="mt-5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] px-3 py-2">
                <p className="text-xs font-medium" style={{ color: problem.color }}>{problem.stat}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        >
          {[
            { value: 10, suffix: "x", label: "more expensive than local AI" },
            { value: 14, suffix: "+", label: "disconnected AI tools on average" },
            { value: 0, suffix: "", label: "data sovereignty with cloud AI" },
            { value: 100, suffix: "%", label: "API dependency on third parties" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 md:p-5 text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">
                <CountUpNumber value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-1 text-[10px] md:text-xs text-[rgba(255,255,255,0.35)] leading-snug">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
