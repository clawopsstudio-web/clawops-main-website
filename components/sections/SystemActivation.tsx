"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Panel = {
  id: string;
  label: string;
  x: string;
  y: string;
};

const panels: Panel[] = [
  { id: "email", label: "Email", x: "14%", y: "22%" },
  { id: "chat", label: "Chat", x: "68%", y: "18%" },
  { id: "calendar", label: "Calendar", x: "18%", y: "66%" },
  { id: "crm", label: "CRM", x: "70%", y: "62%" },
];

const phaseContent = {
  1: {
    title: "Fragmented Workflows",
    body: "Email, chat, scheduling, and CRM all run in separate silos. Your team becomes the middleware.",
  },
  2: {
    title: "Agents Come Online",
    body: "AI workers connect your tools, trigger actions instantly, and remove the lag between systems.",
  },
  3: {
    title: "Mission Control Active",
    body: "Your agency runs — even when you sleep.",
  },
} as const;

function PanelIcon({ id }: { id: string }) {
  const icons: Record<string, ReactNode> = {
    email: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M4 7L12 13L20 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
    chat: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M8 17L4 20V7C4 5.895 4.895 5 6 5H18C19.105 5 20 5.895 20 7V15C20 16.105 19.105 17 18 17H8Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <rect x="4" y="6" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 4V8M16 4V8M4 10H20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    crm: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M7 7H11V11H7V7ZM13 7H17V11H13V7ZM7 13H11V17H7V13ZM13 13H17V17H13V13Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return icons[id] ?? null;
}

function AgentNode({ className = "" }: { className?: string }) {
  return (
    <div className={`sa-agent-node flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.12)] text-[#00D4FF] shadow-[0_0_30px_rgba(0,212,255,0.18)] ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path d="M12 3L18.5 6.75V14.25L12 18L5.5 14.25V6.75L12 3Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9.5 10.5H14.5M9.5 13.5H12.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function SystemActivation() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const agentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<SVGSVGElement>(null);
  const phaseRef = useRef<1 | 2 | 3>(1);
  const phaseLabelRef = useRef<HTMLDivElement>(null);
  const phaseTitleRef = useRef<HTMLHeadingElement>(null);
  const phaseBodyRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !pinnedRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const section = sectionRef.current;
    const pin = pinnedRef.current;

    // Phase content refs map
    const phaseElements = {
      label: phaseLabelRef.current,
      title: phaseTitleRef.current,
      body: phaseBodyRef.current,
    };

    // Build the GSAP timeline — no Framer Motion, no dual animation systems
    // Only one animation driver: GSAP ScrollTrigger
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=150%",
        pin: pin,
        scrub: 0.9,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const prog = self.progress;
          const p = prog < 0.33 ? 1 : prog < 0.66 ? 2 : 3;

          // Update progress bar — direct DOM write, no animation library overhead
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${Math.max(prog * 100, 4)}%`;
          }

          // Only update phase text when phase actually changes
          if (p !== phaseRef.current) {
            phaseRef.current = p;
            // Fade out/in phase content with a quick GSAP tween
            gsap.to([phaseElements.label, phaseElements.title, phaseElements.body], {
              opacity: 0,
              y: 12,
              duration: 0.18,
              onComplete: () => {
                if (phaseElements.label) phaseElements.label.textContent = `Phase ${p}`;
                if (phaseElements.title) phaseElements.title.textContent = phaseContent[p].title;
                if (phaseElements.body) phaseElements.body.textContent = phaseContent[p].body;
                gsap.to([phaseElements.label, phaseElements.title, phaseElements.body], {
                  opacity: 1,
                  y: 0,
                  duration: 0.3,
                  ease: "power2.out",
                });
              },
            });
          }
        },
      },
    });

    // Phase 1: Chaos cluster is present, panels gently pulse (CSS only)
    tl.to(".sa-chaos-cluster", { opacity: 1, duration: 0.01 }, 0);

    // Transition 1→2: Network lines appear, agents fade in, panels turn green
    tl.to(".sa-network-lines", { opacity: 1, duration: 0.01 }, 0.18);
    tl.to(".sa-agent-node", { opacity: 1, scale: 1, duration: 0.01, stagger: 0.04 }, 0.21);
    tl.to(".sa-panel-status", { backgroundColor: "#22c55e", boxShadow: "0 0 16px #22c55e80", duration: 0.01, stagger: 0.04 }, 0.22);

    // Transition 2→3: Dashboard fades in, chaos cluster fades out
    tl.to(".sa-dashboard", { opacity: 1, duration: 0.01 }, 0.5);
    tl.to(".sa-chaos-cluster", { opacity: 0, duration: 0.01 }, 0.5);
    tl.to(".sa-network-lines", { opacity: 0.15, duration: 0.01 }, 0.5);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="system-activation"
      className="relative min-h-[300vh] bg-[#080814]"
    >
      <div ref={pinnedRef} className="relative flex h-screen items-center justify-center overflow-hidden">
        {/* Background atmosphere */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.05),transparent_45%)]" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Bottom fade — smooth transition into Capabilities section */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-30"
          style={{
            height: "60px",
            background: "linear-gradient(to bottom, transparent, #080814)",
          }}
        />

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4">
          {/* Section header */}
          <div className="text-center px-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40 sm:text-xs">
              SYSTEM ACTIVATION
            </p>
            <h2 className="mt-3 text-[clamp(1.5rem,4vw,2rem)] font-bold tracking-[-0.04em] text-white sm:mt-4 md:text-6xl">
              From Chaos to Connected Agency
            </h2>
          </div>

          {/* Main visual stage — responsive height */}
          <div className="relative mt-6 h-[340px] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] sm:mt-10 sm:h-[440px] sm:rounded-[32px] md:h-[520px]">

            {/* Network connection lines — NO drop-shadow filter, plain stroke only */}
            <svg
              ref={linesRef}
              className="sa-network-lines absolute inset-0 h-full w-full opacity-0"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
              style={{ pointerEvents: "none" }}
            >
              <line x1="24%" y1="30%" x2="50%" y2="50%" stroke="#00D4FF" strokeWidth="0.3" strokeDasharray="3 3" />
              <line x1="76%" y1="26%" x2="50%" y2="50%" stroke="#00D4FF" strokeWidth="0.3" strokeDasharray="3 3" />
              <line x1="28%" y1="73%" x2="50%" y2="50%" stroke="#00D4FF" strokeWidth="0.3" strokeDasharray="3 3" />
              <line x1="77%" y1="69%" x2="50%" y2="50%" stroke="#00D4FF" strokeWidth="0.3" strokeDasharray="3 3" />
              <line x1="24%" y1="30%" x2="76%" y2="26%" stroke="#00D4FF" strokeWidth="0.2" strokeDasharray="3 3" opacity="0.5" />
              <line x1="28%" y1="73%" x2="77%" y2="69%" stroke="#00D4FF" strokeWidth="0.2" strokeDasharray="3 3" opacity="0.5" />
            </svg>

            {/* Chaos cluster: tool panels floating */}
            <div className="sa-chaos-cluster sa-chaos-cluster--mobile absolute inset-0 opacity-100" style={{ transition: "opacity 0.3s" }}>
              {panels.map((panel, index) => (
                <div
                  key={panel.id}
                  ref={(el) => { panelRefs.current[index] = el; }}
                  className="sa-panel absolute w-[148px] rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 backdrop-blur-sm sm:w-[160px] sm:p-4"
                  style={{
                    left: panel.x,
                    top: panel.y,
                    animationName: "panelJiggle",
                    animationDuration: `${3.2 + index * 0.4}s`,
                    animationTimingFunction: "easeInOut",
                    animationIterationCount: "infinite",
                    animationPlayState: "running",
                    boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-white sm:h-10 sm:w-10">
                      <PanelIcon id={panel.id} />
                    </div>
                    <span
                      className="sa-panel-status h-2 w-2 rounded-full bg-red-500 transition-all duration-700 sm:h-2.5 sm:w-2.5"
                      style={{ boxShadow: "0 0 12px rgba(239,68,68,0.6)" }}
                    />
                  </div>
                  <div className="mt-4 sm:mt-5">
                    <p className="text-xs font-semibold text-white sm:text-sm">{panel.label}</p>
                    <p className="sa-panel-state mt-1 text-[10px] uppercase tracking-[0.2em] text-white/40 sm:text-xs">
                      Offline
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Agent nodes — positioned at network hubs */}
            <div ref={(el) => { agentRefs.current[0] = el; }} className="sa-agent-node absolute left-[43%] top-[17%] opacity-0" style={{ transform: "scale(0.7)" }}>
              <AgentNode />
            </div>
            <div ref={(el) => { agentRefs.current[1] = el; }} className="sa-agent-node absolute left-[54%] top-[35%] opacity-0" style={{ transform: "scale(0.7)" }}>
              <AgentNode />
            </div>
            <div ref={(el) => { agentRefs.current[2] = el; }} className="sa-agent-node absolute left-[39%] top-[56%] opacity-0" style={{ transform: "scale(0.7)" }}>
              <AgentNode />
            </div>

            {/* Mission Control dashboard — final state */}
            <div
              ref={dashboardRef}
              className="sa-dashboard absolute left-1/2 top-1/2 w-[min(90%,440px)] -translate-x-1/2 -translate-y-1/2 opacity-0"
            >
              <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.04] p-5 shadow-[0_30px_100px rgba(0,0,0,0.5)] backdrop-blur-sm">
                <div className="grid grid-cols-3 gap-3">
                  {/* Live throughput chart */}
                  <div className="col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">Live Throughput</p>
                    <div className="mt-3 flex h-24 items-end gap-1">
                      {[40, 65, 45, 80, 60, 90, 70, 85, 55, 75, 95, 68, 78, 88, 60].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm bg-gradient-to-t from-[#6600FF]/60 to-[#00D4FF]/60"
                          style={{ height: `${h}%`, opacity: 0.7 + (i / 15) * 0.3 }}
                        />
                      ))}
                    </div>
                  </div>
                  {/* Agent count */}
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/40">Agents</p>
                    <p className="mt-3 text-3xl font-bold text-[#00D4FF]">12</p>
                    <p className="mt-1 text-xs text-white/40">online</p>
                  </div>
                  {/* Metric bars */}
                  {[
                    { label: "Sales", pct: 82, color: "#00D4FF" },
                    { label: "Support", pct: 76, color: "#6600FF" },
                    { label: "Ops", pct: 91, color: "rgba(255,255,255,0.7)" },
                  ].map((m) => (
                    <div key={m.label} className="flex flex-col justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs uppercase tracking-[0.14em] text-white/40">{m.label}</p>
                        <span className="text-xs font-semibold text-white/70">{m.pct}%</span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${m.pct}%`, background: m.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Phase narrative footer */}
            <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6 md:p-8">
              <div className="mx-auto max-w-2xl rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 text-center backdrop-blur-sm sm:rounded-3xl sm:px-6 sm:py-5">
                <p ref={phaseLabelRef} className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 sm:text-xs sm:tracking-[0.24em]">
                  Phase 1
                </p>
                <h3 ref={phaseTitleRef} className="mt-1 text-lg font-semibold text-white sm:mt-2 sm:text-2xl">
                  {phaseContent[1].title}
                </h3>
                <p ref={phaseBodyRef} className="mt-1.5 text-xs leading-5 text-white/45 sm:mt-2 sm:text-sm sm:leading-6">
                  {phaseContent[1].body}
                </p>
              </div>

              {/* Scroll progress bar */}
              <div className="mx-auto mt-3 h-1 w-full max-w-md overflow-hidden rounded-full bg-white/[0.06] sm:mt-4 sm:h-1.5">
                <div
                  ref={progressBarRef}
                  className="h-full rounded-full"
                  style={{
                    width: "4%",
                    background: "linear-gradient(90deg, #00D4FF, #6600FF)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS-only jiggle animation for chaos panels — no JS, no layout thrash */}
      <style>{`
        @keyframes panelJiggle {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-3px, 2px); }
          40% { transform: translate(2px, -2px); }
          60% { transform: translate(-2px, 1px); }
          80% { transform: translate(1px, -1px); }
        }

        /* Responsive chaos cluster: tighter on mobile */
        @media (max-width: 639px) {
          /* Collapse chaos cluster to a centered 2x2 grid on small screens */
          .sa-chaos-cluster .sa-panel:nth-child(1) { left: 8% !important; top: 8% !important; }
          .sa-chaos-cluster .sa-panel:nth-child(2) { left: auto !important; right: 8% !important; top: 8% !important; }
          .sa-chaos-cluster .sa-panel:nth-child(3) { left: 8% !important; top: auto !important; bottom: 36% !important; }
          .sa-chaos-cluster .sa-panel:nth-child(4) { left: auto !important; right: 8% !important; top: auto !important; bottom: 36% !important; }

          /* Agent nodes scale down on mobile */
          .sa-agent-node { transform: scale(0.55) !important; }

          /* Dashboard fits better on mobile */
          .sa-dashboard { width: 90% !important; }
        }

        /* Medium breakpoints for panels */
        @media (min-width: 640px) and (max-width: 1023px) {
          .sa-chaos-cluster .sa-panel { width: 140px !important; }
          .sa-agent-node { transform: scale(0.6) !important; }
        }
      `}</style>
    </section>
  );
}
