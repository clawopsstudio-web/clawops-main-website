# Stars + Parallax Visual Upgrade — Handoff Summary

**Date:** 2026-04-05
**Task:** Add ambient star field + subtle parallax depth to hero background
**Repo:** `/root/.openclaw/workspaces/clawops-web`

---

## Files Changed

### 1. `components/ui/CinematicBackground.tsx`

**Additions:**
- `Props` interface now accepts optional `scrollProgress: MotionValue<number>` prop
- `generateStars()` — LCG-seeded deterministic pseudo-random (seed=42). Generates 70 star descriptors with golden-ratio distributed positions, sizes (1–2px), base opacities (0.15–0.5), and staggered twinkle timing. Consistent on both SSR and client — no hydration mismatch.
- Star field layer (Layer 2): 70 absolutely-positioned `<div>` elements, each with:
  - Phase-reactive tint: cyan `#b8e8ff` → white-cyan → violet `#d8c8ff` → green `#c8ffe8`
  - One of 4 CSS twinkle animations (3–6s duration, staggered delays)
  - No canvas, no JS animation loop
- Subtle parallax transforms via `useTransform`:
  - Primary orb: `y` -28px + `x` +14px over full scroll range
  - Secondary orb: `y` +18px + `x` -10px (counter-direction)
  - Ring: `scale` 1 → 1.04 + `opacity` 0.4 → 0.15 (fades on scroll)
  - Stars: **intentionally static** — parallax on stars would feel jittery/motion-heavy
- Layer numbers shifted (old Layer 5 ring is now Layer 5, etc.)

**No removal of existing layers.**

### 2. `components/sections/Hero.tsx`

**Change:**
- `scrollYProgress` motion value now passed as `scrollProgress` prop to `<CinematicBackground>`
- One-line change

### 3. `app/globals.css`

**Additions:**
- 4 CSS keyframe animations: `star-twinkle-1` through `star-twinkle-4`
  - Each cycles opacity between ~30% and ~80% at slightly different timings/phases
- 4 companion utility classes: `.star-twinkle-1` through `.star-twinkle-4`
  - Applied via `animation-duration` inline (3–6s per star) + `animation-delay` inline (staggered)

---

## Validation

- **Build:** `npm run build` — ✓ Clean, zero errors
- **Lint:** `npm run lint` — ✓ 0 errors, 31 warnings (all pre-existing, unrelated to these changes)

---

## Design Decisions & Cautions

1. **Star count = 70.** Within the 60–80 target. Increase carefully — each star is a DOM node. 100+ would start mattering on low-end mobile.

2. **Stars are intentionally parallax-free.** Parallax on individual stars creates jitter at small sizes. The orb layers handle the depth cue instead.

3. **`scrollProgress` default is a no-op.** When `scrollProgress` is undefined (e.g., used standalone), the `?? (0 as unknown as MotionValue<number>)` fallback means all `useTransform` calls resolve to static values. No crash, just no parallax.

4. **CSS animations only — no JS RAF loops.** Performance-safe on mobile. GPU-accelerated (`opacity` and `transform` only).

5. **`will-change` not added.** The existing `.dot-grid` pattern already hints at compositing layers. Adding `will-change: transform` on the orbs would be a micro-optimization if perf testing shows it needed — but the current motion values are already transform-based.

6. **Phase-reactive star tinting is tasteful and subtle.** 4 color shifts, all within a cool-white to cool-blue palette. No harsh neon jumps.

---

## What Was NOT Done (by design)

- No canvas / WebGL / Three.js
- No heavy scroll-driven 3D transforms
- No new npm dependencies
- No changes to hero text, readability, or CTA layout
