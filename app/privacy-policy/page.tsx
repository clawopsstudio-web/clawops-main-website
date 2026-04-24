import type { Metadata } from 'next'
import Navigation from '../components/Navigation'
import Footer from '../../components/sections/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy — ClawOps Studio',
  description: 'How ClawOps Studio collects, uses, and protects your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navigation />
      <main className="pt-16">
        <div className="min-h-screen bg-[#0a0a0a] text-white">
          <div className="max-w-2xl mx-auto px-6 py-24">

            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(232,255,71,0.6)] mb-4">
              LEGAL
            </p>
            <h1
              className="text-4xl font-black text-white mb-2"
              style={{ fontFamily: 'var(--font-cabinet)', letterSpacing: '-0.02em' }}
            >
              Privacy Policy
            </h1>
            <p className="text-white/40 text-sm mb-12">Last updated: April 21, 2026</p>

            <div className="space-y-8 text-white/60 text-sm leading-relaxed">

              <section>
                <h2 className="text-white font-bold text-base mb-3">1. Who we are</h2>
                <p>
                  ClawOps Studio (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website{' '}
                  <a href="https://clawops.studio" className="text-[#e8ff47] hover:underline">clawops.studio</a>{' '}
                  and related services. We are a business that provides AI agentic operating system services
                  to businesses.
                </p>
                <p className="mt-2">
                  Contact us: <a href="mailto:hello@clawops.studio" className="text-[#e8ff47] hover:underline">hello@clawops.studio</a>
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">2. What information we collect</h2>
                <p className="mb-3">We collect the following categories of information:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong className="text-white">Account information:</strong> name, email address, business name, and industry when you sign up</li>
                  <li><strong className="text-white">Payment information:</strong> processed by Stripe — we do not store card details</li>
                  <li><strong className="text-white">Business data:</strong> information you provide about your business, goals, and tools during onboarding</li>
                  <li><strong className="text-white">Usage data:</strong> how you interact with our platform, including pages visited and actions taken</li>
                  <li><strong className="text-white">Communications:</strong> messages you send us via contact forms or email</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">3. How we use your information</h2>
                <p className="mb-3">We use collected information to:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Set up and manage your account and AI agents</li>
                  <li>Process payments and send billing-related communications</li>
                  <li>Respond to your requests and support inquiries</li>
                  <li>Send product updates, announcements, and service-related notices</li>
                  <li>Monitor platform usage and prevent abuse</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">4. Information sharing</h2>
                <p>
                  We do <strong className="text-white">not</strong> sell, trade, or rent your personal information to third parties.
                  We may share information with:
                </p>
                <ul className="space-y-2 list-disc list-inside mt-3">
                  <li><strong className="text-white">Service providers:</strong> Stripe (payments), Composio (tool integrations), Supabase (authentication) — only as needed to operate our service</li>
                  <li><strong className="text-white">Legal requirements:</strong> when required by law or to protect our rights</li>
                  <li><strong className="text-white">Business transfers:</strong> in the event of a merger, acquisition, or sale of assets</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">5. Data retention</h2>
                <p>
                  We retain your information for as long as your account is active, or as needed to provide services.
                  You may request deletion of your personal data at any time by emailing{' '}
                  <a href="mailto:hello@clawops.studio" className="text-[#e8ff47] hover:underline">hello@clawops.studio</a>.
                  We will respond to deletion requests within 30 days.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">6. Data security</h2>
                <p>
                  We use industry-standard encryption (TLS/SSL), secure cloud infrastructure,
                  and access controls to protect your data. No method of transmission over the internet
                  is 100% secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">7. Your rights</h2>
                <p className="mb-3">Depending on your location, you may have the right to:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Access the personal information we hold about you</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information</li>
                  <li>Object to or restrict certain processing</li>
                  <li>Data portability</li>
                </ul>
                <p className="mt-3">
                  To exercise any of these rights, contact us at{' '}
                  <a href="mailto:hello@clawops.studio" className="text-[#e8ff47] hover:underline">hello@clawops.studio</a>.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">8. Cookies and tracking</h2>
                <p>
                  We use cookies for authentication (via Supabase), analytics (via PostHog), and
                  essential site functionality. See our{' '}
                  <a href="/cookie-policy" className="text-[#e8ff47] hover:underline">Cookie Policy</a>{' '}
                  for full details.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">9. Third-party services</h2>
                <p>
                  Our platform integrates with third-party services (e.g., HubSpot, Gmail, Notion, Stripe)
                  via Composio. These services have their own privacy policies. We encourage you to review
                  them.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">10. Children&apos;s privacy</h2>
                <p>
                  Our services are not intended for individuals under the age of 18. We do not
                  knowingly collect personal information from minors.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">11. Changes to this policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of material
                  changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
                  Continued use of our services after changes constitutes acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">12. Contact</h2>
                <p>
                  For questions about this Privacy Policy or to exercise your data rights, contact us at: 
                  <a href="mailto:hello@clawops.studio" className="text-[#e8ff47] hover:underline">hello@clawops.studio</a>.
                </p>
              </section>

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
