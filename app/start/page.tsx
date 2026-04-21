import type { Metadata } from 'next'
import { Suspense } from 'react'
import StartForm from './StartForm'

export const metadata: Metadata = {
  title: 'Get Started — ClawOps Studio',
  description: 'Set up your AI workforce in minutes. Pick your agents, connect your tools, and go.',
  openGraph: {
    title: 'Get Started — ClawOps Studio',
    description: 'Set up your AI workforce in minutes. Pick your agents, connect your tools, and go.',
    type: 'website',
    images: [{ url: 'https://clawops.studio/og/start.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get Started — ClawOps Studio',
    description: 'Set up your AI workforce in minutes.',
    images: ['https://clawops.studio/og/start.png'],
  },
}

export default function StartPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-[#666] text-sm">Loading...</div>
      </div>
    }>
      <StartForm />
    </Suspense>
  )
}
