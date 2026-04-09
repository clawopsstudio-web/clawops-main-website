'use client'

import { useRouter } from 'next/navigation'

const PLANS = [
  {
    name: 'Starter',
    price: 49,
    description: 'Your first AI worker. Perfect for solopreneurs and side projects.',
    highlight: false,
    features: [
      '2 vCPU, 4GB RAM, 50GB SSD NVMe',
      '1 AI Agent Workspace',
      'Gemma 4 2B (local, free)',
      'Chrome Browser Automation',
      'Playwright Integration',
      'Telegram Integration',
      '5 n8n Workflows/month',
      'Email Support',
      '30-day Chat History'
    ],
    savings: '$2,400/year',
    painPoints: [
      'Respond to customers in 1 second (not 3 hours)',
      'Automate 10+ hours of manual work per week',
      'No API costs - Gemma 4 2B is free and runs locally'
    ]
  },
  {
    name: 'Pro',
    price: 99,
    description: 'Full AI team. For growing businesses that need more.',
    highlight: true,
    features: [
      '4 vCPU, 8GB RAM, 100GB SSD NVMe',
      '3 AI Agent Workspaces',
      'Gemma 4 2B + 7B (upgradeable)',
      'Chrome + WhatsApp Integration',
      'n8n Workflows (unlimited)',
      'Firecrawl Web Scraping',
      'Task Automation',
      'Priority Support (4h)',
      '60-day Chat History'
    ],
    savings: '$36,000/year',
    painPoints: [
      '5+ employees worth of work for one monthly fee',
      'Respond 24/7 - never miss a lead or opportunity',
      'All tools included - no more $200/month subscriptions'
    ]
  },
  {
    name: 'Business',
    price: 149,
    description: 'Unlimited scale. For agencies and serious operations.',
    highlight: false,
    features: [
      '6 vCPU, 12GB RAM, 200GB SSD NVMe',
      'Unlimited AI Agent Workspaces',
      'Any local model (custom)',
      'All messaging platforms',
      'All pre-configured tools',
      'API Access',
      'Dedicated Support (1h)',
      'Go High Level Integration',
      'Custom Workflows',
      'Slack + Discord Integration'
    ],
    savings: '$54,000/year',
    painPoints: [
      'Scale to unlimited clients with one subscription',
      'White-label capability for your agency',
      'Your own VPS infrastructure with dedicated resources'
    ]
  }
]

