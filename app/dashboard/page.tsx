'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAndRedirect = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error || !session) {
        // Not logged in → go to login on app domain
        window.location.href = 'https://app.clawops.studio/auth/login'
        setStatus('redirecting')
        return
      }

      const userId = session.user.id
      setStatus('redirecting')
      window.location.href = `https://app.clawops.studio/${userId}/dashboard`
    }

    checkAndRedirect()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#f4f7fb',
    }}>
      <div style={{ textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'rgba(232, 255, 71, 0.1)',
              border: '1px solid rgba(232, 255, 71, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                border: '2px solid #e8ff47',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite',
              }} />
            </div>
            <p style={{ color: 'rgba(244, 247, 251, 0.4)', fontSize: 14 }}>
              Checking session...
            </p>
          </>
        )}
        {status === 'redirecting' && (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'rgba(232, 255, 71, 0.1)',
              border: '1px solid rgba(232, 255, 71, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                border: '2px solid #e8ff47',
                borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite',
              }} />
            </div>
            <p style={{ color: 'rgba(244, 247, 251, 0.4)', fontSize: 14 }}>
              Redirecting to your dashboard...
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'rgba(255, 77, 77, 0.1)',
              border: '1px solid rgba(255, 77, 77, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              fontSize: 24,
            }}>
              ✕
            </div>
            <p style={{ color: '#ff4d4d', fontSize: 14, marginBottom: 8 }}>
              {error}
            </p>
            <button
              onClick={() => window.location.href = 'https://app.clawops.studio/auth/login'}
              style={{
                background: '#e8ff47',
                color: '#0a0a0a',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Go to Login
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
