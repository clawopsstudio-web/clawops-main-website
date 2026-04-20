# Kyle — Landing Page Build Workflow

## Workflow: Brief → Mockup → Build → Deploy

---

## Step 1: Get the Brief
**Tools:** Notion, Telegram, email

### Brief Checklist
- [ ] Client name + website URL
- [ ] Pain point (1 sentence: what problem do they solve?)
- [ ] Solution (what do they do + how)
- [ ] Proof (case studies, testimonials, stats)
- [ ] CTA (book call / free mockup / DM)
- [ ] Competitors to avoid
- [ ] Deadline

**Output:** Brief in Notion

---

## Step 2: Audit Their Current Site
**Tools:** Browser, WebPageTest, PageSpeed Insights

### Site Audit Checklist
- [ ] Homepage — Hero, social proof, features, CTA
- [ ] Mobile responsive? (test on iPhone + Android)
- [ ] Load speed (<3s on 3G)
- [ ] Forms + integrations
- [ ] Google Analytics + tracking
- [ ] Tech stack (WordPress, Webflow, custom?)
- [ ] Email marketing (Klaviyo, Mailchimp?)
- [ ] CRM + lead capture

**Output:** Site audit in Notion

---

## Step 3: Wireframe + Design
**Tools:** Figma or Tailwind + React

### Hero Structure
```
┌────────────────────────────────────┐
│  [Brand Logo]     [Nav Links]        │
├────────────────────────────────────┤
│  [Headline — problem + solution]       │
│  [Subheadline — 1-2 sentences]     │
│  [CTA button] [Social proof]        │
├────────────────────────────────────┤
│  [Screenshot / Mockup Image]        │
└────────────────────────────────────┘
```

### Color System
```
Primary: [#COLOR]
Secondary: [#COLOR]
Accent: [#COLOR]
Background: [#COLOR]
Text: [#COLOR]
```

### Font Pair
- Headings: Bold, 700 weight
- Body: 400 weight

---

## Step 4: Build (Tailwind + Next.js)
**Tools:** Tailwind, Next.js, React

### Stack
```
Framework: Next.js
Styling: Tailwind CSS
Components: shadcn/ui
Forms: React Hook Form + Zod
Hosting: Vercel
Domain: client domain or subdomain
```

### Key Files
```
/workspace/kyle/
  /landing-pages/[client-name]/
    page.tsx
    layout.tsx
    /components/
    /lib/
    tailwind.config.ts
    globals.css
```

---

## Step 5: Test
**Tools:** Browser, PageSpeed, GTmetrix

### Pre-Launch Checklist
- [ ] Mobile responsive (iPhone + Android)
- [ ] Load <3s on 3G
- [ ] All links clickable
- [ ] Forms submit correctly
- [ ] Tracking pixel installed
- [ ] SEO meta tags + OG image

---

## Deployment
**Tools:** Vercel CLI

```bash
vercel --prod --token=[TOKEN]
```

---

## Local Business Template Structure
```
Hero → [Pain Point + Solution + CTA]
Social Proof → [Logos + stats]
Features → [3-4 core features]
How It Works → [3 steps]
Testimonials → [Social proof]
Pricing → [Simple tiers]
CTA → [Book call]
Footer → [Contact + links]
```

---

## Quick Landing Page (1-hour build)
- Single page — no multi-page
- Focus on 1 CTA
- Social proof above the fold
- Mobile-first
- Direct CTA
