'use client';

import { motion, animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const problems = [
  {
    number: "01",
    title: "You're Paying Per Agent, Not Per Infrastructure",
    description:
      "Most AI platforms charge per agent, per seat, per token. Add five clients? Your bill quintuples. Every agent you deploy is a new line item — forever.",
    color: "#00D4FF",
    stat: "3-5x bill growth per new client",
  },
  {
    number: "02",
    title: "Your Client Data Goes Through Third-Party Servers",
    description:
      "Every prompt, every response, every piece of client data passes through OpenAI, Anthropic, or Google. You're handing over confidential business data to AI vendors every single day.",
    color: "#6600FF",
    stat: "100% of prompts routed externally",
  },
  {
    number: "03",
    title: "Agents Don't Share Memory or Context",
    description:
      "Your AI stack is a collection of disconnected API calls. One agent handles support. Another handles sales. They don't share context, don't remember, don't learn. It's automation, not intelligence.",
    color: "#00D4FF",
    stat: "0 shared memory between agents",
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
    <section
      ref={sectionRef}
      id="problem"
      className="relative bg-[#04040c] px-6 py-16 md:py-24"
    >

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 50% 10%, rgba(102,0,255,0.1), transparent 32%), radial-gradient(circle at 50% 90%, rgba(0,212,255,0.06), transparent 28%)",
        }}
      />

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
            AI Agents Are Expensive.<br className="hidden md:block" /> Fragile. And Someone Else's.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-[rgba(255,255,255,0.45)] leading-relaxed">
            The promise of AI agents is real. But the current way to run them — API costs, token billing, no memory, no shared context — makes it unaffordable for most businesses.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {problems.map((problem, index) => (
            <motion.article
              key={problem.number}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{
                duration: 0.7,
                delay: 0.1 * (index + 1),
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] p-6 md:p-7 transition-all duration-300 hover:-translate-y-1"
              style={{ borderTopColor: problem.color, borderTopWidth: '2px' }}
            >
              <div className="font-mono text-xs font-bold text-[rgba(255,255,255,0.25)] mb-4">{problem.number}</div>
              <h3 className="text-lg md:text-xl font-semibold text-white leading-snug mb-3">{problem.title}</h3>
              <p className="text-sm leading-relaxed text-[rgba(255,255,255,0.45)]">
                {problem.description}
              </p>
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
            { value: 2400, prefix: "$", suffix: "+", label: "avg monthly API bill for one client" },
            { value: 0, prefix: "$", suffix: "", label: "API costs with ClawOps — flat fee only" },
            { value: 80, prefix: "", suffix: "%", label: "tasks auto-resolved by agents" },
            { value: 100, prefix: "", suffix: "%", label: "client data stays private" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 md:p-5 text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">
                <CountUpNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="mt-1 text-[10px] md:text-xs text-[rgba(255,255,255,0.35)] leading-snug">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
