'use client';

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const TEAM = [
  {
    name: "Pulkit",
    role: "Founder & CEO",
    bio: "Background in GHL, AI automation services. Building the next generation of AI-native businesses.",
    initials: "P",
    color: "#e8ff47",
  },
  {
    name: "Henry",
    role: "Chief AI Officer",
    bio: "AI agent running on managed infrastructure. Responsible for strategy, architecture, and actually shipping things.",
    initials: "H",
    color: "#e8ff47",
  },
];

const VALUES = [
  {
    title: "Speed over perfection",
    desc: "Ship fast. Iterate faster. A working product beats a perfect plan.",
    color: "#e8ff47",
  },
  {
    title: "Own the infrastructure",
    desc: "We run on managed infrastructure, our own models, our own stack. No vendor lock-in, ever.",
    color: "#e8ff47",
  },
  {
    title: "Real leverage, not vibes",
    desc: "Every feature we build saves real time or makes real money. No vanity metrics.",
    color: "#00FF88",
  },
  {
    title: "Transparent pricing",
    desc: "Flat subscriptions. No per-message billing. No hidden costs. You know what you're paying.",
    color: "#FF6B35",
  },
];

export default function CompanyPageClient() {
  const headerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true });

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      {/* Hero */}
      <div ref={headerRef} className="relative overflow-hidden px-6 pt-32 pb-20 text-center">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,212,255,0.08),transparent_60%)]" />
          <div className="absolute inset-0 grid-bg opacity-30" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 mx-auto max-w-4xl"
        >
          <p className="pre-label mb-4">COMPANY</p>
          <h1 className="text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-[-0.04em] text-white md:text-5xl lg:text-6xl">
            We Build AI That
            <br />
            <span className="bg-gradient-to-r from-[#e8ff47] to-[#e8ff47] bg-clip-text text-transparent">
              Actually Works
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-[rgba(255,255,255,0.5)] sm:text-lg">
            ClawOps Studio is building the infrastructure layer for AI-native businesses.
            We make it dead simple to deploy, manage, and scale AI workers.
          </p>
        </motion.div>
      </div>

      {/* Mission */}
      <div className="relative border-t border-[rgba(255,255,255,0.06)] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)] p-10 text-center"
          >
            <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.3)] to-transparent" />
            <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[rgba(0,212,255,0.3)] to-transparent" />
            <p className="text-[clamp(1.2rem,3vw,2rem)] font-medium leading-relaxed text-white/80 italic">
              &ldquo;Every business should have an AI team. Not a chatbot. Not a toy. A real
              workforce that handles support, research, content, and ops — running 24/7
              inside the tools you already use.&rdquo;
            </p>
            <p className="mt-5 text-sm text-[rgba(0,212,255,0.7)]">— Pulkit, Founder</p>
          </motion.div>
        </div>
      </div>

      {/* Team */}
      <div className="relative border-t border-[rgba(255,255,255,0.06)] px-6 py-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(102,0,255,0.05),transparent_60%)]" />

        <div className="relative z-10 mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <p className="pre-label mb-3">THE TEAM</p>
            <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-[-0.03em] text-white">
              Small Team. Big Output.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group relative overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-8"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 0% 0%, ${member.color}08, transparent 50%)` }}
                />

                <div className="relative z-10 flex items-start gap-5">
                  <div
                    className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl text-2xl font-bold"
                    style={{
                      background: `${member.color}15`,
                      border: `2px solid ${member.color}40`,
                      color: member.color,
                    }}
                  >
                    {member.initials}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{member.name}</h3>
                    <p className="mt-0.5 font-mono text-xs uppercase tracking-wider" style={{ color: member.color }}>
                      {member.role}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[rgba(255,255,255,0.45)]">
                      {member.bio}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="relative border-t border-[rgba(255,255,255,0.06)] px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <p className="pre-label mb-3">VALUES</p>
            <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-[-0.03em] text-white">
              What We Stand For
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {VALUES.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex items-start gap-4 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-6"
              >
                <div
                  className="mt-0.5 flex h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ background: value.color, boxShadow: `0 0 8px ${value.color}` }}
                />
                <div>
                  <h3 className="text-base font-semibold text-white">{value.title}</h3>
                  <p className="mt-1 text-sm text-[rgba(255,255,255,0.4)]">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="relative border-t border-[rgba(255,255,255,0.06)] px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="pre-label mb-3">CONTACT</p>
            <h2 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-[-0.03em] text-white">
              Get in Touch
            </h2>
            <p className="mx-auto mt-4 max-w-md text-[rgba(255,255,255,0.45)]">
              Questions, partnership inquiries, or just want to talk about AI agents?
              We read every email.
            </p>

            <div className="mt-8 space-y-3">
              <a
                href="mailto:hello@clawops.studio"
                className="flex items-center justify-center gap-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] px-6 py-4 text-sm text-white/70 transition-all hover:border-[rgba(0,212,255,0.3)] hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <path d="M22 6l-10 7L2 6"/>
                </svg>
                hello@clawops.studio
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
