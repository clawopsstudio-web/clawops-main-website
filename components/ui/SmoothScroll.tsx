"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Pages that should NOT use Lenis smooth scroll.
 * Lenis adds `overflow: hidden` to <html> which breaks mobile + dashboard overflow.
 */
const LENIS_BLACKLIST = [
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/dashboard',
  '/ops',
  '/diag',
];

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<unknown>(null);
  const pathname = usePathname();

  useEffect(() => {
    const shouldLenis = !LENIS_BLACKLIST.some((path) =>
      pathname.startsWith(path)
    );

    if (!shouldLenis) return;

    const initLenis = async () => {
      try {
        const Lenis = (await import("lenis")).default;
        const lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          touchMultiplier: 2,
        });

        lenisRef.current = lenis;

        function raf(time: number) {
          lenis.raf(time);
          requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Expose globally for GSAP integration
        (window as unknown as { lenis?: typeof lenis }).lenis = lenis;

        return () => {
          lenis.destroy();
        };
      } catch (e) {
        console.warn("Lenis failed to load, falling back to native scroll");
      }
    };

    const cleanup = initLenis();
    return () => {
      cleanup.then((fn) => fn && fn());
    };
  }, [pathname]);

  return <>{children}</>;
}