export default function AmpereStylePricing() {
  const router = useRouter()

  return (
    <div className="container mx-auto px-4 py-16 bg-[#04040c]">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          The AI Agent Platform<br />
          <span className="bg-gradient-to-r from-[#00D4FF] to-[#6600FF] bg-clip-text text-transparent">
            Your Team Has Been Waiting For
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Unlimited agents. Flat monthly pricing. Zero per-token billing. Pick a plan, connect your tools, deploy your AI workforce.
        </p>
      </div>

      {/* Value Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-[#2d2d44]">
          <div className="text-3xl font-bold text-[#00D4FF] mb-2">$3,000/mo</div>
          <p className="text-gray-400">What you save vs hiring humans</p>
        </div>
        <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-[#2d2d44]">
          <div className="text-3xl font-bold text-[#6600FF] mb-2">$35,000/yr</div>
          <p className="text-gray-400">Total savings over 12 months</p>
        </div>
        <div className="bg-[#1a1a2e] rounded-2xl p-8 border border-[#2d2d44]">
          <div className="text-3xl font-bold text-white mb-2">3 minutes</div>
          <p className="text-gray-400">Time to deploy your first agent</p>
        </div>
      </div>

      {/* Pain Points Comparison */}
      <div className="bg-[#1a1a2e] rounded-2xl p-8 mb-16 border border-[#2d2d44]">
        <h2 className="text-2xl font-bold mb-6">Why This Is Cheaper Than Hiring</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PLANS.map((plan) => (
            <div key={plan.name}>
              <h3 className="text-xl font-semibold mb-4">{plan.name} Tier</h3>
              <ul className="space-y-2">
                {plan.painPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-300">
                    <span className="text-[#00D4FF] mt-1">→</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl overflow-hidden transition-all duration-300 ${
              plan.highlight
                ? 'bg-[#1a1a2e] border-2 border-[#6600FF] shadow-2xl'
                : 'bg-[#1a1a2e] border border-[#2d2d44]'
            }`}
          >
            {plan.highlight && (
              <div className="bg-gradient-to-r from-[#00D4FF] to-[#6600FF] text-white text-sm font-semibold py-2 text-center">
                MOST POPULAR
              </div>
            )}

            <div className="p-8">
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-5xl font-bold">${plan.price}</span>
                <span className="text-gray-400">/month</span>
              </div>

              <div className="bg-[#0f0f1a] rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-400">You Save</p>
                <p className="text-2xl font-bold text-[#10b981]">{plan.savings}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <span className="text-[#00D4FF] mt-1">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => router.push(`/auth/signup?plan=${plan.name.toLowerCase()}`)}
                className={`w-full py-3 rounded-lg font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-[#00D4FF] to-[#6600FF] text-white hover:opacity-90 hover:shadow-[0_0_25px_rgba(0,212,255,0.3)]'
                    : 'bg-[#2d2d44] text-white hover:bg-[#3d3d54]'
                }`}
              >
                Get Started — ${plan.price}/mo
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* What's Included Section */}
      <div className="max-w-5xl mx-auto mt-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Everything You Get (No Hidden Costs)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-2">🚀</div>
            <p className="text-gray-400 text-sm">Instant Deployment</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🔐</div>
            <p className="text-gray-400 text-sm">Bank-Grade Security</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🎯</div>
            <p className="text-gray-400 text-sm">24/7 Availability</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">💰</div>
            <p className="text-gray-400 text-sm">100% Local AI</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🔌</div>
            <p className="text-gray-400 text-sm">50+ Integrations</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-gray-400 text-sm">Full Documentation</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">💬</div>
            <p className="text-gray-400 text-sm">Priority Support</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🔄</div>
            <p className="text-gray-400 text-sm">30-Day Money Back</p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto mt-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="bg-[#1a1a2e] rounded-lg p-6 border border-[#2d2d44]">
            <h3 className="font-semibold mb-2">What exactly am I paying for?</h3>
            <p className="text-gray-400 text-sm">
              You're paying for a pre-configured VPS with GPU-ready infrastructure and our pre-built AI tools. No per-user fees, no API costs. Your first month includes $10,000 worth of AI capabilities.
            </p>
          </div>
          <div className="bg-[#1a1a2e] rounded-lg p-6 border border-[#2d2d44]">
            <h3 className="font-semibold mb-2">Can I add more than one agent?</h3>
            <p className="text-gray-400 text-sm">
              Yes. With Starter, you get 1 agent workspace. Upgrade to Pro for 3, or Business for unlimited agents. Each agent can specialize in different tasks.
            </p>
          </div>
          <div className="bg-[#1a1a2e] rounded-lg p-6 border border-[#2d2d44]">
            <h3 className="font-semibold mb-2">What happens if I need more resources?</h3>
            <p className="text-gray-400 text-sm">
              You can upgrade your plan anytime. We'll provision additional vCPU, RAM, and SSD automatically. Need custom setup? Contact our enterprise team.
            </p>
          </div>
          <div className="bg-[#1a1a2e] rounded-lg p-6 border border-[#2d2d44]">
            <h3 className="font-semibold mb-2">Is my data safe?</h3>
            <p className="text-gray-400 text-sm">
              Absolutely. Your agents run on your own VPS. We use encryption, firewall protection, and regular backups. Your data never leaves your infrastructure unless you explicitly send it.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}