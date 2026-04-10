'use client'

import { useState, Suspense } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

const PLANS: Record<string, { name: string; price: number; color: string }> = {
  starter: { name: 'Starter', price: 49, color: '#00D4FF' },
  pro: { name: 'Pro', price: 99, color: '#6600FF' },
  business: { name: 'Business', price: 149, color: '#10b981' },
}

function SignUpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'google' | 'email'>('google')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const planKey = searchParams.get('plan') || 'pro'
  const plan = PLANS[planKey] || PLANS.pro

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?plan=${planKey}&next=/dashboard`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?plan=${planKey}&next=/auth/payment`,
      },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setError('')
      alert('Check your email for a confirmation link!')
      setLoading(false)
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

      {/* Plan badge */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
          style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30`, color: plan.color }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: plan.color }} />
          {plan.name} Plan — ${plan.price}/month selected
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
        <p className="text-sm text-[rgba(255,255,255,0.45)] mb-6">
          Start your {plan.name} trial. No credit card required.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Toggle */}
        <div className="flex rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] p-1 mb-5">
          <button
            onClick={() => { setMode('google'); setError('') }}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${mode === 'google' ? 'bg-[rgba(0,212,255,0.15)] text-white' : 'text-[rgba(255,255,255,0.4)] hover:text-white'}`}
          >
            Continue with Google
          </button>
          <button
            onClick={() => { setMode('email'); setError('') }}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all ${mode === 'email' ? 'bg-[rgba(0,212,255,0.15)] text-white' : 'text-[rgba(255,255,255,0.4)] hover:text-white'}`}
          >
            Email & Password
          </button>
        </div>

        {mode === 'google' ? (
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] py-3 text-sm font-medium text-white transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26629829,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7 041 L5.27698177,14.2678769 Z"/>
              </svg>
            )}
            {loading ? 'Connecting...' : 'Continue with Google'}
          </button>
        ) : (
          <form onSubmit={handleEmailSignUp} className="space-y-3">
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
              <label className="block text-xs font-medium text-[rgba(255,255,255,0.5)] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required
                minLength={6}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-[rgba(255,255,255,0.45)] mt-6">
          Already have an account?{' '}
          <Link href="/auth/login"
            className="font-medium text-[#00D4FF] hover:text-white transition-colors">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-[rgba(255,255,255,0.2)] mt-4">
          By continuing, you agree to{' '}
          <Link href="/legal/terms" className="hover:text-white transition-colors">Terms</Link>
          {' '}and{' '}
          <Link href="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>.
        </p>
      </div>

      <div className="text-center mt-4">
        <Link href="/#pricing" className="text-xs text-[rgba(255,255,255,0.25)] hover:text-white transition-colors">
          Change plan
        </Link>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#04040c] text-white px-4">
      <div className="pointer-events-none fixed inset-0" style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(102,0,255,0.08) 0%, transparent 50%)',
      }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
          <SignUpContent />
        </Suspense>
      </motion.div>
    </div>
  )
}
