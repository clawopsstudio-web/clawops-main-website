'use client';

// ============================================================================
// ClawOps Studio — Login Page
// Phase 1 MVP
// ============================================================================

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/dashboard');
      }
    });
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    } else if (data.user) {
      // Wait a tick for cookie to be set, then verify session before redirect
      const { data: { user: verifiedUser } } = await supabase.auth.getUser();
      if (verifiedUser) {
        // Use window.location for full page reload to ensure cookies propagate
        window.location.href = '/dashboard';
      } else {
        setError('Session verification failed. Please try again.');
        setIsLoading(false);
      }
    } else {
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#04040c] flex items-center justify-center p-4">
      {/* Background */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-radial from-[#00D4FF]/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center mb-3 glow-blue-sm">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-white/40 mt-1">Sign in to your ClawOps workspace</p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-8 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clawops.studio"
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
                placeholder="••••••••"
                required
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#00D4FF]/40 transition-colors"
              />
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
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-white/30">
              No account?{' '}
              <Link href="/signup" className="text-[#00D4FF]/70 hover:text-[#00D4FF] transition-colors font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/20 mt-6 font-mono">
          By signing in, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
}
