import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import SystemActivation from "@/components/sections/SystemActivation";
import Capabilities from "@/components/sections/Capabilities";
import Deployment from "@/components/sections/Deployment";
import HowItWorks from "@/components/sections/HowItWorks";
import Integrations from "@/components/sections/Integrations";
import UseCases from "@/components/sections/UseCases";
import WhyClawOps from "@/components/sections/WhyClawOps";
import SocialProof from "@/components/sections/SocialProof";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <SystemActivation />
        <Capabilities />
        <Deployment />
        <HowItWorks />
        <Integrations />
        <UseCases />
        <WhyClawOps />
        <SocialProof />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
