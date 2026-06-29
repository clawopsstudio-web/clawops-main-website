'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  useEffect(() => {
    // Redirect to the main onboarding form
    router.replace('/start')
  }, [router])
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-white/40 text-sm">Redirecting...</div>
    </div>
  )
}
