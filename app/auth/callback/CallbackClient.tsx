'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function CallbackClient() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search)
      const next = params.get('next') || '/dashboard'
      const code = params.get('code')

      if (!code) {
        const { data, error } = await supabase.auth.getSession()
        if (error || !data.session) {
          window.location.href = '/auth/login'
          return
        }
        window.location.href = `${window.location.origin}${next}`
        return
      }

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.error('[AUTH CALLBACK] Error:', error.message)
        setStatus('error')
        setErrorMessage(error.message)
        return
      }

      console.log('[AUTH CALLBACK] Session established for:', data.user?.email)
      setStatus('success')

      // Redirect directly to VPS-hosted dashboard
      const userId = data.user?.id
      const destination = userId
        ? `https://app.clawops.studio/${userId}/dashboard`
        : next.startsWith('http')
          ? next
          : `${window.location.origin}${next}`

      console.log('[AUTH CALLBACK] Redirecting to:', destination)
      window.location.href = destination
    }

    handleCallback()
  }, [])

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-[#04040c] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold mb-2">Authentication Failed</h1>
          <p className="text-white/60 text-sm mb-4">{errorMessage}</p>
          <a
            href="/auth/login"
            className="inline-block px-6 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)' }}
          >
            Back to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#04040c] flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-white/40">
          {status === 'success' ? 'Authenticated! Redirecting...' : 'Completing sign in...'}
        </p>
      </div>
    </div>
  )
}
