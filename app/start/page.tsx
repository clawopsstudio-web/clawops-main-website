import type { Metadata } from 'next'
import StartForm from './StartForm'

export const metadata: Metadata = {
  title: 'Get Started — ClawOps Studio',
  description: 'Set up your AI workforce in minutes. Pick your agents, connect your tools, and go.',
}

export default function StartPage() {
  return <StartForm />
}
