import Navbar from "@/components/ui/Navbar";
import HeroNew from "./HeroNew";
import VideoSection from "@/components/ui/VideoSection";
import Problem from "@/components/sections/Problem";
import Capabilities from "@/components/sections/Capabilities";
import HowItWorks from "@/components/sections/HowItWorks";
import Integrations from "@/components/sections/Integrations";
import UseCases from "@/components/sections/UseCases";
import SocialProof from "@/components/sections/SocialProof";
import AmpereStylePricing from "./pricing/AmpereStylePricing";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";

/* Each section gets its own background — this ensures content stacks over GlobalStarField */
function Section({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`relative ${className}`} style={style}>
      {children}
    </div>
  )
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        {/* 1. Hero — full visual impact */}
        <Section>
          <HeroNew />
        </Section>

        {/* 2. Video demo — always visible, not inside scroll-fade */}
        <VideoSection />

        {/* 3. Problem */}
        <Section style={{ background: '#04040c' }}>
          <Problem />
        </Section>

        {/* 4. Capabilities */}
        <Section style={{ background: '#04040c' }}>
          <Capabilities />
        </Section>

        {/* 5. How It Works */}
        <Section style={{ background: '#04040c' }}>
          <HowItWorks />
        </Section>

        {/* 6. Integrations */}
        <Section style={{ background: '#04040c' }}>
          <Integrations />
        </Section>

        {/* 7. Use Cases */}
        <Section style={{ background: '#04040c' }}>
          <UseCases />
        </Section>

        {/* 8. Social Proof */}
        <Section style={{ background: '#04040c' }}>
          <SocialProof />
        </Section>

        {/* 9. Pricing */}
        <Section style={{ background: '#04040c' }}>
          <AmpereStylePricing />
        </Section>

        {/* 10. Final CTA */}
        <Section style={{ background: '#04040c' }}>
          <FinalCTA />
        </Section>
      </main>
      <Footer />
    </>
  );
}

export const dynamic = 'force-dynamic';
