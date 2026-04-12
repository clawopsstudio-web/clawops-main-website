'use client'

import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import Link from 'next/link'

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    if (data.user) {
      window.location.href = '/dashboard'
    }
  }

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true)
    setError('')
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      })
      
      if (error) {
        setError(error.message)
        setLoadingGoogle(false)
      }
    } catch (err: any) {
      setError(err.message || 'OAuth failed')
      setLoadingGoogle(false)
    }
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)' }}>
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" opacity="0.9"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-white font-bold text-lg">ClawOps</span>
        </Link>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
        <p className="text-sm text-[rgba(255,255,255,0.45)] mb-6">
          Sign in to your ClawOps account
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Email/Password form */}
        <form onSubmit={handleSignIn} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-[rgba(255,255,255,0.5)] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white placeholder-[rgba(255,255,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[rgba(255,255,255,0.5)]">Password</label>
              <Link href="/auth/forgot-password"
                className="text-xs text-[#00D4FF] hover:text-white transition-colors">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] px-4 py-3 text-sm text-white placeholder-[rgba(255,255,255,0.2)] focus:outline-none focus:border-[rgba(0,212,255,0.4)] transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)' }}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <Link
            href="/auth/signup"
            className="block w-full text-center py-3 text-sm font-medium rounded-xl border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] text-[rgba(255,255,255,0.6)] hover:text-white transition-all"
          >
            Don&apos;t have an account? Sign up free
          </Link>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
          <span className="text-xs text-[rgba(255,255,255,0.3)]">or</span>
          <div className="flex-1 h-px bg-[rgba(255,255,255,0.08)]" />
        </div>

        {/* Google sign in */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loadingGoogle}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] py-3 text-sm font-medium text-white transition-all disabled:opacity-50"
        >
          {loadingGoogle ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
              <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
              <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
              <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26629829,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7 0.41 L5.27698177,14.2678769 Z"/>
            </svg>
          )}
          {loadingGoogle ? 'Connecting...' : 'Sign in with Google'}
        </button>

        <p className="text-center text-sm text-[rgba(255,255,255,0.45)] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup"
            className="font-medium text-[#00D4FF] hover:text-white transition-colors">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#04040c] text-white px-4">
      <div className="pointer-events-none fixed inset-0" style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(102,0,255,0.08) 0%, transparent 50%)',
      }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
          <LoginContent />
        </Suspense>
      </motion.div>
    </div>
  )
}
/* Auth fix deployed: Fri Apr 10 23:39:49 CEST 2026 */
