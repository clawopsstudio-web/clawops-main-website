'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = name + '=' + encodeURIComponent(value) +
    '; Path=/; Max-Age=' + maxAge +
    '; SameSite=Lax; Secure'
}

export default function CallbackClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Exchanging auth code...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const next = searchParams.get('next') || '/dashboard'
    const oauthError = searchParams.get('error')

    if (oauthError) {
      setError('OAuth error: ' + oauthError)
      return
    }

    if (!code) {
      // No code — maybe it's an implicit/hybrid flow (token in fragment)
      const hash = window.location.hash
      const hashParams = new URLSearchParams(hash.substring(1))
      const accessToken = hashParams.get('access_token')
      if (accessToken) {
        // Implicit flow: extract userId from JWT, set cookies, go to dashboard
        try {
          const parts = accessToken.split('.')
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
          const padded = base64 + '=='.slice(0, (4 - base64.length % 4) % 4)
          const payload = JSON.parse(atob(padded))
          const userId = payload.sub
          if (userId) {
            setCookie('sb-access-token', accessToken, 3600)
            setCookie('sb-refresh-token', hashParams.get('refresh_token') || accessToken, 604800)
            setCookie('sb-user-id', userId, 604800)
            setStatus('Signing in...')
            window.location.href = '/dashboard/' + userId
            return
          }
        } catch {
          setError('Could not parse access token')
          return
        }
      }
      setError('No authorization code received')
      return
    }

    // PKCE flow: exchange the code server-side via our API route
    // But actually, Supabase SDK already exchanged it client-side before this page loaded.
    // The SDK stored session in localStorage. We need to:
    // 1. Get the session from localStorage (via SDK)
    // 2. Set cookies from that session
    // 3. Redirect to dashboard
    const exchangeAndRedirect = async () => {
      try {
        // The Supabase SDK may have already handled the code exchange.
        // Check if there's a session in localStorage.
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
          // Try to get the user (this refreshes the session too)
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          if (userError || !user) {
            setError('No session found. Please sign in again.')
            setTimeout(() => window.location.href = '/auth/login', 2000)
            return
          }

          // Build a session-like object from the user
          const { data: refreshData } = await supabase.auth.refreshSession()
          const activeSession = refreshData.session || session
          if (!activeSession) {
            setError('Could not restore session. Please sign in again.')
            setTimeout(() => window.location.href = '/auth/login', 2000)
            return
          }

          // Set JWT cookies and redirect
          setCookie('sb-access-token', activeSession.access_token, 3600)
          setCookie('sb-refresh-token', activeSession.refresh_token, 604800)
          setCookie('sb-user-id', user.id, 604800)
          setStatus('Signing in...')
          window.location.href = '/dashboard/' + user.id
          return
        }

        // Session found in localStorage! Set cookies and redirect.
        setCookie('sb-access-token', session.access_token, 3600)
        setCookie('sb-refresh-token', session.refresh_token, 604800)
        setCookie('sb-user-id', session.user.id, 604800)
        setStatus('Signing in...')
        window.location.href = '/dashboard/' + session.user.id
      } catch (e: any) {
        setError('Exchange failed: ' + e.message)
        setTimeout(() => window.location.href = '/auth/login', 2000)
      }
    }

    exchangeAndRedirect()
  }, [searchParams, router])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: '#04040c', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui'
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#ff4d4d', marginBottom: 8 }}>Sign-in failed</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>{error}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 16 }}>
            Redirecting to login...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#04040c', color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'rgba(0, 212, 255, 0.1)',
          border: '2px solid rgba(0, 212, 255, 0.3)',
          borderTopColor: '#00D4FF',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 24px',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.6)' }}>{status}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
