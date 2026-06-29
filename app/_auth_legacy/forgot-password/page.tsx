'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    const { error: sbError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/settings`,
    })
    setLoading(false)

    if (sbError) {
      setError(sbError.message)
    } else {
      setSuccess(true)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#e8ff47] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-black text-lg">C</span>
          </div>
          <h1 className="text-white font-black text-2xl mb-1">ClawOps Studio</h1>
          <p className="text-white/30 text-sm">The OS your business runs on</p>
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-white/7 rounded-2xl p-6 space-y-5">
          {!success ? (
            <>
              <div>
                <h2 className="text-white font-bold text-lg mb-1">Reset your password</h2>
                <p className="text-white/40 text-sm">We'll send a reset link to your email</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-white/50 text-xs block mb-1.5" htmlFor="email">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="you@example.com"
                    className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm focus:outline-none focus:border-white/20 placeholder:text-white/20"
                    autoFocus
                    autoComplete="email"
                  />
                  {error && (
                    <p className="text-red-400/80 text-xs mt-1.5">{error}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#e8ff47] hover:bg-[#d4eb3a] disabled:opacity-50 text-black font-bold text-sm rounded-xl transition-colors"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>

              <p className="text-center text-white/30 text-xs">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-[#e8ff47]/80 hover:text-[#e8ff47] transition-colors">
                  Back to login
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* Success state */}
              <div className="text-center space-y-4 pt-2">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <span className="text-emerald-400 text-xl">✓</span>
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg mb-1">Check your inbox</h2>
                  <p className="text-white/40 text-sm">
                    We sent a password reset link to<br/>
                    <span className="text-white/70 font-medium">{email}</span>
                  </p>
                </div>
                <p className="text-white/25 text-xs">
                  Didn't get it? Check your spam folder, or{' '}
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-[#e8ff47]/60 hover:text-[#e8ff47]/80 transition-colors"
                  >
                    try again
                  </button>
                  .
                </p>
                <Link
                  href="/auth/login"
                  className="block text-center text-white/30 hover:text-white/60 text-xs transition-colors"
                >
                  ← Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
