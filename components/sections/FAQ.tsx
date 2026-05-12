'use client';

"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "How is this different from hiring a developer to build AI agents?",
    answer:
      "We don't just build agents and leave you to figure it out. We build, deploy, AND manage your AI team. We configure them for your specific business, connect them to your tools, monitor their performance, and optimize them weekly. You get results — we handle the work.",
  },
  {
    question: "What does the service include?",
    answer:
      "Everything: custom agent configuration, tool integrations, deployment, monitoring, and ongoing optimization. You tell us what you need — we build it, manage it, and report on it. No prompts to write, no configuration to manage, no technical skills needed.",
  },
  {
    question: "Do I need to be tech-savvy?",
    answer:
      "Not at all. ClawOps is designed for founders, operations managers, and teams — not developers. You don't need to write code, manage prompts, or handle infrastructure. We take care of the entire setup and management.",
  },
  {
    question: "How long does it take to get started?",
    answer:
      "From discovery call to your first agent going live is typically 3-5 days. We start with a 30-minute conversation to understand your needs, then we build and deploy. No technical setup required on your end.",
  },
  {
    question: "Do you need access to my sensitive data?",
    answer:
      "Agents only access the specific data streams needed for their tasks. We follow strict security protocols, use enterprise-grade infrastructure, and can support custom VPC or data-residency requirements if needed.",
  },
  {
    question: "What if the agent makes a mistake?",
    answer:
      "We monitor every agent continuously. Support agents route unresolved issues to you. For data-sensitive tasks, agents surface confidence scores and flag anomalies. We optimize weekly to reduce errors and improve performance.",
  },
  {
    question: "Is this only for agencies?",
    answer:
      "No. While agencies were our starting point, ClawOps is built for any business that runs on workflows: service businesses, SaaS companies, e-commerce operations, consulting firms, and automation-heavy teams. If you have repeatable work that should be automated, we can handle it.",
  },
  {
    question: "What if I need multiple agents?",
    answer:
      "Most clients start with one high-impact role and expand once they see results. There's no minimum commitment. We can add roles as your operations scale — and we'll advise you on what's next based on what we see working.",
  },
  {
    question: "What's the pricing model?",
    answer:
      "Flat monthly retainer per agent role. We don't charge per task or per message. You get unlimited agent actions within your plan. Pricing starts based on complexity — we discuss this in the discovery call.",
  },
];

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

function FAQRow({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-[rgba(255,255,255,0.06)] last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left transition-colors hover:text-white"
        aria-expanded={isOpen}
      >
        <span className="text-base font-medium text-white/80">{item.question}</span>
        <span className={`flex-shrink-0 rounded-full p-1.5 transition-colors ${isOpen ? "bg-[rgba(0,212,255,0.15)] text-[#e8ff47]" : "bg-[rgba(255,255,255,0.06)] text-[rgba(255,255,255,0.4)]"}`}>
          {isOpen ? <MinusIcon /> : <PlusIcon />}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm leading-relaxed text-[rgba(255,255,255,0.5)]">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      ref={ref}
      id="faq"
      className="relative overflow-hidden bg-[#0a0a0a] px-6 py-20 md:py-28"
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
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 40% 40% at 50% 50%, rgba(102,0,255,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-10"
        >
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.45)]">
            FAQ
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-[-0.03em] text-white md:text-5xl">
            Questions, Answered
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.025)] px-6"
        >
          {faqs.map((item, i) => (
            <FAQRow
              key={i}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>

        {/* Still have questions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 rounded-2xl border border-[rgba(0,212,255,0.15)] bg-[rgba(0,212,255,0.04)] p-6 text-center"
        >
          <p className="text-white/80 text-sm">
            Still have questions?{" "}
            <a
              href="/auth/signup"
              className="text-[#e8ff47] underline underline-offset-2 hover:text-[#33DDFF] transition-colors"
            >
              Start for free
            </a>{" "}
            and we&apos;ll walk you through exactly how ClawOps would work for your setup.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
