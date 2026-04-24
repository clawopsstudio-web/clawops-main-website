import Navigation from "../components/Navigation";
import Footer from "../../components/sections/Footer";
import CompanyPageClient from "./CompanyPageClient";

export default function CompanyPage() {
  return (
    <>
      <Navigation />
      <CompanyPageClient />
      <Footer />
    </>
  );
}
export const dynamic = 'force-dynamic';
