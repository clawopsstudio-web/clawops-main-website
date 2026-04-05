"use client";

import { useRef, useMemo } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import dynamic from "next/dynamic";

/* Dynamically import MissionControlBg (Canvas-based, no 3D) */
const MissionControlBg = dynamic(() => import("./MissionControlBg"), {
  ssr: false,
  loading: () => null,
});

interface Props {
  phase?: number;
  scrollProgress?: MotionValue<number>;
}

/* ─── Deterministic star field (no Math.random — avoids hydration mismatches) ─── */
function generateStars(count: number) {
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  return Array.from({ length: count }, (_, i) => {
    const g = 0.618033988749895;
    const x = ((i * g * 137.5) % 100).toFixed(2);
    const y = ((i * g * 97.3 + 11.7) % 100).toFixed(2);
    const size = rand() < 0.6 ? 1 : rand() < 0.85 ? 1.5 : 2;
    const baseOpacity = 0.15 + rand() * 0.35;
    const twinkleOffset = Math.floor(rand() * 4);
    const twinkleDuration = 3 + Math.floor(rand() * 4);

    return { x, y, size, baseOpacity, twinkleOffset, twinkleDuration, id: i };
  });
}

/**
 * CinematicBackground — layered visual system for the hero section.
 *
 * Layers (back to front):
 *   0  — Deep dark base
 *   1  — Dot grid
 *   2  — Star field (CSS twinkle)
 *   3  — Mission control Canvas (network graph, system panels, routing paths)
 *   4  — Primary gradient orb (phase-reactive, parallax)
 *   5  — Secondary gradient orb (counter-drift parallax)
 *   6  — Vignette (readability)
 *   7  — Bottom fade into next section
 *
 * Phase guide:
 *   0 = MESSAGE   — cyan, arrival energy
 *   1 = DELEGATE  — cyan to violet, team activates
 *   2 = ACTION    — violet, execution intensity
 *   3 = RESULT    — green, success completion
 */
export default function CinematicBackground({ phase = 0, scrollProgress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const stars = useMemo(() => generateStars(70), []);

  const phaseColors: Record<number, { primary: string; secondary: string; accent: string }> = {
    0: { primary: "rgba(0,212,255,0.07)", secondary: "rgba(102,0,255,0.04)", accent: "#00D4FF" },
    1: { primary: "rgba(0,212,255,0.09)", secondary: "rgba(0,212,255,0.05)", accent: "#00D4FF" },
    2: { primary: "rgba(102,0,255,0.09)", secondary: "rgba(0,212,255,0.04)", accent: "#6600FF" },
    3: { primary: "rgba(0,255,136,0.06)", secondary: "rgba(0,212,255,0.04)", accent: "#00FF88" },
  };

  const colors = phaseColors[phase] ?? phaseColors[0];

  const primaryOrbY = useTransform(scrollProgress ?? (0 as unknown as MotionValue<number>), [0, 1], [0, -28]);
  const primaryOrbX = useTransform(scrollProgress ?? (0 as unknown as MotionValue<number>), [0, 1], [0, 14]);
  const secondaryOrbY = useTransform(scrollProgress ?? (0 as unknown as MotionValue<number>), [0, 1], [0, 18]);
  const secondaryOrbX = useTransform(scrollProgress ?? (0 as unknown as MotionValue<number>), [0, 1], [0, -10]);

  const starColors: Record<number, string> = {
    0: "#b8e8ff",
    1: "#d0efff",
    2: "#d8c8ff",
    3: "#c8ffe8",
  };
  const starColor = starColors[phase] ?? starColors[0];

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Layer 0: Base */}
      <div className="absolute inset-0" style={{ background: "#04040c" }} />

      {/* Layer 1: Dot grid */}
      <div className="absolute inset-0 dot-grid opacity-40" />

      {/* Layer 2: Star field */}
      {stars.map((star) => {
        const twinkleClass = ["star-twinkle-1", "star-twinkle-2", "star-twinkle-3", "star-twinkle-4"][star.id % 4];
        return (
          <div
            key={star.id}
            className={`absolute rounded-full ${twinkleClass}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              backgroundColor: starColor,
              opacity: star.baseOpacity,
              animationDelay: `${star.twinkleOffset * -1 * (star.twinkleDuration / 4)}s`,
              animationDuration: `${star.twinkleDuration}s`,
            }}
          />
        );
      })}

      {/* Layer 3: Mission control Canvas — network graph, system panels, routing paths */}
      <MissionControlBg phase={phase} scrollProgress={scrollProgress} />

      {/* Layer 4: Primary orb — parallax */}
      <motion.div
        key={phase}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute"
        style={{
          top: "10%",
          left: "50%",
          x: primaryOrbX,
          y: primaryOrbY,
          width: "70vw",
          height: "60vh",
          background: `radial-gradient(ellipse 65% 55% at 50% 50%, ${colors.primary} 0%, transparent 70%)`,
          filter: "blur(40px)",
          transition: "background 0.8s ease",
        }}
      />

      {/* Layer 5: Secondary orb — counter-drift */}
      <motion.div
        key={`sec-${phase}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="absolute"
        style={{
          bottom: "5%",
          right: "5%",
          x: secondaryOrbX,
          y: secondaryOrbY,
          width: "40vw",
          height: "40vh",
          background: `radial-gradient(ellipse 60% 60% at 60% 40%, ${colors.secondary} 0%, transparent 70%)`,
          filter: "blur(60px)",
          transition: "background 0.8s ease",
        }}
      />

      {/* Layer 6: Vignette — readability */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 72% 55% at 50% 45%, transparent 0%, rgba(4,4,12,0.35) 45%, rgba(4,4,12,0.82) 80%, rgba(4,4,12,0.96) 100%)",
        }}
      />

      {/* Layer 7: Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: "180px",
          background: "linear-gradient(to bottom, transparent, #04040c)",
        }}
      />
    </div>
  );
}
