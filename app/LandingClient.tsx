'use client'

import Hero from '@/components/sections/Hero'
import Features from '@/components/sections/Features'
import HowItWorks from '@/components/sections/HowItWorks'
import UseCases from '@/components/sections/UseCases'
import Integrations from '@/components/sections/Integrations'
import AmpereStylePricing from '@/app/pricing/AmpereStylePricing'
import CTA from '@/components/sections/CTA'
import FAQ from '@/components/sections/FAQ'
import SocialProof from '@/components/sections/SocialProof'
import WhyClawOps from '@/components/sections/WhyClawOps'
import AIDepartments from '@/components/sections/AIDepartments'
import MissionControl from '@/components/sections/MissionControl'
import Deployment from '@/components/sections/Deployment'

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <SocialProof />
      <WhyClawOps />
      <Features />
      <AIDepartments />
      <HowItWorks />
      <UseCases />
      <MissionControl />
      <Deployment />
      <Integrations />
      <AmpereStylePricing />
      <FAQ />
      <CTA />
    </main>
  )
}
