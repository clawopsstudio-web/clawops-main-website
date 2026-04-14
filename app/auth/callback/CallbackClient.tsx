'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

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
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')

        log(`1. URL params: code=${code ? code.slice(0,10) + '...' : 'none'}`)

        if (!code) {
          log('2. No code in URL — redirecting to login')
          window.location.href = '/auth/login?error=no_code'
          return
        }

        log('3. Exchanging code for session')
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false, // IMPORTANT: disable to prevent re-processing
          },
        })

        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        log(`4. Exchange result: session=${!!data.session}, error=${error?.message ?? 'none'}`)

        if (error || !data.session) {
          setStatus('error')
          setDebug(prev => prev + `Exchange failed: ${error?.message}\n`)
          return
        }

        const userId = data.session.user.id
        log(`5. User ID: ${userId}`)
        log(`6. Redirecting to /${userId}/dashboard`)

        // Small delay to let SDK persist session to storage
        await new Promise(r => setTimeout(r, 500))

        window.location.href = `/${userId}/dashboard`
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
          <p className="text-white/50 text-sm mb-6">Something went wrong during sign-in.</p>
          <pre className="text-xs text-red-400/70 bg-black/30 rounded-lg p-4 text-left overflow-auto max-h-40 whitespace-pre-wrap mb-6">
            {debug}
          </pre>
          <a href="/auth/login"
            className="inline-block px-6 py-3 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)' }}>
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
