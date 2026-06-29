'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function CallbackClient() {
  const [status, setStatus] = useState('Processing...')

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      const errorParam = params.get('error')
      const errorDesc = params.get('error_description')

      if (errorParam) {
        setStatus(`OAuth Error: ${errorParam} - ${errorDesc || ''}`)
        return
      }

      // Check for existing session first
      const { data: existingSession } = await supabase.auth.getSession()
      if (existingSession?.session) {
        const userId = existingSession.session.user?.id
        const accessToken = existingSession.session.access_token
        const refreshToken = existingSession.session.refresh_token

        // Set cookies so middleware can read them on subsequent requests
        if (accessToken) {
          const expires = new Date(existingSession.session.expires_at! * 1000).toUTCString()
          document.cookie = `sb-access-token=${accessToken}; path=/; expires=${expires}; SameSite=Lax; secure`
          document.cookie = `sb-refresh-token=${refreshToken}; path=/; expires=${expires}; SameSite=Lax; secure`
          document.cookie = `sb-user-id=${userId}; path=/; expires=${expires}; SameSite=Lax; secure`
        }

        setStatus(`Session found! Redirecting as ${existingSession.session.user?.email}...`)
        if (userId) {
          setTimeout(() => { window.location.href = `/${userId}/dashboard` }, 500)
        } else {
          setTimeout(() => { window.location.href = '/dashboard' }, 500)
        }
        return
      }

      if (!code) {
        setStatus('No code in URL and no existing session.')
        return
      }

      setStatus('Exchanging code for session...')

      const { data, error: sbError } = await supabase.auth.exchangeCodeForSession(code)

      if (sbError) {
        setStatus(`Exchange failed: ${sbError.message}`)
        return
      }

      if (data.session) {
        const userId = data.session.user?.id
        const accessToken = data.session.access_token
        const refreshToken = data.session.refresh_token

        // CRITICAL: Set auth cookies so middleware can read them on next request.
        // Without cookies, middleware sees unauthenticated → redirect loop.
        if (accessToken) {
          const expires = new Date(data.session.expires_at! * 1000).toUTCString()
          document.cookie = `sb-access-token=${accessToken}; path=/; expires=${expires}; SameSite=Lax; secure`
          document.cookie = `sb-refresh-token=${refreshToken}; path=/; expires=${expires}; SameSite=Lax; secure`
          document.cookie = `sb-user-id=${userId}; path=/; expires=${expires}; SameSite=Lax; secure`
        }

        setStatus(`Success! Signed in as ${data.session.user?.email}. Redirecting...`)
        if (userId) {
          setTimeout(() => { window.location.href = `/${userId}/dashboard` }, 1000)
        } else {
          setTimeout(() => { window.location.href = '/dashboard' }, 1000)
        }
      } else {
        setStatus('No session returned.')
      }
    }

    handleCallback()
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0a', color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui', padding: 20,
    }}>
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <div style={{
          width: 48, height: 48, border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#e8ff47', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 20px',
        }} />
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: 500 }}>{status}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
