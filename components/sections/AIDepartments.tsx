"use client";

import type { ReactNode, SVGProps } from "react";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

type IconProps = {
  className?: string;
};

type Department = {
  title: string;
  badge: string;
  description: string;
  bullets: string[];
  Icon: ({ className }: IconProps) => ReactNode;
};

function IconBase({ className, children }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

function SearchIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </IconBase>
  );
}

function HeadphonesIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M3 13a9 9 0 0 1 18 0" />
      <path d="M21 14v3a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
      <path d="M3 14v3a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2Z" />
      <path d="M9 19a3 3 0 0 0 6 0" />
    </IconBase>
  );
}

function TrendingUpIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M22 7 13.5 15.5l-4-4L2 19" />
      <path d="M16 7h6v6" />
    </IconBase>
  );
}

function MegaphoneIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="m3 11 13-5v12L3 13z" />
      <path d="M16 8.5a4.5 4.5 0 0 0 0 7" />
      <path d="M6 13v4a2 2 0 0 0 2 2h1" />
    </IconBase>
  );
}

function SettingsIcon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2H9a1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1v.1a1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.2a1 1 0 0 0-.9.7Z" />
    </IconBase>
  );
}

function BarChart2Icon({ className }: IconProps) {
  return (
    <IconBase className={className}>
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M22 19v-3" />
      <path d="M3 19h19" />
    </IconBase>
  );
}

const departments: Department[] = [
  {
    title: "Research Agent",
    badge: "24/7",
    description: "Deep research, prospect intelligence, market mapping",
    bullets: ["Finds decision-makers", "Pulls company data", "Monitors markets"],
    Icon: SearchIcon,
  },
  {
    title: "Support Agent",
    badge: "Instant",
    description: "Handles inbound support, FAQs, and ticket triage",
    bullets: ["Instant responses", "Frees your team", "Tracks unresolved issues"],
    Icon: HeadphonesIcon,
  },
  {
    title: "Sales Agent",
    badge: "Always On",
    description: "Nurtures leads, follows up, qualifies prospects",
    bullets: ["Never loses a lead", "Qualifies around the clock", "Books calls for you"],
    Icon: TrendingUpIcon,
  },
  {
    title: "Marketing Agent",
    badge: "Multi-Channel",
    description: "Runs outreach, social, and content distribution",
    bullets: ["Multi-channel execution", "Follows your playbook", "Reports weekly"],
    Icon: MegaphoneIcon,
  },
  {
    title: "Operations Agent",
    badge: "Automated",
    description: "Manages workflows, approvals, and internal ops",
    bullets: ["Removes bottlenecks", "Automates approvals", "Keeps processes clean"],
    Icon: SettingsIcon,
  },
  {
    title: "Analytics Agent",
    badge: "Live Data",
    description: "Tracks performance, generates reports, surfaces insights",
    bullets: ["Real-time dashboards", "Actionable reports", "No manual data work"],
    Icon: BarChart2Icon,
  },
];

export default function AIDepartments() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-120px" });

  return (
    <section
      ref={sectionRef}
      id="ai-departments"
      className="relative overflow-hidden bg-[#04040c] px-4 pt-12 pb-24 md:px-6 md:pt-16 md:pb-32"
    >
      {/* Top gradient divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(102,0,255,0.3), transparent)",
        }}
      />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,212,255,0.1),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(102,0,255,0.12),transparent_30%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-10 max-w-3xl text-center md:mb-14"
        >
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-[rgba(255,255,255,0.5)]">
            AI DEPARTMENTS
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl md:text-6xl">
            Every Department. Fully Staffed.
          </h2>
          <p className="mt-5 text-lg text-[rgba(255,255,255,0.5)] max-w-xl mx-auto">
            Six specialized AI agents. One unified agency OS. Each one trained on how
            agencies actually operate.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((department, index) => {
            const { Icon } = department;

            return (
              <motion.article
                key={department.title}
                initial={{ opacity: 0, y: 32 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: index * 0.12, ease: "easeOut" }}
                className="group rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#00D4FF]"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.08)] text-[#00D4FF]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-[rgba(0,212,255,0.12)] px-2 py-1 text-xs font-medium tracking-[0.08em] text-[#8cecff]">
                    {department.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                    {department.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[rgba(255,255,255,0.5)] md:text-[15px]">
                    {department.description}
                  </p>
                </div>

                <ul className="mt-6 space-y-3">
                  {department.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-3 text-sm leading-6 text-[rgba(255,255,255,0.5)]"
                    >
                      <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#00D4FF]" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
