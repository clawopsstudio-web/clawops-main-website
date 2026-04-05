"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "framer-motion";

type AgentStatus = "Active" | "Idle";

type AgentRow = {
  name: string;
  status: AgentStatus;
  tasks: string;
  updated: string;
};

type Metric = {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
};

const agentRows: AgentRow[] = [
  { name: "Research Agent", status: "Active", tasks: "34 tasks today", updated: "2m ago" },
  { name: "Support Agent", status: "Active", tasks: "89 tasks today", updated: "12s ago" },
  { name: "Sales Agent", status: "Active", tasks: "56 tasks today", updated: "0m ago" },
  { name: "Marketing Agent", status: "Idle", tasks: "23 tasks today", updated: "18m ago" },
  { name: "Operations Agent", status: "Active", tasks: "41 tasks today", updated: "5m ago" },
  { name: "Analytics Agent", status: "Active", tasks: "12 reports", updated: "1h ago" },
];

const metrics: Metric[] = [
  { value: 247, label: "tasks this week" },
  { value: 98.2, suffix: "%", decimals: 1, label: "uptime" },
  { value: 30, prefix: "< ", suffix: "s", label: "avg response" },
];

function CountUpNumber({
  value,
  label,
  prefix = "",
  suffix = "",
  decimals = 0,
  isInView,
}: Metric & { isInView: boolean }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(Number(latest.toFixed(decimals)));
      },
    });

    return () => controls.stop();
  }, [decimals, isInView, value]);

  const formatted =
    decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();

  return (
    <div className="text-center">
      <div className="bg-[linear-gradient(135deg,#00D4FF,#6600FF)] bg-clip-text text-[40px] font-semibold tracking-[-0.05em] text-transparent md:text-[48px]">
        {prefix}
        {formatted}
        {suffix}
      </div>
      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[rgba(255,255,255,0.5)]">
        {label}
      </p>
    </div>
  );
}

export default function MissionControl() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-120px" });

  return (
    <section
      ref={sectionRef}
      id="mission-control"
      className="relative overflow-hidden bg-[#04040c] px-4 pt-12 pb-24 md:pt-16 md:pb-32"
    >
      {/* Top gradient divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), rgba(102,0,255,0.3), transparent)",
        }}
      />
      <div className="absolute inset-0 opacity-100 pointer-events-none [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(0,212,255,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(102,0,255,0.14),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto mb-14 max-w-3xl text-center md:mb-16"
        >
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-[rgba(255,255,255,0.5)]">
            MISSION CONTROL
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-4xl md:text-5xl">
            Real-Time Agency Intelligence
          </h2>
          <p className="mt-5 text-lg text-[rgba(255,255,255,0.5)] max-w-xl mx-auto">
            Watch every agent in real-time. See tasks completed, response times, and
            throughput — all in one live dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_24px_80px_rgba(0,0,0,0.45)]"
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background:repeating-linear-gradient(180deg,rgba(255,255,255,0.18)_0px,rgba(255,255,255,0.18)_1px,transparent_1px,transparent_4px)]" />

          <div className="relative border-b border-[rgba(255,255,255,0.06)] bg-[#070712] px-5 py-4 md:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-white">
                  System Status
                </h3>
                <motion.span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full bg-[#00FF88] shadow-[0_0_16px_rgba(0,255,136,0.8)]"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.85, 1, 0.85] }}
                  transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                />
              </div>
              <p className="text-sm text-[rgba(255,255,255,0.6)]">All agents operational</p>
            </div>
          </div>

          <div className="relative bg-[rgba(3,3,10,0.84)]">
            {agentRows.map((row, index) => {
              const isActive = row.status === "Active";
              const statusColor = isActive ? "#00FF88" : "#00D4FF";

              return (
                <motion.div
                  key={row.name}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.1 + index * 0.08, ease: "easeOut" }}
                  className="flex flex-col gap-3 border-b border-[rgba(255,255,255,0.04)] px-5 py-3 transition-colors duration-300 hover:bg-[rgba(255,255,255,0.02)] md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white md:text-[15px]">{row.name}</p>
                  </div>

                  <div className="flex min-w-0 flex-wrap items-center gap-4 md:justify-end">
                    <div className="flex items-center gap-2 text-sm text-[rgba(255,255,255,0.74)]">
                      <motion.span
                        aria-hidden="true"
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: statusColor, boxShadow: `0 0 14px ${statusColor}` }}
                        animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: isActive ? 1.5 : 2.1, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      />
                      <span>{row.status}</span>
                    </div>
                    <span className="text-sm text-[rgba(255,255,255,0.5)]">{row.tasks}</span>
                    <span className="text-sm text-[rgba(255,255,255,0.38)]">{row.updated}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
          className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-4 px-4 py-6 sm:gap-6 md:flex-row md:gap-10"
        >
          {metrics.map((metric) => (
            <CountUpNumber key={metric.label} {...metric} isInView={isInView} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
