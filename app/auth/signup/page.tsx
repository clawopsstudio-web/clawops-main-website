'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-[#04040c] flex items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#00D4FF] flex items-center justify-center mx-auto mb-4">
            <span className="text-[#04040c] font-bold">CO</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Deploy your AI team.</h1>
          <p className="text-white/40 mt-1">Start free. No card. Cancel anytime.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/60 text-sm mb-2">Full name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#00D4FF]/50 transition-colors"
              placeholder="Pulkit Gupta"
              required
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Work email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#00D4FF]/50 transition-colors"
              placeholder="pulkit@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-white/60 text-sm mb-2">Password (min. 8 characters)</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-[#00D4FF]/50 transition-colors"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00D4FF] text-[#04040c] font-semibold rounded-xl hover:bg-[#00D4FF]/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
          <p className="text-white/30 text-xs text-center">
            By creating an account you agree to our{' '}
            <a href="/legal/terms" className="underline">Terms</a>
            {' '}and{' '}
            <a href="/legal/privacy" className="underline">Privacy Policy</a>
          </p>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-[#04040c] px-2 text-white/30">or continue with</span></div>
          </div>
          <button
            type="button"
            className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.88c-.25 1.38-1.04 2.57-2.2 3.37v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
              <path d="M12 23c2.97 0 5.46-1.01 7.28-2.74l3.57-2.77c-1.15.77-2.63 1.21-3.71 1.21-.91 0-1.73-.33-2.36-.84l-3.58-2.74C15.09 19.85 13.37 21 12 21c-1.66 0-3.15-.57-4.31-1.5L4.41 16.96c-.22 1.33.01 2.78.88 3.71l3.56-2.77c.38-2.46 1.33-4.54 2.36-5.9z"/>
              <path d="M12 13.15c1.66 0 3.15.57 4.31 1.5l3.28-3.14C17.64 9.38 15.06 8 12 8c-3.06 0-5.72 1.73-7.08 4.29l3.57 2.77c.38-2.46 1.33-4.54 2.36-5.79z"/>
            </svg>
            Continue with Google
          </button>
          <p className="text-center text-white/40 text-sm">
            Already have an account?{' '}
            <a href="/auth/login" className="text-[#00D4FF] hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
