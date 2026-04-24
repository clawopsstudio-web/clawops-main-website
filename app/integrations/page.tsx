import Navigation from "../components/Navigation";
import Footer from "../../components/sections/Footer";
import IntegrationsPageClient from "./IntegrationsPageClient";

export default function IntegrationsPage() {
  return (
    <>
      <Navigation />
      <IntegrationsPageClient />
      <Footer />
    </>
  );
}
export const dynamic = 'force-dynamic';
