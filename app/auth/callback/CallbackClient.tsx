'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Fresh client — NO detectSessionInUrl since we handle the code manually
function makeClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  )
}

export default function CallbackClient() {
  const [debug, setDebug] = useState<string>('')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const log = (msg: string) => {
    console.log('[Callback]', msg)
    setDebug(prev => prev + msg + '\n')
  }

  useEffect(() => {
    async function handleCallback() {
      try {
        const params = new URLSearchParams(window.location.search)
        const errorParam = params.get('error')
        const code = params.get('code')
        const next = params.get('next')

        log(`1. URL: ${window.location.href.slice(0, 80)}`)
        log(`2. code=${!!code}, error=${errorParam}`)

        if (errorParam) {
          log(`3. OAuth error: ${errorParam} — go to login`)
          window.location.href = `/auth/login?error=${errorParam}`
          return
        }

        if (!code) {
          log('3. No code in URL — redirecting to login')
          window.location.href = '/auth/login?error=no_code'
          return
        }

        log('4. Exchanging code for session')
        const supabase = makeClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        log(`5. session=${!!data.session}, error=${error?.message ?? 'none'}`)

        if (error || !data.session) {
          setStatus('error')
          log(`6. Exchange FAILED: ${error?.message}`)
          return
        }

        const { access_token, refresh_token } = data.session
        const userId = data.session.user.id
        log(`7. User ID: ${userId}`)

        // Set cookies so middleware can read them
        const domain = '.app.clawops.studio'
        const setCookie = (name: string, val: string, maxAge: number) =>
          document.cookie = `${name}=${val}; Path=/; Max-Age=${maxAge}; Domain=${domain}; SameSite=Lax; Secure`
        setCookie('sb-access-token', access_token, 3600)
        setCookie('sb-refresh-token', refresh_token, 604800)
        setCookie('sb-user-id', userId, 604800)
        log(`8. Cookies set on ${domain}`)

        // Also persist in localStorage for the SDK
        localStorage.setItem('sb-access-token', access_token)
        localStorage.setItem('sb-refresh-token', refresh_token)
        localStorage.setItem('sb-user-id', userId)
        log('9. localStorage set')

        const dest = next || `/${userId}/dashboard`
        log(`10. Redirecting to ${dest}`)
        window.location.href = dest
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
          <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
          <pre className="text-xs text-red-400/70 bg-black/30 rounded-lg p-4 text-left overflow-auto max-h-48 whitespace-pre-wrap mb-6">{debug}</pre>
          <a href="/auth/login" className="inline-block px-6 py-3 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)' }}>Back to Login</a>
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
        <pre className="text-xs text-green-400/70 bg-black/30 rounded-lg p-4 overflow-auto max-h-64 whitespace-pre-wrap">{debug || 'Starting...'}</pre>
      </div>
    </div>
  )
}
