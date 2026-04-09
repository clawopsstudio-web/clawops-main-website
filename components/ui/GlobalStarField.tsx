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
  let seed = 137;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (seed >>> 0) / 0xffffffff;
  };

  return Array.from({ length: count }, (_, i) => {
    const g = 0.618033988749895;
    const x = ((i * g * 137.5) % 100).toFixed(2);
    const y = ((i * g * 97.3 + 11.7) % 100).toFixed(2);
    const r = rand();
    const size = r < 0.75 ? 1 : r < 0.92 ? 1.5 : 2;
    const baseOpacity = 0.06 + rand() * 0.12;
    const twinkleIdx = i % 4;
    const twinkleClasses = ["star-twinkle-1", "star-twinkle-2", "star-twinkle-3", "star-twinkle-4"];
    const duration = (3 + (i % 4)).toFixed(1);
    const delay = (-1 * ((i * 7) % 100) / 100 * parseFloat(duration)).toFixed(2);

    return {
      id: i, x: `${x}%`, y: `${y}%`, size, baseOpacity,
      twinkleClass: twinkleClasses[twinkleIdx],
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    };
  });
}

/**
 * GlobalStarField — fixed star + subtle dot-grid layer behind all content.
 * NO solid background — lets the body's bg color show through.
 * pointer-events: none — never blocks clicks.
 */
export default function GlobalStarField() {
  const stars = useMemo(() => generateStars(80), []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Subtle dot grid — very faint */}
      <div
        className="absolute inset-0 dot-grid"
        style={{ opacity: 0.06 }}
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
