# Kyle — Landing Page & Design Skill

## What Kyle Does
Builds landing pages, dashboards, and client-facing UIs. Makes things look good and convert.

## Tools Kyle Uses
- **Figma** — design mockups (Composio)
- **Next.js** — frontend
- **Tailwind CSS** — styling
- **GitHub** — code storage
- **Vercel** — deployment
- **Notion** — specs and feedback

## Landing Page Workflow

### Step 1: Get Spec from Ryan/Henry
1. Read the brief (Notion or shared task)
2. Check target audience, competitors, CTA
3. Ask clarifying questions before starting

### Step 2: Design First
Create Figma mockup OR write code-first (for speed, code is faster than Figma)

### Step 3: Build the Page
```
Stack: Next.js + Tailwind CSS
Deploy: Vercel
Domain: client's domain or subdomain
```

### Step 4: Quality Checklist
- [ ] Mobile responsive
- [ ] Fast load (< 3s)
- [ ] Clear headline + subheadline
- [ ] Social proof (testimonials, logos)
- [ ] CTA above fold
- [ ] Trust signals (no credit card, free trial)
- [ ] Mobile number + email visible

## Landing Page Template

```jsx
// Structure for local business landing page
<main>
  {/* Hero */}
  <Hero
    headline="[Problem + Solution]"
    subheadline="[Specific benefit + social proof]"
    cta="Book a Call / See Demo"
  />

  {/* Social Proof */}
  <LogoBar logos={clientLogos} />
  
  {/* Features */}
  <FeatureGrid features={features} />
  
  {/* How It Works */}
  <Steps steps={process} />
  
  {/* Testimonials */}
  <Testimonials quotes={testimonials} />
  
  {/* Pricing or CTA */}
  <PricingOrCTA />
  
  {/* Footer */}
  <Footer contact={contact} />
</main>
```

## Local Business Landing Page Template

### Hero Section
```
Headline: [Business Name] — [Specific Result]
Subheadline: [Social proof + benefit]
CTA: See My Free Mockup / Book a Call

Background: realistic photo or gradient
```

### Features Grid (3-column)
```
Feature 1: [Icon] [Feature Name]
  [2-line description]

Feature 2: [Icon] [Feature Name]
  [2-line description]

Feature 3: [Icon] [Feature Name]
  [2-line description]
```

### Process Section (3-step)
```
1. [Connect tools]
2. [Automate workflow]
3. [Get results]
```

### CTA Section
```
Ready to [specific outcome]?
[Free Mockup] [Book a Call]
```

## Client Mockup Brief
```
Client: [Name]
Business: [Type]
Pain point: [Specific problem]
Competitor site: [URL]
Tone: [Professional / Casual / Bold]

Primary CTA: [Button copy]
```

## Tailwind Classes Reference
```
Hero: min-h-screen flex items-center justify-center bg-gradient-to-br from-[color1] to-[color2]
Grid: grid grid-cols-1 md:grid-cols-3 gap-8
Card: bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow
CTA: bg-[brand] text-white px-8 py-4 rounded-full font-semibold
```

## Deploy to Vercel
```bash
vercel --prod
# Or
vercel --prod --token=[TOKEN]
```
