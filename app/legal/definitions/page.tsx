import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Definitions — ClawOps Studio',
};

export default function DefinitionsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Definitions</h1>
        <p className="text-white/40 text-sm mb-8">ClawOps Studio &mdash; Last Updated: 2026-04-20</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Core Terms</h2>
            <dl className="space-y-3">
              <div><dt className="text-white/90 font-medium">ClawOps Studio (&ldquo;we,&rdquo; &ldquo;us,&rdquo; &ldquo;our&rdquo;)</dt><dd>The company providing the Agentic OS platform and related services.</dd></div>
              <div><dt className="text-white/90 font-medium">User (&ldquo;you,&rdquo; &ldquo;your&rdquo;)</dt><dd>Any person or entity that creates an account and uses the Service.</dd></div>
              <div><dt className="text-white/90 font-medium">Service</dt><dd>The ClawOps Studio platform including all AI agents, dashboard, integrations, and documentation.</dd></div>
              <div><dt className="text-white/90 font-medium">Account</dt><dd>Your registered user profile on the ClawOps Studio platform.</dd></div>
            </dl>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Agent Terms</h2>
            <dl className="space-y-3">
              <div><dt className="text-white/90 font-medium">Agent</dt><dd>An AI employee (Ryan, Tyler, Arjun, Scout, Closer, Helena, Marcus, Maya, Scheduler) configured to perform specific business tasks.</dd></div>
              <div><dt className="text-white/90 font-medium">Mission</dt><dd>A defined task or workflow assigned to an Agent, including instructions, schedule, and success criteria.</dd></div>
              <div><dt className="text-white/90 font-medium">Mission Log</dt><dd>A record of what an Agent did, when, and what the output was.</dd></div>
              <div><dt className="text-white/90 font-medium">Mission Scheduler</dt><dd>The feature that runs Missions on cron (daily, weekly, custom intervals).</dd></div>
              <div><dt className="text-white/90 font-medium">Heartbeat</dt><dd>A periodic check-in by an Agent to report status and receive updated instructions.</dd></div>
              <div><dt className="text-white/90 font-medium">Trigger</dt><dd>An event (webhook, email, form submission) that activates an Agent to perform a Mission.</dd></div>
            </dl>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Service Tier Terms</h2>
            <dl className="space-y-3">
              <div><dt className="text-white/90 font-medium">Personal Plan ($29/mo)</dt><dd>Entry tier providing access to 1-2 Agents, 3 Tool Connections, Basic Mission Scheduler, and Email Support.</dd></div>
              <div><dt className="text-white/90 font-medium">Power User Plan ($79/mo)</dt><dd>Mid-tier providing access to 3-4 Agents, 8 Tool Connections, Voice Layer, and Priority Support.</dd></div>
              <div><dt className="text-white/90 font-medium">Team Plan ($149/mo)</dt><dd>Full team access with 6 Agents, 15 Tool Connections, API Access, and Priority Support.</dd></div>
              <div><dt className="text-white/90 font-medium">Enterprise Plan ($299/mo)</dt><dd>Maximum tier with 20 Agents, Unlimited Connections, White-label available, SLA Guarantee, and Dedicated Account Manager.</dd></div>
            </dl>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Add-on Terms</h2>
            <dl className="space-y-3">
              <div><dt className="text-white/90 font-medium">5x Add-on ($50/mo)</dt><dd>Provides 5M tokens/month, 1,000 API calls per 5-hour window, and access to all Claude models (Haiku, Sonnet 4.6, Opus 4.6, Opus 4.7).</dd></div>
              <div><dt className="text-white/90 font-medium">20x Add-on ($99/mo)</dt><dd>Provides 20M tokens/month, 2,000 API calls per 5-hour window, and access to all Claude models.</dd></div>
            </dl>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Integration Terms</h2>
            <dl className="space-y-3">
              <div><dt className="text-white/90 font-medium">Composio</dt><dd>Third-party integration platform connecting Agents to 850+ applications (Gmail, Notion, HubSpot, Slack, etc.).</dd></div>
              <div><dt className="text-white/90 font-medium">OAuth Connection</dt><dd>An authorized link between your account and a third-party service, established via secure OAuth protocol.</dd></div>
              <div><dt className="text-white/90 font-medium">Tool Connection</dt><dd>A configured link between an Agent and a specific external service (e.g., &ldquo;Ryan connected to Gmail&rdquo;).</dd></div>
            </dl>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Billing Terms</h2>
            <dl className="space-y-3">
              <div><dt className="text-white/90 font-medium">Billing Cycle</dt><dd>Monthly period starting from your signup date.</dd></div>
              <div><dt className="text-white/90 font-medium">Token</dt><dd>A unit of AI processing. Each mission consumes tokens based on complexity and model used.</dd></div>
              <div><dt className="text-white/90 font-medium">API Call</dt><dd>A single request from an Agent to an external service or AI model.</dd></div>
              <div><dt className="text-white/90 font-medium">Overage</dt><dd>Usage beyond plan limits. Billed at standard rate or service paused.</dd></div>
              <div><dt className="text-white/90 font-medium">Termination</dt><dd>Account cancellation. All data deleted per Privacy Policy retention schedule.</dd></div>
            </dl>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Legal Terms</h2>
            <dl className="space-y-3">
              <div><dt className="text-white/90 font-medium">Acceptable Use</dt><dd>Rules governing how you may use the Service. Violation may result in termination.</dd></div>
              <div><dt className="text-white/90 font-medium">Service Level Agreement (SLA)</dt><dd>Uptime guarantee. Enterprise Plan includes 99.9% uptime SLA.</dd></div>
              <div><dt className="text-white/90 font-medium">Intellectual Property</dt><dd>Ownership rights. ClawOps Studio owns platform IP. User owns their agent configurations and content.</dd></div>
              <div><dt className="text-white/90 font-medium">Indemnification</dt><dd>Your obligation to cover legal costs if your use of the Service causes third-party claims.</dd></div>
            </dl>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Technical Terms</h2>
            <dl className="space-y-3">
              <div><dt className="text-white/90 font-medium">VPS (Virtual Private Server)</dt><dd>Your dedicated server where Agents run 24/7.</dd></div>
              <div><dt className="text-white/90 font-medium">Dashboard</dt><dd>The web interface at app.clawops.studio for managing your Account, Agents, and Missions.</dd></div>
              <div><dt className="text-white/90 font-medium">Webhook</dt><dd>An automated HTTP notification sent when a specific event occurs.</dd></div>
              <div><dt className="text-white/90 font-medium">Cron</dt><dd>A scheduled task running at defined intervals (daily, weekly, etc.).</dd></div>
            </dl>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>Questions? Email <span className="text-purple-400">support@clawops.studio</span></p>
          </section>
        </div>
      </div>
    </div>
  );
}
