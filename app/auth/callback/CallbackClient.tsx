'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

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
        // Supabase puts the auth code in the URL FRAGMENT (#code=...), NOT in query string (?)
        // Example: /auth/callback#code=xxx&...  — fragment never sent to server
        const fullUrl = window.location.href
        const hash = window.location.hash  // e.g. "#code=abc123&..."
        const search = window.location.search // e.g. "?error=..."

        log(`1. hash: ${hash.substring(0, 60) || '(empty)'} `)
        log(`2. search: ${search || '(empty)'}`)

        // Check for OAuth errors in query string first
        const params = new URLSearchParams(search)
        const errorParam = params.get('error')
        if (errorParam) {
          log(`3. OAuth error: ${errorParam} → login`)
          window.location.href = `/auth/login?error=${errorParam}`
          return
        }

        // Parse code from FRAGMENT (not query string!)
        // Supabase format: #code=xxx&...  or #access_token=xxx&...
        let code: string | null = null
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1)) // strip the '#'
          code = hashParams.get('code')
          log(`3. Code from hash: ${code ? code.substring(0, 15) + '...' : 'none'}`)
        }

        // Also check query string (for non-hash OAuth flows)
        if (!code) {
          code = params.get('code')
          log(`4. Code from search: ${code ? code.substring(0, 15) + '...' : 'none'}`)
        }

        if (!code) {
          log('5. No code found in hash or search → login')
          window.location.href = '/auth/login?error=no_code'
          return
        }

        log('6. Exchanging code for session')
        const supabase = makeClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        log(`7. session=${!!data.session}, error=${error?.message ?? 'none'}`)

        if (error || !data.session) {
          setStatus('error')
          log(`8. Exchange FAILED: ${error?.message}`)
          return
        }

        const { access_token, refresh_token } = data.session
        const userId = data.session.user.id
        log(`9. User ID: ${userId}`)

        // Set cookies so middleware can read them
        const domain = '.app.clawops.studio'
        const setCookie = (name: string, val: string, maxAge: number) =>
          document.cookie = `${name}=${val}; Path=/; Max-Age=${maxAge}; Domain=${domain}; SameSite=Lax; Secure`
        setCookie('sb-access-token', access_token, 3600)
        setCookie('sb-refresh-token', refresh_token, 604800)
        setCookie('sb-user-id', userId, 604800)
        log(`10. Cookies set on ${domain}`)

        const dest = params.get('next') || `/${userId}/dashboard`
        log(`11. Redirecting to ${dest}`)
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
