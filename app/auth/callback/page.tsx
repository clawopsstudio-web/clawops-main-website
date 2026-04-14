'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function CallbackPage() {
  const [status, setStatus] = useState('Completing sign-in...')

  useEffect(() => {
    async function handleOAuthCallback() {
      try {
        // The supabase client auto-initializes on creation (detectSessionInUrl: true).
        // During init, _getSessionFromURL() parses the OAuth callback URL and stores
        // the session. We just need to wait for init to complete then getSession().
        // If the client hasn't initialized yet, call it explicitly first.
        await supabase.auth.initialize()
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('[OAuth callback] Error:', error.message)
          setStatus(`Error: ${error.message}`)
          window.location.href = '/auth/login?error=callback_error'
          return
        }

        if (session) {
          console.log('[OAuth callback] Session established for user:', session.user.id)
          setStatus('Authenticated! Redirecting...')
          // Brief delay to let cookies settle
          setTimeout(() => {
            window.location.href = `/${session.user.id}/dashboard`
          }, 300)
        } else {
          // Session might not be available yet — give it a moment
          setStatus('Session not ready, waiting...')
          setTimeout(async () => {
            const retry = await supabase.auth.getSession()
            if (retry.data.session) {
              window.location.href = `/${retry.data.session.user.id}/dashboard`
            } else {
              window.location.href = '/auth/login?error=no_session'
            }
          }, 1000)
        }
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
