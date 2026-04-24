'use client'
// SSO callback — not used with Supabase email/password auth
// Redirects to signup
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SSOCallback() {
  const router = useRouter()
  useEffect(() => { router.replace('/auth/signup') }, [router])
  return <div className="min-h-screen bg-[#0a0a0a]" />
}
