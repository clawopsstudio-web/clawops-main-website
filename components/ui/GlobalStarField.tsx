"use client";

import { useMemo } from "react";

/* ─── Deterministic star field (seeded LCG — consistent SSR + client) ─── */
interface Star {
  id: number;
  x: string;
  y: string;
  size: number;
  baseOpacity: number;
  twinkleClass: string;
  animationDelay: string;
  animationDuration: string;
}

function generateStars(count: number): Star[] {
  let seed = 137; // different seed from CinematicBackground for variety
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  return Array.from({ length: count }, (_, i) => {
    const g = 0.618033988749895;
    const x = ((i * g * 137.5) % 100).toFixed(2);
    const y = ((i * g * 97.3 + 11.7) % 100).toFixed(2);

    // Mostly tiny dots, very few slightly-larger ones
    const r = rand();
    const size = r < 0.75 ? 1 : r < 0.92 ? 1.5 : 2;

    // Very low base opacity — ambient, not distracting
    const baseOpacity = 0.06 + rand() * 0.12; // 0.06 – 0.18

    const twinkleIdx = i % 4;
    const twinkleClasses = [
      "star-twinkle-1",
      "star-twinkle-2",
      "star-twinkle-3",
      "star-twinkle-4",
    ];
    const twinkleClass = twinkleClasses[twinkleIdx];

    const duration = (3 + (i % 4)).toFixed(1); // 3–6s
    const delay = (-1 * ((i * 7) % 100) / 100 * parseFloat(duration)).toFixed(2); // staggered negative delay

    return {
      id: i,
      x: `${x}%`,
      y: `${y}%`,
      size,
      baseOpacity,
      twinkleClass,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    };
  });
}

/**
 * GlobalStarField — fixed-position star layer that persists across the entire page.
 *
 * Design goals:
 * - Ultra-subtle: opacity 0.06–0.18, size 1–2px
 * - No parallax (fixed, not sticky) — no jitter, no motion sickness
 * - No JS animation loops — CSS-only via existing twinkle keyframes
 * - Fixed z-index 0 — sits behind all content
 * - pointer-events: none — never interferes with user interaction
 *
 * Placed in root layout so it covers all sections (including non-hero pages).
 */
export default function GlobalStarField() {
  const stars = useMemo(() => generateStars(80), []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ background: "#04040c" }}
    >
      {/* Subtle dot grid as a second ambient layer */}
      <div
        className="absolute inset-0 dot-grid"
        style={{ opacity: 0.12 }}
      />

      {stars.map((star) => (
        <div
          key={star.id}
          className={`absolute rounded-full ${star.twinkleClass}`}
          style={{
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            opacity: star.baseOpacity,
            animationDelay: star.animationDelay,
            animationDuration: star.animationDuration,
            // Slight warm/cool variation for depth
            backgroundColor:
              star.id % 5 === 0 ? "#e8d8ff" :
              star.id % 7 === 0 ? "#d8f8ff" :
              "#d0eeff",
          }}
        />
      ))}
    </div>
  );
}
