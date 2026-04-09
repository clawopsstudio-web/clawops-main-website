import HeroNew from "./HeroNew";
import AmpereStylePricing from "./pricing/AmpereStylePricing";
import FinalCTA from "@/components/sections/FinalCTA";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <main>
        <HeroNew />
        <AmpereStylePricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
export const dynamic = 'force-dynamic';
