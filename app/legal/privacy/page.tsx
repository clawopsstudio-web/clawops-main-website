import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — ClawOps Studio',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#04040c] py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-8">ClawOps Studio &mdash; Last Updated: 2026-04-20</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <h3 className="text-lg font-medium text-white/80 mb-2">1.1 Account Information</h3>
            <p className="mb-2">When you register, we collect:</p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Full name</li><li>Email address</li><li>Company name (optional)</li><li>Billing information</li>
            </ul>
            <h3 className="text-lg font-medium text-white/80 mb-2">1.2 Usage Data</h3>
            <p className="mb-2">We automatically collect:</p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Agent mission logs (what agents did)</li><li>API request timestamps</li><li>Feature usage patterns</li><li>Browser and device information</li>
            </ul>
            <h3 className="text-lg font-medium text-white/80 mb-2">1.3 Third-Party Data</h3>
            <p>When you connect integrations, we receive: OAuth tokens (encrypted), connected service metadata, and data you explicitly share via integrations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Provide and improve the Service</li><li>Process payments</li><li>Communicate important updates</li><li>Generate agent mission reports</li><li>Monitor service health</li><li>Prevent fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Data Sharing</h2>
            <p className="mb-2">We do NOT sell your personal data. We share data only with:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-white/80">Service providers</strong> (hosting, analytics, payment processing)</li>
              <li><strong className="text-white/80">Third-party integrations</strong> you authorize (Gmail, Notion, HubSpot, etc.)</li>
              <li><strong className="text-white/80">Legal requirements</strong> (when required by law)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Retention</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-white/80">Account data:</strong> Retained until account deletion + 90 days</li>
              <li><strong className="text-white/80">Mission logs:</strong> Retained for 12 months, then anonymized</li>
              <li><strong className="text-white/80">Payment data:</strong> Retained per financial regulations</li>
              <li><strong className="text-white/80">Agent outputs:</strong> You control deletion &mdash; contact support to purge</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Access your personal data</li><li>Correct inaccurate data</li><li>Delete your account and data</li><li>Export your data</li><li>Opt out of marketing communications</li><li>Restrict certain processing</li>
            </ul>
            <p className="mt-2">Contact <span className="text-purple-400">privacy@clawops.studio</span> for any data requests.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Security</h2>
            <p>We implement AES-256 encryption at rest, TLS 1.3 for data in transit, regular security audits, access controls and monitoring, and SOC 2 compliance (in progress).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. AI Agent Data</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>Agents process your instructions and data to perform tasks.</li>
              <li>Agent mission logs are stored on your VPS (you control your data).</li>
              <li>We do not use your agent data to train AI models.</li>
              <li>Agent outputs are your intellectual property.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Cookies</h2>
            <p>We use essential cookies for authentication and session management. No advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Children&apos;s Privacy</h2>
            <p>The Service is not intended for users under 18. We do not knowingly collect data from minors.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. International Transfers</h2>
            <p>Data may be processed in jurisdictions outside your country. We ensure appropriate safeguards are in place.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Changes to This Policy</h2>
            <p>We update this Privacy Policy periodically. Material changes will be communicated via email. Continued use constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Contact</h2>
            <p>Privacy inquiries: <span className="text-purple-400">privacy@clawops.studio</span></p>
          </section>
        </div>
      </div>
    </div>
  );
}
