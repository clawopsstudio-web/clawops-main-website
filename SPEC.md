# SPEC: Website Pivot — From SaaS to AI Employee Service

## Objective

Pivot clawops.studio from a SaaS product (self-serve, token-based) to a **service business** (sell "AI employees" that we build, deploy, and manage). The customer never touches tokens, infrastructure, or configuration — they just get a digital employee that knows their business.

**Target customer:** Busy executives at marketing agencies, law firms, insurance agencies, manufacturers, wholesalers, real estate agencies. Not developers. Not technical buyers.

**Core message from transcript:**
- "You're selling an AI employee, not an AI agent"
- "Unlimited agents, unlimited usage, unlimited monitoring" — creates abundance
- Price at $5K/month (or "From $999/mo" for entry)
- "48 hours to get up and running"
- Talk in business **OUTCOMES**, not time saved
- Remove ALL token/usage/limit language

---

## Success Criteria

- [ ] Hero says "AI Employee" not "AI Agent"
- [ ] No mention of tokens, credits, usage limits anywhere on site
- [ ] Pricing page shows "From $999/mo" or "$5K/month" — flat, unlimited
- [ ] Homepage targets specific industries (agencies, law firms, insurance, real estate)
- [ ] All CTAs lead to /start (discovery call or form)
- [ ] Language focuses on outcomes (revenue, leads generated, tickets resolved) not features
- [ ] "We build, deploy, and manage" framing throughout

---

## Key Changes Required

### 1. Hero Section
**Current:** "We build and manage your AI team"
**Change to:** "Your AI Employee. Built for your business. Managed by us."
- Remove "Start for $49" → "Start Your OS →" (keep this)
- Add: "48 hours to your first AI employee"

### 2. Pricing Page
**Current:** $399-499/mo per service type
**Change to:**
```
AI Employee — From $999/mo
- Unlimited agents
- Unlimited usage
- Unlimited monitoring & optimization
- 48 hours to deploy
- We manage everything
```

OR keep $5K/month framing from transcript.

### 3. Homepage — Remove ALL SaaS Language
**Remove everywhere:**
- "tool calls/mo"
- "credits"
- "usage limits"
- "token billing"
- "per-user fees"

**Replace with:**
- "Unlimited actions"
- "Unlimited improvements"
- "Flat monthly rate"

### 4. Homepage — Add Industry Targeting
Add a section or update hero:
```
Built for:
- Marketing Agencies
- Law Firms  
- Insurance Agencies
- Real Estate
- Manufacturers
```

### 5. Change "Agent" to "Employee" Throughout
- "Your AI Team" → "Your AI Employees"
- "Recruit" → "Hire"
- Agent cards → "Employee cards"

### 6. Homepage — Add Business Outcomes
**Current stats:** "3-5 days", "$3,000+ saved"
**Better stats:**
- "$X leads generated this month"
- "X tickets resolved automatically"
- "48 hours to your first AI employee"

### 7. Live Feed — Update Language
- "Our AI Team at Work" → keep or change
- Activity descriptions should show business value

### 8. FAQ — Update Answers
Add questions from transcript:
- "Do I need to touch any technical infrastructure?" → NO
- "What does unlimited mean?" → No limits on agents, usage, or improvements
- "How fast can we get started?" → 48 hours

---

## Files to Modify

1. `app/HeroNew.tsx` — Update headline, stats
2. `app/pricing/AmpereStylePricing.tsx` — Update pricing model
3. `app/LandingClient.tsx` — Update section headers
4. `app/agents/page.tsx` — Update messaging
5. `app/components/AgentCard.tsx` — Change "Recruit" to "Hire"
6. `app/components/LiveFeed.tsx` — Update activity descriptions
7. `components/sections/FAQ.tsx` — Add new FAQ items
8. `components/sections/HowItWorks.tsx` — Add "48 hours" messaging
9. `components/sections/Footer.tsx` — Update tagline
10. `app/about/page.tsx` — Update messaging

---

## Assumptions I'm Making

1. We want to price at "$999/mo entry" not "$5K/month" (Pulkit to confirm)
2. We're targeting agencies/law firms/insurance/real estate (general, not one specific vertical yet)
3. The /start form is the lead capture (discovery call booking or contact form)
4. Design/layout stays exactly the same — only copy/messaging changes
5. No new pages needed

→ **Confirm these before I proceed.**
