'use client'
// SSO callback — not used with Supabase email/password auth
// Redirects to login
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SSOCallback() {
  const router = useRouter()
  useEffect(() => { router.replace('/auth/login') }, [router])
  return <div className="min-h-screen bg-[#0a0a0a]" />
}
