'use client'

import { useEffect, useState } from 'react'

export default function CallbackPage() {
  const [status, setStatus] = useState('Completing sign-in...')

  useEffect(() => {
    async function handleOAuthCallback() {
      try {
        // Dynamically import supabase to ensure it's only in the browser
        const { supabase } = await import('@/lib/supabase/client')

        // Wait for supabase client to initialize and process URL
        await supabase.auth.initialize()
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error || !session) {
          console.error('[OAuth callback] Error:', error?.message)
          setStatus('Authentication failed. Redirecting...')
          window.location.href = '/auth/login?error=callback_error'
          return
        }

        console.log('[OAuth callback] Session established for user:', session.user.id)

        // POST session tokens to our API route which sets HTTP-only cookies
        // This bridges browser localStorage → server cookies that middleware can read
        const setSessionRes = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            userId: session.user.id,
            expiresIn: session.expires_in,
          }),
        })

        if (!setSessionRes.ok) {
          console.error('[OAuth callback] Failed to set server session')
          window.location.href = '/auth/login?error=session_write_failed'
          return
        }

        setStatus('Authenticated! Redirecting to dashboard...')
        window.location.href = `/${session.user.id}/dashboard`
      } catch (err: any) {
        console.error('[OAuth callback] Unexpected error:', err)
        setStatus('Unexpected error occurred')
        window.location.href = '/auth/login?error=unexpected'
      }
    }

    handleOAuthCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#04040c]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#00D4FF]/30 border-t-[#00D4FF] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm">{status}</p>
      </div>
    </div>
  )
}
