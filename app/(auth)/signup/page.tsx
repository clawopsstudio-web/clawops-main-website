'use client';

// ============================================================================
// ClawOps Studio — Signup Page
// Phase 1 MVP
// ============================================================================

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    const result = await signup(email, password, fullName);
    if (result.success) {
      router.push('/onboarding');
    } else {
      setError(result.error || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#04040c] flex items-center justify-center p-4">
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-violet-500/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Create your workspace</h1>
          <p className="text-sm text-white/40 mt-1">Start with a 14-day free trial</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourcompany.com"
                required
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 transition-colors"
              />
              <p className="text-[10px] text-white/25 mt-1.5">PBKDF2 with 100K iterations — very secure</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-400/10 border border-red-400/20 px-4 py-2.5 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-[#04040c] border-t-transparent animate-spin" />
                  Creating workspace...
                </span>
              ) : (
                'Create Workspace'
              )}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <p className="text-[11px] text-white/30 text-center">
              14-day free trial. No credit card required. TOTP 2FA will be set up after signup.
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/30">
              Already have an account?{' '}
              <Link href="/login" className="text-[#00D4FF]/70 hover:text-[#00D4FF] transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
