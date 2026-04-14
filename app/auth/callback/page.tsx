'use client'

import { useEffect, useState } from 'react'

export default function CallbackPage() {
  const [debug, setDebug] = useState('Starting...\n')

  useEffect(() => {
    async function handleCallback() {
      const log = (msg: string) => {
        console.log('[Callback]', msg)
        setDebug(prev => prev + msg + '\n')
      }

      try {
        log('1. Importing supabase client')
        const { supabase } = await import('@/lib/supabase/client')

        log('2. Calling getSession()')
        const { data: { session }, error } = await supabase.auth.getSession()
        log(`3. getSession result: session=${!!session}, error=${error?.message ?? 'none'}`)

        if (session) {
          log(`4. Session found: user=${session.user.id}`)
          log(`   access_token length=${session.access_token.length}`)

          log('5. Posting to /api/auth/session')
          const res = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
              userId: session.user.id,
              expiresIn: session.expires_in,
            }),
          })
          log(`6. POST status: ${res.status}`)

          if (res.ok) {
            log('7. Success! Redirecting to dashboard')
            window.location.href = `/${session.user.id}/dashboard`
          } else {
            const text = await res.text()
            log(`7. POST failed: ${text}`)
            window.location.href = '/auth/login?error=api_failed'
          }
        } else {
          log('4. No session - check URL params')
          log(`   URL: ${window.location.href.substring(0, 100)}...`)
          log(`   Hash: ${window.location.hash.substring(0, 100)}`)
          log(`   Search: ${window.location.search.substring(0, 100)}`)

          // Check if there's a code in the URL
          const params = new URLSearchParams(window.location.search)
          if (params.has('code')) {
            log('   Code found in URL - trying explicit exchange')
            const { data: ex, error: exErr } = await supabase.auth.exchangeCodeForSession(params.get('code')!)
            log(`   Exchange: session=${!!ex.session} error=${exErr?.message}`)
            if (ex.session) {
              window.location.href = `/${ex.session.user.id}/dashboard`
              return
            }
          }

          window.location.href = '/auth/login?error=no_session'
        }
      } catch (err: any) {
        log(`ERROR: ${err.message}`)
        window.location.href = '/auth/login?error=unexpected'
      }
    }

    handleCallback()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#04040c] p-8">
      <div className="max-w-lg w-full">
        <div className="w-8 h-8 border-2 border-[#00D4FF]/30 border-t-[#00D4FF] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/60 text-sm text-center mb-4">Completing sign-in...</p>
        <pre className="text-xs text-green-400/70 bg-black/30 rounded-lg p-4 overflow-auto max-h-64 whitespace-pre-wrap">
          {debug}
        </pre>
      </div>
    </div>
  )
}
