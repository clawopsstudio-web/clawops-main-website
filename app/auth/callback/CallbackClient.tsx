'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function setCookie(name: string, value: string, maxAgeSecs: number) {
  const encoded = encodeURIComponent(value)
  const cookieStr = `${name}=${encoded}; Path=/; Max-Age=${maxAgeSecs}; SameSite=Lax; Secure`
  document.cookie = cookieStr
  // Also set for the root domain so subdomains can read it
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    const domain = window.location.hostname
    const rootDomain = domain.split('.').slice(-2).join('.')
    document.cookie = `${name}=${encoded}; Path=/; Max-Age=${maxAgeSecs}; SameSite=Lax; Secure; domain=${rootDomain}`
  }
}

export default function CallbackClient() {
  const searchParams = useSearchParams()
  const didRun = useRef(false)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    const next = searchParams.get('next') || getDashboardUrl()

    if (errorParam) {
      showError('OAuth error: ' + errorParam)
      return
    }

    if (!code) {
      showError('No authorization code received. Please try signing in again.')
      return
    }

    // Narrowed: TypeScript loses narrowing inside async closures, so assign to a new const
    const authCode: string = code

    doCallback()
    async function doCallback() {
      try {
        // Try to get existing session (SDK may have already exchanged the code)
        const { data: sessionData, error: sessionErr } = await supabase.auth.getSession()

        if (!sessionErr && sessionData?.session) {
          const session = sessionData.session
          setCookie('sb-access-token', session.access_token, 3600)
          setCookie('sb-refresh-token', session.refresh_token, 604800)
          setCookie('sb-user-id', session.user.id, 604800)
          redirectTo(getDashboardUrl(session.user.id))
          return
        }

        // Try getUser as fallback (refreshes session if expired)
        const { data: userData, error: userErr } = await supabase.auth.getUser()

        if (!userErr && userData?.user) {
          const user = userData.user
          // Get or refresh session
          const { data: refreshData } = await supabase.auth.refreshSession()
          const session = refreshData?.session
          if (session) {
            setCookie('sb-access-token', session.access_token, 3600)
            setCookie('sb-refresh-token', session.refresh_token, 604800)
          }
          setCookie('sb-user-id', user.id, 604800)
          redirectTo(getDashboardUrl(user.id))
          return
        }

        // Exchange code directly via Supabase Auth API (bypasses SDK localStorage)
        const PKCE_VERIFIER_COOKIE = 'sb-pkce-code-verifier'
        const verifier = readCookie(PKCE_VERIFIER_COOKIE)

        if (verifier) {
          const result = await exchangeCodeDirectly(authCode, verifier)
          if (result) {
            setCookiesAndRedirect(result)
            return
          }
        }

        // Last resort: try exchanging without explicit verifier
        // (SDK might have stored it in localStorage under a different key)
        showError('Session exchange failed. Please clear your browser cookies and try again.')
        setTimeout(() => redirectTo('/auth/login'), 3000)
      } catch (e: any) {
        showError('Callback failed: ' + (e.message || 'Unknown error'))
      }
    }
  }, [searchParams])

  function getDashboardUrl(userId?: string): string {
    if (userId) return '/dashboard/' + userId
    return '/dashboard'
  }

  function redirectTo(url: string) {
    window.location.href = url
  }

  function showError(msg: string) {
    const el = document.getElementById('cb-error')
    const spinner = document.getElementById('cb-spinner')
    const status = document.getElementById('cb-status')
    if (spinner) spinner.style.display = 'none'
    if (status) status.style.display = 'none'
    if (el) {
      el.textContent = msg
      el.style.display = 'block'
    }
  }

  async function exchangeCodeDirectly(code: string, codeVerifier: string | null) {
    if (!codeVerifier) return null
    const SUPABASE_URL = 'https://dyzkfmdjusdyjmytgeah.supabase.co'
    const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5emtmbWRqdXNkeWpteXRnZWFoIiwicm9sZSI6ImFub255bW91cyIsImlhdCI6MTc3NjI1OTkyNn0.KQ7-0FfDcLrGcPdMNcPQqVz9gbmr7Wmj6U_8zE2pJ8A'

    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=pkc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify({
        grant_type: 'pkce',
        code,
        code_verifier: codeVerifier,
        redirect_uri: 'https://app.clawops.studio/auth/callback',
      }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ msg: res.statusText }))
      console.error('PKCE exchange failed:', err)
      return null
    }

    return res.json()
  }

  function setCookiesAndRedirect(data: any) {
    if (data.access_token) {
      setCookie('sb-access-token', data.access_token, 3600)
    }
    if (data.refresh_token) {
      setCookie('sb-refresh-token', data.refresh_token, 604800)
    }
    if (data.user) {
      setCookie('sb-user-id', data.user.id, 604800)
    } else if (data.access_token) {
      // Decode JWT to get user ID
      try {
        const payload = JSON.parse(atob(data.access_token.split('.')[1]))
        if (payload.sub) setCookie('sb-user-id', payload.sub, 604800)
      } catch {}
    }
    redirectTo(getDashboardUrl(data.user?.id))
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#04040c', color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div id="cb-spinner" style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'rgba(0, 212, 255, 0.1)',
          border: '2px solid rgba(0, 212, 255, 0.3)',
          borderTopColor: '#00D4FF',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 24px',
        }} />
        <p id="cb-status" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Signing you in...
        </p>
        <div id="cb-error" style={{
          display: 'none', color: '#ff4d4d', maxWidth: 400,
          textAlign: 'center', marginTop: 16, fontSize: 14
        }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}
