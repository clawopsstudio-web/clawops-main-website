import type { Metadata } from 'next'
import { Suspense } from 'react'
import StartForm from './StartForm'

export const metadata: Metadata = {
  title: 'Get Started — ClawOps Studio',
  description: 'Set up your AI workforce in minutes. Pick your agents, connect your tools, and go.',
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
