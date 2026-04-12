import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/sections/Footer";

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#04040c] pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-sm text-[rgba(255,255,255,0.4)] mb-8">Last updated: April 8, 2026</p>

          <div className="space-y-8 text-sm leading-7 text-[rgba(255,255,255,0.6)]">
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
              <p>By accessing or using ClawOps Studio (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) services, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. Services Description</h2>
              <p>ClawOps provides AI worker deployment services, including preconfigured automation agents, managed infrastructure, and integration tools. Services are provided on a subscription basis as described at <a href="/pricing" className="text-[#00D4FF] hover:underline">/pricing</a>.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. Subscriptions and Billing</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Subscriptions auto-renew monthly or annually unless cancelled.</li>
                <li>Cancellations take effect at the end of the current billing period.</li>
                <li>Refunds are evaluated case-by-case within 7 days of charge.</li>
                <li>Plan upgrades take effect immediately; downgrades take effect at next billing cycle.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. Acceptable Use</h2>
              <p>You agree not to use our services for:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Illegal activities or fraud</li>
                <li>Spam, harassment, or mass unsolicited communications</li>
                <li>Activities that infringe on third-party intellectual property</li>
                <li>Attempting to compromise, exploit, or reverse-engineer our infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. Data and Privacy</h2>
              <p>Your use of our services is also governed by our <a href="/legal/privacy" className="text-[#00D4FF] hover:underline">Privacy Policy</a>. You retain ownership of all data you submit. We process your data solely to deliver our services.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">6. Uptime and Availability</h2>
              <p>Pro and Agency plans include a 99.9% uptime SLA. If uptime falls below this threshold in any calendar month, affected customers will receive a prorated service credit. SLA credits are the sole remedy for uptime failures.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">7. Third-Party Services</h2>
              <p>Our services integrate with third-party platforms (Telegram, WhatsApp, Supabase, Contabo, Anthropic, OpenAI, etc.). We are not responsible for the availability, accuracy, or policies of third-party services.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">8. Limitation of Liability</h2>
              <p>To the maximum extent permitted by law, ClawOps Studio shall not be liable for indirect, incidental, special, consequential, or punitive damages, including lost profits, data loss, or business interruption arising from use of our services.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">9. Intellectual Property</h2>
              <p>ClawOps Studio and its original content, features, and design are proprietary. You may not copy, reproduce, or redistribute our proprietary technology without written consent.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">10. Termination</h2>
              <p>We may suspend or terminate services at our discretion for violations of these terms. You may cancel your subscription at any time via your dashboard or by emailing hello@clawops.studio.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">11. Changes to Terms</h2>
              <p>We may update these terms periodically. Continued use after changes constitutes acceptance of the new terms. Material changes will be communicated via email.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">12. Contact</h2>
              <p>Questions about these terms? Email <a href="mailto:hello@clawops.studio" className="text-[#00D4FF] hover:underline">hello@clawops.studio</a></p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
export const dynamic = 'force-dynamic';
