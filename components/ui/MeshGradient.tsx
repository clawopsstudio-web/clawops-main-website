"use client";
import { useEffect, useRef } from "react";

export default function MeshGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = () => {
      if (!ctx || !canvas) return;
      time += 0.005;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark base
      ctx.fillStyle = "#050510";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated blob 1 - top left
      const blob1X = canvas.width * (0.2 + Math.sin(time * 0.7) * 0.1);
      const blob1Y = canvas.height * (0.3 + Math.cos(time * 0.5) * 0.1);
      const gradient1 = ctx.createRadialGradient(
        blob1X, blob1Y, 0,
        blob1X, blob1Y, canvas.width * 0.5
      );
      gradient1.addColorStop(0, "rgba(0, 212, 255, 0.12)");
      gradient1.addColorStop(0.4, "rgba(0, 100, 200, 0.05)");
      gradient1.addColorStop(1, "transparent");
      ctx.fillStyle = gradient1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated blob 2 - bottom right
      const blob2X = canvas.width * (0.75 + Math.cos(time * 0.6) * 0.08);
      const blob2Y = canvas.height * (0.7 + Math.sin(time * 0.8) * 0.1);
      const gradient2 = ctx.createRadialGradient(
        blob2X, blob2Y, 0,
        blob2X, blob2Y, canvas.width * 0.45
      );
      gradient2.addColorStop(0, "rgba(0, 150, 255, 0.08)");
      gradient2.addColorStop(0.5, "rgba(0, 80, 160, 0.03)");
      gradient2.addColorStop(1, "transparent");
      ctx.fillStyle = gradient2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Animated blob 3 - center
      const blob3X = canvas.width * (0.5 + Math.sin(time * 0.9) * 0.12);
      const blob3Y = canvas.height * (0.5 + Math.cos(time * 0.4) * 0.08);
      const gradient3 = ctx.createRadialGradient(
        blob3X, blob3Y, 0,
        blob3X, blob3Y, canvas.width * 0.35
      );
      gradient3.addColorStop(0, "rgba(100, 0, 255, 0.05)");
      gradient3.addColorStop(0.6, "rgba(50, 0, 150, 0.02)");
      gradient3.addColorStop(1, "transparent");
      ctx.fillStyle = gradient3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: "none" }}
    />
  );
}
