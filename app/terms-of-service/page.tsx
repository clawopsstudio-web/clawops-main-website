import type { Metadata } from 'next'
import Navigation from '../components/Navigation'
import Footer from '../../components/sections/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service — ClawOps Studio',
  description: 'Terms of Service for ClawOps Studio. Subscription billing, refund policy, and acceptable use.',
}

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-white/40 text-sm mb-12">Last updated: April 21, 2026</p>

            <div className="space-y-8 text-white/60 text-sm leading-relaxed">

              <section>
                <h2 className="text-white font-bold text-base mb-3">1. Acceptance of terms</h2>
                <p>
                  By accessing or using ClawOps Studio (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) services at{' '}
                  <a href="https://clawops.studio" className="text-[#e8ff47] hover:underline">clawops.studio</a>,
                  you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms,
                  do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">2. Description of service</h2>
                <p>
                  ClawOps Studio provides an AI agentic operating system — a platform that deploys
                  and manages AI agents on behalf of businesses (&quot;you&quot; or &quot;your&quot;). Our service includes
                  access to pre-configured AI agents, tool integrations, and a management dashboard.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">3. Account registration</h2>
                <p>
                  You must register for an account to access our services. You are responsible for
                  maintaining the confidentiality of your account credentials and for all activity
                  under your account. You agree to notify us immediately of any unauthorized use.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">4. Subscription and billing</h2>
                <p className="mb-3">Subscription plans and pricing are available at{' '}
                  <a href="/pricing" className="text-[#e8ff47] hover:underline">clawops.studio/pricing</a>.</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Fees are billed monthly in advance on the date of your subscription</li>
                  <li>All fees are non-refundable except as described in our refund policy below</li>
                  <li>We reserve the right to change pricing with 30 days&apos; notice</li>
                  <li>Failed payments may result in suspension of service after 7 days</li>
                  <li>You authorize us to charge your payment method for all fees due</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">5. Refund policy</h2>
                <p>
                  We offer a <strong className="text-white">7-day money-back guarantee</strong> on all plans.
                  If you are not satisfied with our service within the first 7 days of your subscription,
                  contact us at{' '}
                  <a href="mailto:hello@clawops.studio" className="text-[#e8ff47] hover:underline">hello@clawops.studio</a>{' '}
                  for a full refund. No questions asked.
                </p>
                <p className="mt-2">
                  After 7 days, all fees are non-refundable. Refunds for partial months are not provided.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">6. Acceptable use</h2>
                <p className="mb-3">You agree NOT to use our services to:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Violate any applicable law, regulation, or third-party rights</li>
                  <li>Send unsolicited marketing or spam</li>
                  <li>Generate or distribute harmful, illegal, or fraudulent content</li>
                  <li>Impersonate any person or entity</li>
                  <li>Attempt to gain unauthorized access to any system or network</li>
                  <li>Use our platform to develop competing products or services</li>
                  <li>Resell or redistribute our service without authorization</li>
                  <li>Use our AI agents to automate illegal activities</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">7. Service availability</h2>
                <p>
                  We strive for high availability but do <strong className="text-white">not guarantee</strong> 100% uptime.
                  Scheduled maintenance will be communicated in advance when possible. We are not liable for
                  downtime or service interruptions. No service credits or refunds are provided for
                  intermittent downtime.
                </p>
                <p className="mt-2">
                  We reserve the right to modify, suspend, or discontinue any part of our service at any time,
                  with or without notice.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">8. Third-party integrations</h2>
                <p>
                  Our service includes integrations with third-party tools and platforms (e.g., Gmail,
                  HubSpot, Notion, Stripe). We are not responsible for the availability, accuracy,
                  or practices of these third-party services. Your use of third-party integrations
                  is governed by their respective terms and privacy policies.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">9. Intellectual property</h2>
                <p>
                  ClawOps Studio and its original content, features, and functionality are owned by us
                  and are protected by copyright, trademark, and other intellectual property laws.
                  You retain ownership of your business data and content.
                </p>
                <p className="mt-2">
                  You grant us a limited license to use your content solely to provide and improve
                  our services.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">10. Limitation of liability</h2>
                <p>
                  To the maximum extent permitted by law, ClawOps Studio and its operators shall not
                  be liable for any indirect, incidental, special, consequential, or punitive damages —
                  including but not limited to loss of profits, data, or business opportunities —
                  arising out of or related to your use of our services, regardless of the theory of liability.
                </p>
                <p className="mt-2">
                  Our total liability shall not exceed the amount you paid us in the 12 months preceding
                  the event giving rise to the claim.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">11. Indemnification</h2>
                <p>
                  You agree to indemnify, defend, and hold harmless ClawOps Studio and its operators
                  from any claims, damages, or expenses arising from your use of our services,
                  your violation of these Terms, or your violation of any third-party rights.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">12. Termination</h2>
                <p>
                  You may terminate your subscription at any time from your account settings.
                  We may terminate or suspend your account immediately, without prior notice, for
                  conduct that violates these Terms or applicable law. Upon termination,
                  your right to use our services ceases immediately.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">13. Governing law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of
                  India, without regard to its conflict of law provisions. Any disputes shall be
                  resolved in the courts of New Delhi, India.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">14. Changes to these terms</h2>
                <p>
                  We may revise these Terms from time to time. Material changes will be communicated
                  via email or a notice on our website. Continued use of our services after changes
                  constitutes acceptance of the revised Terms.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">15. Contact</h2>
                <p>
                  Questions about these Terms? Contact us at{' '}
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
