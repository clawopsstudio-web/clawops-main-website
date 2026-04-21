import type { Metadata } from 'next'
import AmpereStylePricing from './AmpereStylePricing'
import Navigation from '../components/Navigation'
import Footer from '../../components/sections/Footer'

export const metadata: Metadata = {
  title: 'Pricing — ClawOps Studio',
  description: 'Simple, flat-rate pricing for AI agents. Personal $49/mo, Team $149/mo, Business $299/mo, Enterprise $349/mo. No per-user fees.',
  openGraph: {
    title: 'Pricing — ClawOps Studio',
    description: 'Simple, flat-rate pricing for AI agents. No per-user fees. No token billing.',
    type: 'website',
    images: [{ url: 'https://clawops.studio/og/pricing.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing — ClawOps Studio',
    description: 'Simple, flat-rate pricing for AI agents. No per-user fees.',
    images: ['https://clawops.studio/og/pricing.png'],
  },
}

export default function PricingPage() {
  return (
    <>
      <Navigation />
      <main className="pt-16">
        <AmpereStylePricing />
      </main>
      <Footer />
    </>
  )
}
