'use client'

import HeroNew from './HeroNew'
import AgentCards from './components/AgentCard'
import LiveFeed from './components/LiveFeed'
import HowItWorks from '@/components/sections/HowItWorks'
import UseCases from '@/components/sections/UseCases'
import Integrations from '@/components/sections/Integrations'
import AmpereStylePricing from './pricing/AmpereStylePricing'
import FAQ from '@/components/sections/FAQ'
import CTA from '@/components/sections/CTA'
import SocialProof from '@/components/sections/SocialProof'
import WhyClawOps from '@/components/sections/WhyClawOps'

export default function LandingPage() {
  return (
    <main>
      <HeroNew />
      <SocialProof />
      <WhyClawOps />
      <LiveFeed />
      <section id="agents">
        <div className="py-24 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Pick your AI team.
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Each agent is specialized, autonomous, and connected to your tools. Recruit the ones that fit your business.
            </p>
          </div>
          <AgentCards />
        </div>
      </section>
      <HowItWorks />
      <UseCases />
      <Integrations />
      <AmpereStylePricing />
      <FAQ />
      <CTA />
    </main>
  )
}
