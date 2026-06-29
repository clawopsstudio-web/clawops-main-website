'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

function setCookie(name: string, value: string, maxAge: number) {
  // Encode value to handle special characters in JWT
  const encoded = encodeURIComponent(value)
  document.cookie = `${name}=${encoded}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`
}

export default function SSOPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Signing you in...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const next = searchParams.get('next') || '/dashboard'
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError('Auth error: ' + errorParam)
      setTimeout(() => window.location.href = '/auth/login', 2000)
      return
    }

    const doSSO = async () => {
      try {
        // Dynamically import Supabase client to avoid build issues
        const { supabase } = await import('@/lib/supabase/client')

        // Step 1: Get existing session from SDK (localStorage)
        // This works because Supabase SDK already stored the session from PKCE exchange
        const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession()

        if (existingSession) {
          // Session found! Set cookies and redirect
          const at = existingSession.access_token
          const rt = existingSession.refresh_token
          const uid = existingSession.user.id

          setCookie('sb-access-token', at, 3600)
          setCookie('sb-refresh-token', rt, 604800)
          setCookie('sb-user-id', uid, 604800)

          setStatus('Done! Redirecting...')
          window.location.href = '/dashboard/' + uid
          return
        }

        // No existing session — try to get user (may trigger refresh)
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) {
          // Try refreshing the session
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

          if (refreshError || !refreshData.session) {
            setError('No session found. Please sign in again.')
            setTimeout(() => window.location.href = '/auth/login', 2000)
            return
          }

          // Session restored!
          const at = refreshData.session!.access_token
          const rt = refreshData.session!.refresh_token
          const uid = refreshData.session!.user.id

          setCookie('sb-access-token', at, 3600)
          setCookie('sb-refresh-token', rt, 604800)
          setCookie('sb-user-id', uid, 604800)

          setStatus('Session refreshed. Redirecting...')
          window.location.href = '/dashboard/' + uid
          return
        }

        // We have a user but no session — this shouldn't happen in normal flow
        // Try to create a session from the user
        setError('Session incomplete. Please sign in again.')
        setTimeout(() => window.location.href = '/auth/login', 2000)

      } catch (e: any) {
        console.error('[SSO] Error:', e)
        setError('Error: ' + e.message)
        setTimeout(() => window.location.href = '/auth/login', 2000)
      }
    }

    doSSO()
  }, [searchParams])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0a0a', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif', padding: 20,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#ff6b6b', marginBottom: 8 }}>Sign-in failed</h2>
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
      minHeight: '100vh', background: '#0a0a0a', color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '3px solid rgba(0,212,255,0.2)',
          borderTopColor: '#e8ff47',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 20px',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>
          {status}
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
