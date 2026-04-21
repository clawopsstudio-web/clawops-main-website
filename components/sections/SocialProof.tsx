'use client';

import { motion, animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.8 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

const stats = [
  { value: 3000, suffix: "$", label: "Avg saved vs new hire per month" },
  { value: 3, suffix: " min", label: "From signup to autonomous agents live" },
  { value: 80, suffix: "%", label: "Tasks handled autonomously by agents" },
  { value: 24, suffix: "/7", label: "Hours your business runs without you" },
];

const testimonials = [
  {
    quote: "We cut our OpenAI bill from $2,400/mo to $149/mo for the same client workload. The agents are faster because there's no API queue. Billing is predictable now — that's the part my CFO loves most.",
    name: "Rahul M.",
    role: "Founder, Mumbai",
    initials: "RM",
    color: "#e8ff47",
  },
  {
    quote: "Before ClawOps: 3 support staff, 200 tickets/month, 80% manual. After: same volume, 1 person, 80% auto-resolved. The AI handles the FAQs. My team handles the edge cases. Natural division of labor.",
    name: "Sarah K.",
    role: "CEO, E-commerce Brand",
    initials: "SK",
    color: "#e8ff47",
  },
  {
    quote: "I seriously thought '3 minute setup' was marketing fluff. It wasn't. Signed up, connected Telegram, had my first research agent pulling lead data before I finished my coffee. First time any tech product has delivered what it promised.",
    name: "James L.",
    role: "Solo Consultant, UK",
    initials: "JL",
    color: "#e8ff47",
  },
];

export default function SocialProof() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="social-proof"
      className="relative bg-[#0a0a0a] px-6 py-16 md:py-24"
    >

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold md:text-5xl" style={{ background: "linear-gradient(135deg, #e8ff47, #e8ff47)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                <CountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-1 text-xs text-[rgba(255,255,255,0.4)] md:text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.5)]">
            Already Running on the AI OS
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
                className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6"
              >
                {/* Quote marks */}
                <div className="text-4xl font-serif leading-none" style={{ color: `${t.color}30` }}>&ldquo;</div>
                <p className="-mt-2 text-sm leading-relaxed text-[rgba(255,255,255,0.7)]">
                  {t.quote}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: `${t.color}15`, color: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{t.name}</div>
                    <div className="text-xs text-[rgba(255,255,255,0.4)]">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Logos bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : undefined}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 border-t border-[rgba(255,255,255,0.06)] pt-12"
        >
          <p className="text-center text-xs text-[rgba(255,255,255,0.25)]">
            Trusted by teams at companies using
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
            {["Telegram", "WhatsApp", "Slack", "Gmail", "GHL", "HubSpot", "Notion"].map((name) => (
              <div key={name} className="text-sm font-medium text-[rgba(255,255,255,0.2)]">
                {name}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
