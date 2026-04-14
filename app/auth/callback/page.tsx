'use client'

import { useEffect, useState } from 'react'

export default function CallbackPage() {
  const [status, setStatus] = useState('Completing sign-in...')
  const [error, setError] = useState('')

  useEffect(() => {
    async function handleCallback() {
      try {
        // Import supabase dynamically (browser only)
        const { supabase } = await import('@/lib/supabase/client')

        // Supabase client auto-initializes and processes URL params.
        // detectSessionInUrl: true → reads code from URL, exchanges for session,
        // stores in localStorage. We just need to wait for that to complete.
        await supabase.auth.initialize()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('[Callback] Session error:', sessionError.message)
          setError(sessionError.message)
          setStatus('Authentication failed.')
          setTimeout(() => {
            window.location.href = `/auth/login?error=callback_error`
          }, 2000)
          return
        }

        if (!session) {
          // Session not found — might be a PKCE flow where code needs explicit exchange
          // Try exchanging any code in URL explicitly
          const params = new URLSearchParams(window.location.search)
          const code = params.get('code')
          if (code) {
            const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            if (exchangeError || !exchangeData.session) {
              console.error('[Callback] Exchange failed:', exchangeError?.message)
              setError('Code exchange failed')
              window.location.href = '/auth/login?error=exchange_failed'
              return
            }
            // Session established from code exchange
            const userId = exchangeData.session.user.id
            await syncSessionToServer(exchangeData.session.access_token, exchangeData.session.refresh_token, userId, exchangeData.session.expires_in)
            return
          }

          console.error('[Callback] No session and no code in URL')
          setError('No session found')
          window.location.href = '/auth/login?error=no_session'
          return
        }

        // Session found — sync to server cookies and redirect
        const userId = session.user.id
        await syncSessionToServer(session.access_token, session.refresh_token, userId, session.expires_in)
      } catch (err: any) {
        console.error('[Callback] Unexpected error:', err)
        setError(err.message || 'Unknown error')
        setStatus('Error occurred.')
        setTimeout(() => {
          window.location.href = '/auth/login?error=unexpected'
        }, 2000)
      }
    }

    async function syncSessionToServer(accessToken: string, refreshToken: string | undefined, userId: string, expiresIn: number | undefined) {
      try {
        const apiUrl = `${window.location.origin}/api/auth/session`
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Important: include cookies in this request
          body: JSON.stringify({
            accessToken,
            refreshToken: refreshToken ?? '',
            userId,
            expiresIn: expiresIn ?? 3600,
          }),
        })

        if (!res.ok) {
          console.error('[Callback] Failed to sync session to server, status:', res.status)
          setError('Failed to create server session')
          window.location.href = '/auth/login?error=sync_failed'
          return
        }

        console.log('[Callback] Session synced to server, redirecting to dashboard')
        setStatus('Authenticated! Redirecting...')
        window.location.href = `/${userId}/dashboard`
      } catch (err) {
        console.error('[Callback] Fetch failed:', err)
        setError('Network error')
        window.location.href = '/auth/login?error=network_error'
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#04040c]">
      <div className="text-center max-w-md">
        <div className="w-8 h-8 border-2 border-[#00D4FF]/30 border-t-[#00D4FF] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm mb-2">{status}</p>
        {error && (
          <p className="text-red-400 text-xs mt-2">{error}</p>
        )}
      </div>
    </div>
  )
}
