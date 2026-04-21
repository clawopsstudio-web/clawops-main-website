import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'OS Activating — ClawOps Studio',
  description: 'Your AI OS is being set up.',
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-lg text-center space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(232,255,71,0.1)] border border-[rgba(232,255,71,0.3)] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#e8ff47]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Your OS is being set up.
          </h1>
          <p className="text-[#666] text-base leading-relaxed">
            You&apos;ll receive an email within 2 hours with your dashboard link.
            Your AI agent is being configured and deployed right now.
          </p>
        </div>

        {/* Timeline */}
        <div className="bg-[#111] rounded-2xl border border-[rgba(255,255,255,0.07)] p-6 text-left space-y-4">
          <h3 className="text-sm font-bold text-[#e8ff47] uppercase tracking-wider">What&apos;s happening now</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#e8ff47] flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-[#f0f0f0] text-sm">Payment confirmed ✓</span>
            </div>
            <div className="ml-3 w-px h-4 bg-[rgba(255,255,255,0.1)]" />
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-[#e8ff47] flex items-center justify-center shrink-0 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-[#e8ff47]" />
              </div>
              <span className="text-[#f0f0f0] text-sm">Your OS is being built...</span>
            </div>
            <div className="ml-3 w-px h-4 bg-[rgba(255,255,255,0.1)]" />
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#333]" />
              </div>
              <span className="text-[#666] text-sm">Agents configured &amp; deployed</span>
            </div>
            <div className="ml-3 w-px h-4 bg-[rgba(255,255,255,0.1)]" />
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0">
                <div className="w-2 h-2 rounded-full bg-[#333]" />
              </div>
              <span className="text-[#666] text-sm">Dashboard link sent to your email</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-[#666]">
          Questions?{' '}
          <a href="mailto:hello@clawops.studio" className="text-[#e8ff47] hover:underline">
            hello@clawops.studio
          </a>
        </p>

        <Link
          href="/"
          className="inline-block text-sm text-[#666] hover:text-[#f0f0f0] transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
