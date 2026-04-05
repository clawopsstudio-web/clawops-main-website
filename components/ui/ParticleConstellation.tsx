"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  targetOpacity: number;
}

interface Props {
  className?: string;
  /** Particle count — keep low for performance */
  count?: number;
  /** Max line distance in px */
  connectionDistance?: number;
  /** Node base opacity */
  nodeOpacity?: number;
  /** Line opacity */
  lineOpacity?: number;
  /** Primary color — cyan */
  primaryColor?: string;
  /** Secondary color — violet */
  secondaryColor?: string;
}

export default function ParticleConstellation({
  className = "",
  count = 65,
  connectionDistance = 160,
  nodeOpacity = 0.7,
  lineOpacity = 0.12,
  primaryColor = "0, 212, 255",
  secondaryColor = "102, 0, 255",
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const dimsRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      dimsRef.current.w = window.innerWidth;
      dimsRef.current.h = window.innerHeight;
      canvas.width = dimsRef.current.w * dpr;
      canvas.height = dimsRef.current.h * dpr;
      canvas.style.width = dimsRef.current.w + "px";
      canvas.style.height = dimsRef.current.h + "px";
      ctx.scale(dpr, dpr);
      initParticles();
    }

    function initParticles() {
      const { w, h } = dimsRef.current;
      particlesRef.current = Array.from({ length: count }, () => {
        const isPrimary = Math.random() > 0.35;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          radius: isPrimary ? 1.5 + Math.random() * 0.8 : 0.8 + Math.random() * 0.5,
          opacity: nodeOpacity,
          targetOpacity: nodeOpacity,
        };
      });
    }

    function draw() {
      if (!ctx) return;
      const { w, h } = dimsRef.current;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      // Update positions
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Soft bounce at edges
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // Fade in/out near edges (keep particles readable)
        const margin = 80;
        const ex = Math.min(p.x / margin, (w - p.x) / margin, 1);
        const ey = Math.min(p.y / margin, (h - p.y) / margin, 1);
        p.targetOpacity = Math.min(ex, ey) * nodeOpacity + nodeOpacity * 0.3;
        p.opacity += (p.targetOpacity - p.opacity) * 0.04;
      }

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * lineOpacity;
            // Alternate colors: primary for close nodes, secondary for distant
            const color = dist < connectionDistance * 0.4
              ? `rgba(${primaryColor},${alpha})`
              : `rgba(${primaryColor},${alpha * 0.6})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const isPrimary = p.radius > 1.3;
        const color = isPrimary
          ? `rgba(${primaryColor},${p.opacity})`
          : `rgba(${primaryColor},${p.opacity * 0.55})`;

        // Glow for primary nodes
        if (isPrimary) {
          const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 5);
          grd.addColorStop(0, `rgba(${primaryColor},${p.opacity * 0.25})`);
          grd.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 5, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    resize();
    rafRef.current = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [count, connectionDistance, nodeOpacity, lineOpacity, primaryColor, secondaryColor]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
      }}
      aria-hidden="true"
    />
  );
}
