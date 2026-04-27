import type { Metadata } from 'next'
import Navigation from '../components/Navigation'
import Footer from '../../components/sections/Footer'
import TeamPageClient from './TeamPageClient'

export const metadata: Metadata = {
  title: 'The Team — ClawOps Studio',
  description: 'Meet your AI workforce. Six specialized agents for Sales, Research, Marketing, Support, Operations, and Finance.',
  openGraph: {
    title: 'The Team — ClawOps Studio',
    description: 'Meet your AI workforce. Six specialized agents for every part of your business.',
    type: 'website',
  },
}

export default function TeamPage() {
  return (
    <>
      <Navigation />
      <main className="pt-16">
        <TeamPageClient />
      </main>
      <Footer />
    </>
  )
}
