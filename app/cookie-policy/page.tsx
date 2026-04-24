import type { Metadata } from 'next'
import Navigation from '../components/Navigation'
import Footer from '../../components/sections/Footer'

export const metadata: Metadata = {
  title: 'Cookie Policy — ClawOps Studio',
  description: 'What cookies ClawOps Studio uses and why — Clerk, PostHog, and Cloudflare.',
}

export default function CookiePolicyPage() {
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
              Cookie Policy
            </h1>
            <p className="text-white/40 text-sm mb-12">Last updated: April 21, 2026</p>

            <div className="space-y-8 text-white/60 text-sm leading-relaxed">

              <section>
                <h2 className="text-white font-bold text-base mb-3">What are cookies?</h2>
                <p>
                  Cookies are small text files stored on your device (computer, phone, or tablet)
                  when you visit a website. They help websites remember your preferences and
                  understand how you use the site.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">How we use cookies</h2>
                <p>
                  ClawOps Studio uses cookies for authentication, analytics, and essential
                  site functionality. Below is a breakdown of what we use and why.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">Our cookies</h2>

                <div className="space-y-4 mt-4">
                  {[
                    {
                      name: 'Supabase (Authentication)',
                      type: 'Essential',
                      duration: 'Session / 30 days',
                      purpose: 'Supabase handles user authentication for ClawOps. It sets session cookies to keep you logged in, detect your auth state, and secure your account. These cannot be disabled without logging out.',
                    },
                    {
                      name: 'PostHog (Analytics)',
                      type: 'Analytics',
                      duration: '1 year',
                      purpose: 'PostHog tracks how you use our website — which pages you visit, how you navigate, and where you came from. This helps us understand what works and what doesn\'t. This data is anonymized and not used for advertising.',
                    },
                    {
                      name: 'Cloudflare (Security & Performance)',
                      type: 'Essential',
                      duration: 'Session',
                      purpose: 'Cloudflare CDN and security layer uses cookies for DDoS protection, bot detection, and performance optimization. These are essential for site security and cannot be disabled.',
                    },
                  ].map(cookie => (
                    <div key={cookie.name} className="bg-[#111] rounded-xl border border-white/7 p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold text-sm">{cookie.name}</h3>
                        <div className="flex gap-2 shrink-0 ml-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            cookie.type === 'Essential'
                              ? 'bg-[#e8ff47]/10 text-[#e8ff47]'
                              : 'bg-[#a78bfa]/10 text-[#a78bfa]'
                          }`}>
                            {cookie.type}
                          </span>
                          <span className="text-xs text-white/30">{cookie.duration}</span>
                        </div>
                      </div>
                      <p className="text-white/50 text-xs leading-relaxed">{cookie.purpose}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">Cookie categories explained</h2>
                <ul className="space-y-3">
                  {[
                    {
                      label: 'Essential cookies',
                      desc: 'Required for the site to function. Cannot be disabled. Examples: auth sessions, security tokens.',
                    },
                    {
                      label: 'Analytics cookies',
                      desc: 'Help us understand site usage. Data is aggregated and anonymized. You can opt out of these.',
                    },
                    {
                      label: 'Marketing cookies',
                      desc: 'We don\'t use marketing cookies. Your browsing behavior is never used for advertising.',
                    },
                  ].map(cat => (
                    <li key={cat.label} className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#e8ff47] mt-1.5 shrink-0" />
                      <div>
                        <strong className="text-white">{cat.label}:</strong>{' '}
                        <span className="text-white/50">{cat.desc}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">Managing cookies</h2>
                <p>
                  Most browsers allow you to block or delete cookies through their settings.
                  However, blocking essential cookies may break parts of our site.
                </p>
                <ul className="mt-3 space-y-1.5 list-disc list-inside text-white/50">
                  <li><a href="https://www.google.com/chrome/" target="_blank" rel="noopener" className="text-[#e8ff47] hover:underline">Chrome</a> — Settings → Privacy → Cookies</li>
                  <li><a href="https://www.mozilla.org/firefox/" target="_blank" rel="noopener" className="text-[#e8ff47] hover:underline">Firefox</a> — Options → Privacy → Cookies</li>
                  <li><a href="https://www.apple.com/safari/" target="_blank" rel="noopener" className="text-[#e8ff47] hover:underline">Safari</a> — Preferences → Privacy → Cookies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">Opting out of analytics</h2>
                <p>
                  To opt out of PostHog analytics, you can install the{' '}
                  <a
                    href="https://posthog.com/docs/privacy/opting-out-of-postHog"
                    target="_blank"
                    rel="noopener"
                    className="text-[#e8ff47] hover:underline"
                  >
                    PostHog browser opt-out
                  </a>{' '}
                  extension, or contact us at{' '}
                  <a href="mailto:hello@clawops.studio" className="text-[#e8ff47] hover:underline">hello@clawops.studio</a>.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">Updates to this policy</h2>
                <p>
                  We may update this Cookie Policy from time to time. Changes will be posted on this page.
                  We encourage you to review this policy periodically.
                </p>
              </section>

              <section>
                <h2 className="text-white font-bold text-base mb-3">Contact</h2>
                <p>
                  Questions about our use of cookies? Contact{' '}
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
