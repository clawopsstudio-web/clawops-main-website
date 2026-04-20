# Auth Pages Copy — ClawOps Studio
**Pages:** /auth/login · /auth/signup
**Last Updated:** 2026-04-20

---

## LOGIN PAGE — /auth/login

**Headline:** "Welcome back."
**Subhead:** "Sign in to your dashboard."
**Email field:** "Email address"
**Password field:** "Password"
**Button Primary:** "Sign in →"
**Button Secondary:** "Continue with Google"
**Link:** "Forgot password?"
**Bottom line:** "Don't have an account? Sign up"
**Trust:** "7-day free trial · No card required"

---

## SIGNUP PAGE — /auth/signup

**Headline:** "Deploy your AI team."
**Subhead:** "Start free. No card. Cancel anytime."
**Name field:** "Full name"
**Email field:** "Work email"
**Password field:** "Create password (min. 8 characters)"
**Button Primary:** "Create account →"
**Button Secondary:** "Continue with Google"
**Link:** "Already have an account? Sign in"
**Trust:** "By signing up you agree to our Terms of Service and Privacy Policy."

---

## AUTH FLOW NOTES

**Redirect after signup:** /dashboard
**Redirect after login:** /dashboard
**Logout:** Clears session, redirects to /auth/login
**Error states:** "Invalid email or password" (no specifics given)
**Loading state:** Button shows spinner during auth
**OAuth:** Google only (keep simple, no GitHub for now
