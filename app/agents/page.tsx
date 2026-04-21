import AgentCards from '../components/AgentCard'
import Navigation from '../components/Navigation'
import Footer from '../../components/sections/Footer'

export const metadata = {
  title: 'AI Agents — ClawOps Studio',
  description: 'Browse and recruit AI agents for your team. Sales, Marketing, Research, Support, Finance, Engineering — each built to work autonomously.',
  openGraph: {
    title: 'AI Agents — ClawOps Studio',
    description: 'Browse and recruit AI agents for your team. Sales, Marketing, Research, Support, Finance, Engineering — each built to work autonomously.',
    type: 'website',
    images: [{ url: 'https://clawops.studio/og/agents.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Agents — ClawOps Studio',
    description: 'Browse and recruit AI agents for your team.',
    images: ['https://clawops.studio/og/agents.png'],
  },
}

export default function AgentsPage() {
  return (
    <>
      <Navigation />
      <main className="pt-16">
      {/* Header */}
      <div className="pt-32 pb-16 px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(232,255,71,0.6)] mb-4">
          THE AGENTIC OS
        </p>
        <h1
          className="text-5xl md:text-7xl font-black text-white mb-5 leading-none tracking-tight"
          style={{ fontFamily: 'var(--font-cabinet, sans-serif)', letterSpacing: '-0.03em' }}
        >
          YOUR AGENTS
        </h1>
        <p className="text-white/40 text-base max-w-md mx-auto">
          Pick your team. Deploy in minutes.
        </p>
      </div>

      {/* Agent Cards Grid with filters */}
      <div className="pb-24 px-6 max-w-7xl mx-auto">
        <AgentCards />
      </div>
      </main>
      <Footer />
    </>
  )
}
