'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

function setCookie(name: string, value: string, maxAgeSecs: number) {
  const encoded = encodeURIComponent(value)
  document.cookie = `${name}=${encoded}; Path=/; Max-Age=${maxAgeSecs}; SameSite=Lax; Secure; domain=.clawops.studio`
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default function CallbackClient() {
  const didRun = useRef(false)
  const [status, setStatus] = useState('Signing you in...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    handleCallback()

    async function handleCallback() {
      const url = new URL(window.location.href)

      // ---- Check for OAuth errors ----
      const errorParam = url.searchParams.get('error')
      if (errorParam) {
        const desc = url.searchParams.get('error_description') || errorParam
        setError('OAuth error: ' + desc)
        return
      }

      // PKCE flow: SDK handles code exchange automatically during module init.
      // Wait a moment for the SDK's async initialization to complete.
      setStatus('Verifying session...')
      await sleep(300)

      // ---- Try getSession (SDK auto-processes PKCE callback) ----
      const { data, error: err } = await supabase.auth.getSession()

      if (!err && data.session) {
        const s = data.session
        setCookie('sb-access-token', s.access_token, 3600)
        if (s.refresh_token) setCookie('sb-refresh-token', s.refresh_token, 604800)
        setCookie('sb-user-id', s.user.id, 604800)
        url.searchParams.delete('code')
        window.history.replaceState(null, '', url.pathname)
        window.location.href = '/dashboard/' + s.user.id
        return
      }

      // ---- Fallback: getUser + refreshSession ----
      setStatus('Refreshing session...')
      const { data: userData, error: userErr } = await supabase.auth.getUser()
      if (!userErr && userData.user) {
        const { data: refresh } = await supabase.auth.refreshSession()
        if (refresh.session) {
          setCookie('sb-access-token', refresh.session.access_token, 3600)
          if (refresh.session.refresh_token) {
            setCookie('sb-refresh-token', refresh.session.refresh_token, 604800)
          }
        }
        setCookie('sb-user-id', userData.user.id, 604800)
        url.searchParams.delete('code')
        window.history.replaceState(null, '', url.pathname)
        window.location.href = '/dashboard/' + userData.user.id
        return
      }

      const msg = err?.message || userErr?.message || 'No session found'
      setError('Sign-in incomplete: ' + msg)
    }
  }, [])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh', background: '#04040c', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui', padding: 20
      }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#ff4d4d', marginBottom: 8, fontSize: 20 }}>Sign-in failed</h2>
          <p style={{
            color: 'rgba(255,255,255,0.7)', marginBottom: 16, fontSize: 14,
            fontFamily: 'monospace', textAlign: 'left',
            background: 'rgba(255,0,0,0.05)', padding: 12, borderRadius: 8
          }}>
            {error}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 16 }}>
            Redirecting to login...
          </p>
          <button
            onClick={() => { window.location.href = '/auth/login' }}
            style={{
              marginTop: 24, padding: '10px 24px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #00D4FF, #6600FF)', color: 'white',
              fontWeight: 600, cursor: 'pointer', fontSize: 14
            }}
          >
            Go to Login
          </button>
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
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{status}</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}



