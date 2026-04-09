import Navbar from "@/components/ui/Navbar";
import HeroNew from "./HeroNew";
import Problem from "@/components/sections/Problem";
import Capabilities from "@/components/sections/Capabilities";
import HowItWorks from "@/components/sections/HowItWorks";
import Integrations from "@/components/sections/Integrations";
import UseCases from "@/components/sections/UseCases";
import SocialProof from "@/components/sections/SocialProof";
import AmpereStylePricing from "./pricing/AmpereStylePricing";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";

/* Clean section divider — one per transition */
function SectionDivider() {
  return (
    <div
      aria-hidden="true"
      className="h-px w-full"
      style={{
        background: "linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.25) 30%, rgba(102,0,255,0.25) 70%, transparent 100%)",
      }}
    />
  );
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroNew />
        <SectionDivider />
        <Problem />
        <SectionDivider />
        <Capabilities />
        <SectionDivider />
        <HowItWorks />
        <SectionDivider />
        <Integrations />
        <SectionDivider />
        <UseCases />
        <SectionDivider />
        <SocialProof />
        <SectionDivider />
        <AmpereStylePricing />
        <SectionDivider />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

export const dynamic = 'force-dynamic';
