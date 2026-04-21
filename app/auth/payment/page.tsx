'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

const PLANS: Record<string, { name: string; price: number; color: string; features: string[] }> = {
  starter: { name: 'Starter', price: 49, color: '#00D4FF', features: ['2 vCPU, 4GB RAM', '1 AI Agent Workspace', 'Gemma 4 (local)', '500+ Integrations'] },
  pro: { name: 'Pro', price: 99, color: '#6600FF', features: ['4 vCPU, 8GB RAM', '3 AI Agent Workspaces', 'Gemma 4 2B + 7B', 'Unlimited automations'] },
  business: { name: 'Business', price: 149, color: '#10b981', features: ['6 vCPU, 12GB RAM', 'Unlimited AI Workspaces', 'Any local model', 'White-label capability'] },
}

function Spinner() {
  return <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planKey = searchParams.get('plan') || 'pro'
  const plan = PLANS[planKey] || PLANS.pro
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  const handlePayPal = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setStatus('success')
    setLoading(false)
    setTimeout(() => router.push('/onboarding'), 1500)
  }

  return (
    <div className="relative w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)' }}>
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
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
          style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30`, color: plan.color }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: plan.color }} />
          {plan.name} Plan — ${plan.price}/month selected
        </div>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-8">
        <h1 className="text-2xl font-bold text-white mb-1">Complete Your Subscription</h1>
        <p className="text-sm text-[rgba(255,255,255,0.45)] mb-6">
          You&apos;re subscribing to the {plan.name} plan.
        </p>

        {/* Plan summary */}
        <div className="rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-lg font-bold text-white">{plan.name}</div>
            <div className="text-2xl font-black" style={{ color: plan.color }}>
              ${plan.price}<span className="text-sm text-[rgba(255,255,255,0.35)] font-normal">/mo</span>
            </div>
          </div>
          <ul className="space-y-1.5">
            {plan.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-[rgba(255,255,255,0.5)]">
                <svg className="w-3.5 h-3.5 flex-shrink-0" style={{ color: plan.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.08)] p-8 text-center"
          >
            <div className="text-5xl mb-4">&#10003;</div>
            <h2 className="text-xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-sm text-[rgba(255,255,255,0.5)]">Redirecting to onboarding...</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {/* PayPal */}
            <button
              onClick={handlePayPal}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl py-4 text-base font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: '#0070BA' }}
            >
              {loading ? <Spinner /> : null}
              {loading ? 'Processing...' : `Pay $${plan.price}/month with PayPal`}
            </button>

            {/* Card — coming soon */}
            <button
              disabled
              className="w-full flex items-center justify-center gap-3 rounded-xl py-4 text-base font-semibold text-white border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] opacity-40 cursor-not-allowed"
            >
              Pay with Card (Coming Soon)
            </button>

            <p className="text-center text-xs text-[rgba(255,255,255,0.2)] pt-1">
              Payment integration coming soon. For testing, click PayPal above.
            </p>

            <button
              onClick={() => router.push('/onboarding')}
              className="w-full text-xs text-[rgba(255,255,255,0.2)] hover:text-[rgba(255,255,255,0.5)] transition-colors py-2"
            >
              Skip payment — continue to onboarding (testing only)
            </button>
          </div>
        )}
      </div>

      <div className="text-center mt-4">
        <Link href="/#pricing" className="text-xs text-[rgba(255,255,255,0.25)] hover:text-[rgba(255,255,255,0.5)] transition-colors">
          &larr; Change plan
        </Link>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#04040c] text-white px-4">
      <div className="pointer-events-none fixed inset-0 -z-10" style={{
        background: 'radial-gradient(circle at 50% 0%, rgba(0,212,255,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(102,0,255,0.06) 0%, transparent 50%)',
      }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
          <PaymentContent />
        </Suspense>
      </motion.div>
    </div>
  )
}
