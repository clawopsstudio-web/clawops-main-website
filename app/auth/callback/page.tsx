/**
 * app/auth/callback/page.tsx
 * OAuth callback stub — redirects to dashboard.
 * Used if any external auth flow references this URL.
 */
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CallbackPage() {
  const router = useRouter()
  useEffect(() => {
    router.push('/dashboard')
  }, [router])
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-white/60 text-sm">Signing you in...</div>
    </div>
  )
}
