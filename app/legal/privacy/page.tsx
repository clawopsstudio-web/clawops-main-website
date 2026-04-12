import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/sections/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#04040c] pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-sm text-[rgba(255,255,255,0.4)] mb-8">Last updated: April 8, 2026</p>

          <div className="space-y-8 text-sm leading-7 text-[rgba(255,255,255,0.6)]">
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">1. Information We Collect</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white">Account information:</strong> Name, email, company, billing address.</li>
                <li><strong className="text-white">Usage data:</strong> Worker activity logs, task completion records, integration connection timestamps.</li>
                <li><strong className="text-white">Infrastructure data:</strong> Server metrics, resource usage, logs — stored on managed infrastructure.</li>
                <li><strong className="text-white">Communication data:</strong> Messages sent to and from AI workers via connected platforms.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Deliver and maintain our AI worker services</li>
                <li>Process billing and subscriptions</li>
                <li>Provide customer support</li>
                <li>Improve our platform and develop new features</li>
                <li>Detect and prevent fraud or abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">3. Data Storage and Security</h2>
              <p>User data is stored in Supabase (PostgreSQL) with encryption at rest and in transit. Infrastructure data remains on your dedicated server — we do not access it unless for support purposes. We implement industry-standard security measures including TLS, access controls, and audit logging.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">4. Third-Party Data Sharing</h2>
              <p>We share minimal data with:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong className="text-white">Supabase</strong> — Database and authentication</li>
                <li><strong className="text-white">PayPal</strong> — Payment processing</li>
                <li><strong className="text-white">Contabo</strong> — Infrastructure provisioning</li>
                <li><strong className="text-white">Anthropic / OpenAI / Google</strong> — AI model providers (your prompts and outputs)</li>
              </ul>
              <p className="mt-2">We do not sell your data to advertisers or data brokers.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">5. AI Worker Data Handling</h2>
              <p>When you use AI workers, prompts and responses are sent to model providers (Anthropic, OpenAI, Google) for processing. This data is handled according to each provider&apos;s privacy policy. Workers operating via browser automation access web applications using your authenticated sessions — we do not store these credentials in plain text.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">6. Cookies</h2>
              <p>We use essential cookies for authentication and session management. See our <a href="/legal/cookie" className="text-[#00D4FF] hover:underline">Cookie Policy</a> for details.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">7. Data Retention</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Account data: Retained until account deletion</li>
                <li>Usage logs: 90 days for Starter, 180 days for Pro, 365 days for Agency</li>
                <li>Billing records: 7 years (legal requirement)</li>
                <li>Worker conversation history: 7 days (Starter), 30 days (Pro), 90 days (Agency)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">8. Your Rights</h2>
              <p>Depending on your jurisdiction, you may have the right to:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
                <li>Object to certain processing</li>
              </ul>
              <p className="mt-2">To exercise any rights, email <a href="mailto:privacy@clawops.studio" className="text-[#00D4FF] hover:underline">privacy@clawops.studio</a>.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">9. Children&apos;s Privacy</h2>
              <p>Our services are not intended for individuals under 16. We do not knowingly collect data from minors.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">10. Changes to This Policy</h2>
              <p>We may update this privacy policy periodically. Changes will be posted on this page with an updated &ldquo;last updated&rdquo; date.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">11. Contact</h2>
              <p>Privacy questions: <a href="mailto:privacy@clawops.studio" className="text-[#00D4FF] hover:underline">privacy@clawops.studio</a></p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
export const dynamic = 'force-dynamic';
