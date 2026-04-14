'use client'

import { useEffect, useState } from 'react'

export default function CallbackClient() {
  const [debug, setDebug] = useState<string>('Starting...\n')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const log = (msg: string) => {
    console.log('[Callback]', msg)
    setDebug(prev => prev + msg + '\n')
  }

  useEffect(() => {
    async function handleCallback() {
      try {
        log('1. Importing supabase client')
        const { supabase } = await import('@/lib/supabase/client')

        // First try: Supabase SDK may have already stored session from URL hash or cookie
        log('2. Calling getSession()')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        log(`3. getSession: session=${!!session}, error=${sessionError?.message ?? 'none'}`)

        if (session) {
          log(`4. Session found in browser: user=${session.user.id}`)
          log('5. Redirecting to dashboard')
          window.location.href = `/${session.user.id}/dashboard`
          return
        }

        // Second try: URL has ?code= from PKCE flow — exchange it
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        if (code) {
          log(`4. URL has code=${code.slice(0, 10)}... — exchanging for session`)
          const { data: ex, error: exErr } = await supabase.auth.exchangeCodeForSession(code)
          log(`5. Exchange: session=${!!ex.session} error=${exErr?.message ?? 'none'}`)

          if (exErr || !ex.session) {
            setStatus('error')
            setDebug(prev => prev + `Exchange failed: ${exErr?.message}\n`)
            return
          }

          // Persist session in browser storage so server components can read it
          log('6. Persisting session via setSession()')
          const { error: setErr } = await supabase.auth.setSession({
            access_token: ex.session.access_token,
            refresh_token: ex.session.refresh_token,
          })
          log(`7. setSession: error=${setErr?.message ?? 'none'}`)

          if (setErr) {
            setStatus('error')
            setDebug(prev => prev + `setSession failed: ${setErr.message}\n`)
            return
          }

          log(`8. Redirecting to /${ex.session.user.id}/dashboard`)
          window.location.href = `/${ex.session.user.id}/dashboard`
          return
        }

        // No code, no session — redirect to login
        log('4. No code in URL, no session found — redirecting to login')
        window.location.href = '/auth/login?error=no_code'
      } catch (err: any) {
        log(`ERROR: ${err.message}`)
        setStatus('error')
      }
    }

    handleCallback()
  }, [])

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#04040c] p-8">
        <div className="max-w-lg w-full text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-xl">✕</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
          <p className="text-white/50 text-sm mb-6">Something went wrong during sign-in. Please try again.</p>
          <pre className="text-xs text-red-400/70 bg-black/30 rounded-lg p-4 text-left overflow-auto max-h-40 whitespace-pre-wrap mb-6">
            {debug}
          </pre>
          <a
            href="/auth/login"
            className="inline-block px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)' }}
          >
            Back to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#04040c] p-8">
      <div className="max-w-lg w-full">
        <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center mx-auto mb-4">
          <div className="w-5 h-5 rounded-full border-2 border-[#00D4FF] border-t-transparent animate-spin" />
        </div>
        <p className="text-white/60 text-sm text-center mb-4">Completing sign-in...</p>
        <pre className="text-xs text-green-400/70 bg-black/30 rounded-lg p-4 overflow-auto max-h-64 whitespace-pre-wrap">
          {debug}
        </pre>
      </div>
    </div>
  )
}
