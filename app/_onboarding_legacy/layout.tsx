'use client';

// ============================================================================
// ClawOps Studio — Onboarding Layout
// Phase 1 MVP
// ============================================================================

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-[#e8ff47]/5 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
