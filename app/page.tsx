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

export default function Home() {
  return (
    <>
      <main>
        <HeroNew />
        <Problem />
        <Capabilities />
        <HowItWorks />
        <Integrations />
        <UseCases />
        <SocialProof />
        <AmpereStylePricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
export const dynamic = 'force-dynamic';
