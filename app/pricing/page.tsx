import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/sections/Footer";
import AmpereStylePricing from "./AmpereStylePricing";

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <PricingPageClient />
      <Footer />
    </>
  );
}
export const dynamic = 'force-dynamic';
