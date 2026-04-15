'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

function setCookie(name: string, value: string, maxAgeSecs: number) {
  const encoded = encodeURIComponent(value)
  const attrs = `Path=/; Max-Age=${maxAgeSecs}; SameSite=Lax; Secure`
  document.cookie = `${name}=${encoded}; ${attrs}`
  document.cookie = `${name}=${encoded}; ${attrs}; domain=.clawops.studio`
}

function parseFragment(): { access_token?: string; refresh_token?: string; expires_in?: number; state?: string } {
  const hash = window.location.hash
  if (!hash || hash === '#') return {}
  const params = new URLSearchParams(hash.substring(1))
  return {
    access_token: params.get('access_token') || undefined,
    refresh_token: params.get('refresh_token') || undefined,
    expires_in: Number(params.get('expires_in')) || undefined,
    state: params.get('state') || undefined,
  }
}

export default function CallbackClient() {
  const searchParams = useSearchParams()
  const didRun = useRef(false)
  const [status, setStatus] = useState('Signing you in...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (didRun.current) return
    didRun.current = true

    const oauthError = searchParams.get('error')
    if (oauthError) {
      setError('OAuth error: ' + oauthError)
      return
    }

    doAuth()
    async function doAuth() {
      // ---- IMPLICIT FLOW: token in URL fragment ----
      const fragment = parseFragment()
      if (fragment.access_token) {
        const payload = JSON.parse(
          atob(fragment.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
        )
        const userId = payload.sub
        if (userId) {
          setCookie('sb-access-token', fragment.access_token, fragment.expires_in || 3600)
          if (fragment.refresh_token) {
            setCookie('sb-refresh-token', fragment.refresh_token, 604800)
          }
          setCookie('sb-user-id', userId, 604800)
          // Clear the fragment from URL for cleanliness
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
          window.location.href = '/dashboard/' + userId
          return
        }
      }

      // ---- SDK FALLBACK: try getSession (auto-handles URL detection) ----
      try {
        const { data, error: sessionErr } = await supabase.auth.getSession()
        if (!sessionErr && data.session) {
          const s = data.session
          setCookie('sb-access-token', s.access_token, 3600)
          setCookie('sb-refresh-token', s.refresh_token, 604800)
          setCookie('sb-user-id', s.user.id, 604800)
          window.location.href = '/dashboard/' + s.user.id
          return
        }

        // ---- LAST RESORT: getUser + refresh ----
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (!userErr && userData.user) {
          const { data: refresh } = await supabase.auth.refreshSession()
          if (refresh.session) {
            setCookie('sb-access-token', refresh.session.access_token, 3600)
            setCookie('sb-refresh-token', refresh.session.refresh_token, 604800)
          }
          setCookie('sb-user-id', userData.user.id, 604800)
          window.location.href = '/dashboard/' + userData.user.id
          return
        }

        const msg = sessionErr?.message || userErr?.message || 'No session received'
        setError('Sign-in incomplete: ' + msg)
      } catch (e: any) {
        setError('Callback error: ' + (e.message || 'Unknown'))
      }
    }
  }, [searchParams])

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
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 8, fontSize: 14 }}>{error}</p>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 16 }}>
            Redirecting to login in 4 seconds...
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
