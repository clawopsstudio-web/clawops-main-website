import AmpereStylePricing from './AmpereStylePricing'
import Navigation from '../components/Navigation'
import Footer from '../../components/sections/Footer'

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

export const metadata = {
  title: 'Pricing — ClawOps Studio',
  description: 'Simple, flat-rate pricing for AI agents. Personal $49/mo, Team $149/mo, Business $299/mo, Enterprise $349/mo. No per-user fees.',
}
