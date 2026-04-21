import AgentCards from '../components/AgentCard'

export const metadata = {
  title: 'AI Agents — ClawOps Studio',
  description: 'Browse and recruit AI agents for your team. Sales, Marketing, Research, Support, Finance, Engineering — each built to work autonomously.',
}

export default function RolesPage() {
  return (
    <main className="min-h-screen bg-[#04040c]">
      {/* Header */}
      <div className="pt-32 pb-16 px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(255,255,255,0.4)] mb-4">
          THE AGENTIC OS
        </p>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Pick your AI team.
        </h1>
        <p className="text-white/50 text-lg max-w-xl mx-auto">
          Each agent is specialized, autonomous, and connected to your tools. 
          Recruit the ones that fit your business. They work 24/7 — no salary, no burnout.
        </p>
      </div>

      {/* Agent Cards Grid with filters */}
      <div className="pb-24 px-6 max-w-7xl mx-auto">
        <AgentCards />
      </div>
    </main>
  )
}
