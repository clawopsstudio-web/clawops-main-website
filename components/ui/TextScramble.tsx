"use client";
import { useEffect, useRef, useState } from "react";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

interface TextScrambleProps {
  text: string;
  className?: string;
  delay?: number;
}

export default function TextScramble({ text, className = "", delay = 0 }: TextScrambleProps) {
  const [displayText, setDisplayText] = useState("");
  const frameRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const startTime = Date.now() + delay;

    const frames = 40;

    const animate = () => {
      if (cancelled) return;
      const now = Date.now();
      if (now < startTime) {
        requestAnimationFrame(animate);
        return;
      }

      frameRef.current++;
      const progress = Math.min(frameRef.current / frames, 1);
      const revealedCount = Math.floor(progress * text.length);

      let result = "";
      for (let i = 0; i < text.length; i++) {
        if (i < revealedCount) {
          result += text[i];
        } else if (i === revealedCount && progress < 1) {
          result += chars[Math.floor(Math.random() * chars.length)];
        } else if (text[i] === " ") {
          result += " ";
        } else {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      setDisplayText(result);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animate);
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [text, delay]);

  return <span className={className}>{displayText}</span>;
}
