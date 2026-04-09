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
  { value: 500, suffix: "+", label: "Integrations" },
  { value: 3, suffix: " min", label: "Avg. deployment" },
  { value: 98, suffix: "%", label: "Uptime SLA" },
  { value: 50, suffix: "+", label: "Happy customers" },
];

const testimonials = [
  {
    quote: "I was paying $800/month in OpenAI API calls alone. Switched to ClawOps — now I pay $99/month total and my agents are faster.",
    name: "Rahul M.",
    role: "Agency Founder, Mumbai",
    initials: "RM",
    color: "#00D4FF",
  },
  {
    quote: "Our support team handles 3x the volume now. The AI agent resolves 80% of tickets before a human even sees them.",
    name: "Sarah K.",
    role: "CEO, E-commerce Brand",
    initials: "SK",
    color: "#6600FF",
  },
  {
    quote: "Setup was genuinely 3 minutes. I thought it would take weeks. The VPS was configured and my first agent was live before my coffee got cold.",
    name: "James L.",
    role: "Solo Consultant, UK",
    initials: "JL",
    color: "#00D4FF",
  },
];

export default function SocialProof() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      id="social-proof"
      className="relative overflow-hidden bg-[#04040c] px-6 py-20 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(102,0,255,0.3), transparent)",
        }}
      />

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
              <div className="text-3xl font-bold md:text-5xl" style={{ background: "linear-gradient(135deg, #00D4FF, #6600FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
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
            What Our Customers Say
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
            {["Telegram", "WhatsApp", "Slack", "n8n", "GHL", "HubSpot", "Notion"].map((name) => (
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
