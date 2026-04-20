import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — ClawOps Studio',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#04040c] py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-8">ClawOps Studio &mdash; Last Updated: 2026-04-20</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using ClawOps Studio (&ldquo;Service&rdquo;), you (&ldquo;User,&rdquo; &ldquo;you,&rdquo; or &ldquo;your&rdquo;) agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these Terms, do not access or use the Service.</p>
            <p className="mt-2">ClawOps Studio reserves the right to modify these Terms at any time. Continued use of the Service constitutes acceptance of modified Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p className="mb-2">ClawOps Studio provides an AI agent platform (&ldquo;Agentic OS&rdquo;) enabling users to deploy, configure, and manage AI agents that perform tasks including sales outreach, marketing automation, research, customer support, and business operations.</p>
            <p className="mb-2">The Service includes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Access to AI agents (Ryan, Tyler, Arjun, Scout, Closer, Helena, Marcus, Maya, Scheduler, and others)</li>
              <li>Integration with third-party tools via API connections</li>
              <li>Mission scheduling and automation capabilities</li>
              <li>Dashboard and reporting tools</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Eligibility</h2>
            <p>You must be at least 18 years old and have the legal capacity to enter into contracts. By using the Service, you represent and warrant that you meet these requirements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Account Registration</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>You must provide accurate, current, and complete information during registration.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You agree to notify us immediately of any unauthorized access.</li>
              <li>One account per person or business entity.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Acceptable Use</h2>
            <p className="mb-2">You agree NOT to use the Service to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Violate any applicable law or regulation</li><li>Infringe intellectual property rights</li><li>Send spam, phishing, or unsolicited communications</li><li>Generate harmful, offensive, or illegal content</li><li>Circumvent security measures</li><li>Resell the Service without authorization</li><li>Use the Service for fraudulent purposes</li><li>Violate the rights of third parties</li>
            </ul>
            <p className="mt-2">We reserve the right to suspend or terminate accounts violating these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Payment and Billing</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>Fees are billed monthly in advance.</li><li>All fees are non-refundable except as required by law.</li><li>You authorize automatic billing on your selected billing cycle.</li><li>We reserve the right to change pricing with 30 days notice.</li><li>Failed payments may result in service suspension.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. AI Agent Behavior</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>AI agents act on your behalf based on your configured missions and instructions.</li>
              <li>You are responsible for reviewing and approving agent outputs.</li>
              <li>You are responsible for ensuring agent actions comply with applicable laws.</li>
              <li>We are not responsible for actions taken by AI agents operating per your configuration.</li>
              <li>AI agents may generate content that is inaccurate &mdash; review all outputs before use.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Third-Party Integrations</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>The Service connects to third-party tools (Gmail, Notion, HubSpot, etc.) via API connections you authorize.</li>
              <li>You authorize these integrations at your own risk.</li>
              <li>Third-party services are governed by their own terms and privacy policies.</li>
              <li>We are not responsible for third-party service availability or errors.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Intellectual Property</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>ClawOps Studio and its design, trademarks, and content are our property.</li>
              <li>You retain ownership of content you provide to the Service.</li>
              <li>Agent configurations and mission templates you create are your property.</li>
              <li>We may use anonymized, aggregated data for Service improvement.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Confidentiality</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>We maintain confidentiality of your business data processed by our Service.</li>
              <li>Your data is processed in accordance with our Privacy Policy.</li>
              <li>We implement industry-standard security measures.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Disclaimer of Warranties</h2>
            <p className="mb-2">THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT GUARANTEE:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Uninterrupted or error-free operation</li><li>Specific results from agent actions</li><li>Accuracy of AI-generated content</li><li>Third-party service availability</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Limitation of Liability</h2>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, CLAWOPS STUDIO SHALL NOT BE LIABLE FOR: indirect, incidental, special, or consequential damages; loss of profits, data, or business opportunities; actions taken by AI agents per your configuration; third-party service failures; damages exceeding fees paid in the prior 12 months.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Indemnification</h2>
            <p>You agree to indemnify and hold harmless ClawOps Studio from claims arising from: your use of the Service; violation of these Terms; your agent configurations; misuse of third-party integrations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">14. Termination</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>You may terminate your account at any time via dashboard or by contacting support.</li>
              <li>We may terminate accounts violating these Terms with notice.</li>
              <li>Upon termination, access to the Service ceases immediately.</li>
              <li>Data deletion: see our Privacy Policy for retention timelines.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">15. Governing Law</h2>
            <p>These Terms are governed by applicable laws. Disputes shall be resolved through binding arbitration.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">16. Contact</h2>
            <p>For questions about these Terms, contact: <span className="text-purple-400">legal@clawops.studio</span></p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">17. Changes to Terms</h2>
            <p>We update these Terms periodically. Material changes will be communicated via email or dashboard notification. Continued use constitutes acceptance.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
