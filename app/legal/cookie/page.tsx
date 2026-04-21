import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/sections/Footer";

export default function CookiePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#0a0a0a] pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <h1 className="text-3xl font-bold text-white mb-2">Cookie Policy</h1>
          <p className="text-sm text-[rgba(255,255,255,0.4)] mb-8">Last updated: April 8, 2026</p>

          <div className="space-y-8 text-sm leading-7 text-[rgba(255,255,255,0.6)]">
            <section>
              <h2 className="text-lg font-semibold text-white mb-3">What Are Cookies?</h2>
              <p>Cookies are small text files stored in your browser when you visit our website. They help us remember your preferences, keep you logged in, and understand how you use our platform.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">How We Use Cookies</h2>
              <div className="space-y-4 mt-3">
                <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
                  <h3 className="text-sm font-semibold text-white mb-1">Essential Cookies</h3>
                  <p className="text-xs">Required for authentication, session management, and core functionality. Cannot be disabled without breaking the service.</p>
                  <p className="mt-1 font-mono text-[10px] text-[rgba(0,212,255,0.5)]">supabase-auth-token, session-id, csrf-token</p>
                </div>
                <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
                  <h3 className="text-sm font-semibold text-white mb-1">Analytics Cookies</h3>
                  <p className="text-xs">Help us understand how visitors use our site. We use anonymized, aggregated data only.</p>
                  <p className="mt-1 font-mono text-[10px] text-[rgba(0,212,255,0.5)]">_ga, _gid, _gat</p>
                </div>
                <div className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-5">
                  <h3 className="text-sm font-semibold text-white mb-1">Marketing Cookies</h3>
                  <p className="text-xs">We do not use marketing or advertising cookies. We don&apos;t track you across the web for ads.</p>
                  <p className="mt-1 font-mono text-[10px] text-[rgba(0,212,255,0.5)]">None</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Managing Cookies</h2>
              <p>You can manage or delete cookies through your browser settings. Note that disabling essential cookies will prevent you from logging into your account.</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-[#e8ff47] hover:underline">Chrome</a></li>
                <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer" className="text-[#e8ff47] hover:underline">Firefox</a></li>
                <li><a href="https://support.apple.com/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#e8ff47] hover:underline">Safari</a></li>
                <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-[#e8ff47] hover:underline">Edge</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Third-Party Cookies</h2>
              <p>Some cookies are set by third-party services we use:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li><strong className="text-white">Supabase</strong> — Authentication and database sessions</li>
                <li><strong className="text-white">PayPal</strong> — Payment processing (PayPal sets its own cookies)</li>
                <li><strong className="text-white">Google Fonts / Analytics</strong> — Font delivery and usage analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Updates to This Policy</h2>
              <p>We may update this cookie policy as our services evolve. Check back periodically for the latest information.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white mb-3">Contact</h2>
              <p>Questions? Email <a href="mailto:privacy@clawops.studio" className="text-[#e8ff47] hover:underline">privacy@clawops.studio</a></p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
export const dynamic = 'force-dynamic';
