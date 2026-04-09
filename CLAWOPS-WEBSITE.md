# ClawOps Website — Context for Kyle

**Live site:** https://clawops-web.vercel.app
**Repo:** https://github.com/clawopsstudio-web/clawops-studio-web
**Repo path:** `/root/.openclaw/workspaces/clawops-studio-web/`
**Branch:** `main`

---

## What This Is
The ClawOps website — a Next.js 14 (App Router) landing page + dashboard product.
Primary goal: convert visitors into paying customers for AI agentic OS SaaS.

## Product Positioning
**Tagline:** "The Agentic OS for Businesses That Scale. Without Hiring."
- Category: Agentic OS (like AIOS, Leah, Xebia — but for SMBs)
- Powered by OpenClaw
- Pricing: $49/mo Starter, $99/mo Pro, $149/mo Business
- Target: businesses that want AI agents running 24/7 without hiring

## Tech Stack
- **Framework:** Next.js 14, App Router, TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Deployment:** Vercel (auto-deploys from GitHub main branch)
- **Auth:** Supabase (Google OAuth + email/password)
- **Database:** Supabase PostgreSQL
- **Smooth scroll:** Lenis

## Key Pages
- `/` — Homepage (HeroNew + sections)
- `/pricing` — AmpereStylePricing
- `/how-it-works`
- `/use-cases`
- `/integrations`
- `/auth/login`
- `/auth/signup`
- `/auth/payment` (PayPal simulate, Stripe disabled)
- `/onboarding`
- `/dashboard`

## Design System
- **Background:** `#04040c` (near black)
- **Primary accent:** `#00D4FF` (cyan)
- **Secondary accent:** `#6600FF` (purple)
- **Success:** `#10b981` (green)
- **Text:** white, `rgba(255,255,255,0.5)` for secondary
- **Fonts:** Inter via Next.js default

## Hero Section
- File: `app/HeroNew.tsx`
- Background: FloatingShapes (glowing orbs, rotating rings, particles, perspective grid)
- 3D scroll parallax effect — orbs/particles move at different speeds
- Text content z-30 (always above background)
- CTA buttons: gradient cyan-purple with glow hover effects

## Homepage Sections
All in `app/page.tsx`:
1. `HeroNew` — hero section
2. `Problem` — hiring cost / reactive AI / OpenClaw complexity
3. `Capabilities` — autonomous execution, OpenClaw power, scale without hiring
4. `HowItWorks` — Connect → Pick agents → Let them run
5. `Integrations` — 20+ integrations
6. `UseCases` — Sales, Support, Research, Ops
7. `SocialProof` — stats
8. `AmpereStylePricing` — 3 plan cards
9. `FinalCTA` — gradient CTA
10. `Footer`

## Component Paths
```
app/HeroNew.tsx                    — Hero with 3D scroll parallax
app/page.tsx                       — Homepage assembly
app/pricing/AmpereStylePricing.tsx — Pricing cards
components/sections/               — All homepage sections
components/ui/Navbar.tsx          — Nav with hover effects
components/ui/GlobalStarField.tsx   — Background star/dot grid
```

## Build & Deploy
```bash
cd /root/.openclaw/workspaces/clawops-studio-web
npm run build        # local build test
git add -A && git commit -m "your message" && git push
# Vercel auto-deploys from main branch
```

## Pulkit's Preferences (from UX feedback)
- Hero content must be centered on mobile
- Floating cards removed — they overlapped text
- Hover effects on ALL buttons (scale + glow shadow)
- Background should be "alive" — visible animated orbs/particles
- Z-layering: text must always be above background
- Mobile-first responsive design

## Supabase Auth Setup
- Project: `dyzkfmdjusdyjmytgeah`
- Google OAuth enabled (credentials: `327131823416-ft2d15s25fgirhia4p8l6l9baecbg6si`)
- Env vars in Vercel dashboard:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Common Fixes
- **TypeScript Variants error:** append `as const` to ease arrays
- **MotionValue rendering:** use `useState` + `onUpdate` instead
- **useSearchParams in Next.js:** wrap in `<Suspense>`
- **Hero overlapping:** ensure text z-30, background z-0
- **Scroll parallax:** `useScroll` + `useTransform` from framer-motion

## What NOT to Change
- Product positioning (Agentic OS for businesses)
- Pricing tiers ($49/$99/$149)
- Tech stack (Next.js, Tailwind, Framer Motion)
- Supabase auth configuration
