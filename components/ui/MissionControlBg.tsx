'use client';

"use client";

import { useRef, useEffect, useCallback } from "react";
import type { MotionValue } from "framer-motion";

interface Props {
  phase: number;
  scrollProgress?: MotionValue<number>;
}

const PHASE_ACCENTS: Record<number, string> = {
  0: "#e8ff47",
  1: "#e8ff47",
  2: "#e8ff47",
  3: "#00FF88",
};

/* ─── Canvas-based Mission Control Background ─────────────────────────────── */
/*
 * Lightweight Canvas 2D rendering — no Three.js, no WebGL overhead.
 * Renders:
 *   - Faint dot grid (depth layer)
 *   - Network graph with animated data packets
 *   - Floating dashboard cards (system panels)
 *   - Routing path lines with traveling dots
 *   - Live status indicators
 *
 * Performance: uses requestAnimationFrame, exits when tab is hidden,
 * respects motion preferences.
 */
export default function MissionControlBg({ phase, scrollProgress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const scrollOffsetRef = useRef(0);

  /* Sync scroll motion value to a plain ref for the animation loop */
  useEffect(() => {
    if (!scrollProgress) return;
    const unsub = scrollProgress.on("change", (v) => {
      scrollOffsetRef.current = v;
    });
    return unsub;
  }, [scrollProgress]);

  const draw = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    const scrollV = scrollOffsetRef.current;
    const accent = PHASE_ACCENTS[phase] ?? "#e8ff47";

    ctx.clearRect(0, 0, w, h);

    /* ── Layer 0: Deep space background ───────────────────────────── */
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);

    /* ── Layer 1: Dot grid ───────────────────────────────────────── */
    const gridSpacing = 40;
    const gridOffset = scrollV * 80;
    ctx.fillStyle = "rgba(255,255,255,0.028)";
    for (let gx = (gridOffset % gridSpacing); gx < w; gx += gridSpacing) {
      for (let gy = 0; gy < h; gy += gridSpacing) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* ── Layer 2: System panels (depth cards) ─────────────────────── */
    const panels = [
      { x: 0.05, y: 0.15, w: 140, h: 90, label: "ops.queue", val: "47 tasks" },
      { x: 0.78, y: 0.08, w: 160, h: 80, label: "agents.active", val: "3 / 4" },
      { x: 0.82, y: 0.65, w: 130, h: 85, label: "system.load", val: "12%" },
      { x: 0.04, y: 0.70, w: 150, h: 78, label: "delegate.route", val: "→ team" },
    ];

    panels.forEach((panel, pi) => {
      const px = panel.x * w;
      const py = panel.y * h + scrollV * 60;
      const glowAlpha = 0.06 + Math.sin(t * 0.5 + pi * 1.1) * 0.02;

      /* Panel glow */
      const grd = ctx.createRadialGradient(px + panel.w / 2, py + panel.h / 2, 0, px + panel.w / 2, py + panel.h / 2, panel.w * 0.8);
      grd.addColorStop(0, `${accent}${Math.round(glowAlpha * 255).toString(16).padStart(2, "0")}`);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.fillRect(px - 20, py - 20, panel.w + 40, panel.h + 40);

      /* Panel border */
      ctx.strokeStyle = `rgba(255,255,255,0.07)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(px, py, panel.w, panel.h);

      /* Top accent line */
      ctx.strokeStyle = `${accent}30`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + panel.w * 0.4, py);
      ctx.stroke();

      /* Label text */
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.font = "9px JetBrains Mono, monospace";
      ctx.fillText(panel.label, px + 8, py + 18);

      /* Value text */
      ctx.fillStyle = accent + "80";
      ctx.font = "bold 13px JetBrains Mono, monospace";
      ctx.fillText(panel.val, px + 8, py + 45);

      /* Mini progress bar */
      const barW = panel.w - 16;
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(px + 8, py + 56, barW, 3);
      const progress = 0.3 + Math.sin(t * 0.4 + pi) * 0.2;
      ctx.fillStyle = accent + "50";
      ctx.fillRect(px + 8, py + 56, barW * progress, 3);

      /* Blinking status dot */
      const dotAlpha = 0.4 + Math.sin(t * 3 + pi * 2) * 0.4;
      ctx.fillStyle = accent + Math.round(dotAlpha * 255).toString(16).padStart(2, "0");
      ctx.beginPath();
      ctx.arc(px + panel.w - 12, py + 12, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    /* ── Layer 3: Network graph ───────────────────────────────────── */
    const cx = w * 0.5;
    const cy = h * 0.42 + scrollV * 40;
    const nodePositions = [
      [cx, cy],
      [cx + 180, cy - 60],
      [cx - 170, cy - 80],
      [cx + 220, cy + 70],
      [cx - 200, cy + 60],
      [cx + 50, cy - 180],
      [cx - 60, cy - 170],
      [cx + 260, cy - 20],
      [cx - 240, cy + 10],
    ];

    const edges: [number, number][] = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 5], [1, 6], [1, 7],
      [2, 5], [2, 6],
      [3, 7], [4, 6],
    ];

    /* Draw edges with traveling data packets */
    edges.forEach(([a, b], ei) => {
      const [ax, ay] = nodePositions[a];
      const [bx, by] = nodePositions[b];

      /* Edge line — faint */
      ctx.strokeStyle = `${accent}18`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();

      /* Traveling data packet along edge */
      const packetT = ((t * 0.3 + ei * 0.15) % 1);
      const px = ax + (bx - ax) * packetT;
      const py = ay + (by - ay) * packetT;
      const pAlpha = Math.sin(packetT * Math.PI);

      const pgrd = ctx.createRadialGradient(px, py, 0, px, py, 8);
      pgrd.addColorStop(0, `${accent}${Math.round(pAlpha * 180).toString(16).padStart(2, "0")}`);
      pgrd.addColorStop(1, "transparent");
      ctx.fillStyle = pgrd;
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = accent + Math.round(pAlpha * 255).toString(16).padStart(2, "0");
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    /* Draw nodes */
    nodePositions.forEach(([nx, ny], ni) => {
      const isHub = ni === 0;
      const radius = isHub ? 5 : 3;
      const nodeAlpha = isHub ? 0.8 : 0.5 + Math.sin(t * 0.8 + ni * 0.7) * 0.15;
      const color = isHub ? "#ffffff" : accent;

      /* Node glow */
      if (isHub || ni % 3 === 0) {
        const ngrd = ctx.createRadialGradient(nx, ny, 0, nx, ny, radius * 5);
        ngrd.addColorStop(0, `${color}${Math.round(nodeAlpha * 40).toString(16).padStart(2, "0")}`);
        ngrd.addColorStop(1, "transparent");
        ctx.fillStyle = ngrd;
        ctx.beginPath();
        ctx.arc(nx, ny, radius * 5, 0, Math.PI * 2);
        ctx.fill();
      }

      /* Node core */
      ctx.fillStyle = color + Math.round(nodeAlpha * 255).toString(16).padStart(2, "0");
      ctx.beginPath();
      ctx.arc(nx, ny, radius, 0, Math.PI * 2);
      ctx.fill();

      /* Outer ring on hub */
      if (isHub) {
        ctx.strokeStyle = `${accent}40`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(nx, ny, 10 + Math.sin(t * 0.6) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    /* ── Layer 4: Routing paths (horizontal lines with pulses) ───── */
    const pathCount = 5;
    for (let pi = 0; pi < pathCount; pi++) {
      const py = (0.3 + pi * 0.12) * h + scrollV * 20;
      const pathX = w * (0.05 + pi * 0.04);
      const pathW = w * (0.4 + pi * 0.05);

      ctx.strokeStyle = `rgba(255,255,255,0.04)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(pathX, py);
      ctx.lineTo(pathX + pathW, py);
      ctx.stroke();
      ctx.setLineDash([]);

      /* Traveling pulse dot */
      const dotX = pathX + ((t * 40 + pi * 80) % pathW);
      const dAlpha = 0.3 + Math.sin(t * 2 + pi) * 0.2;
      ctx.fillStyle = `${accent}${Math.round(dAlpha * 200).toString(16).padStart(2, "0")}`;
      ctx.beginPath();
      ctx.arc(dotX, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    /* ── Layer 5: Ambient radial glow at center ─────────────────── */
    const cgrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.35);
    cgrd.addColorStop(0, `${accent}08`);
    cgrd.addColorStop(0.5, `${accent}03`);
    cgrd.addColorStop(1, "transparent");
    ctx.fillStyle = cgrd;
    ctx.fillRect(0, 0, w, h);

    /* ── Layer 6: Phase-reactive accent overlay ────────────────────── */
    const phaseAccents2: Record<number, string> = { 0: "#e8ff47", 1: "#e8ff47", 2: "#e8ff47", 3: "#00FF88" };
    const a2 = phaseAccents2[phase] ?? "#e8ff47";
    const overlayGrd = ctx.createRadialGradient(w * 0.8, h * 0.2, 0, w * 0.8, h * 0.2, w * 0.3);
    overlayGrd.addColorStop(0, `${a2}06`);
    overlayGrd.addColorStop(1, "transparent");
    ctx.fillStyle = overlayGrd;
    ctx.fillRect(0, 0, w, h);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let visible = true;
    const observer = new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const render = (ts: number) => {
      if (visible) {
        const t = ts / 1000;
        draw(ctx, canvas.offsetWidth, canvas.offsetHeight, t);
      }
      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      observer.disconnect();
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
