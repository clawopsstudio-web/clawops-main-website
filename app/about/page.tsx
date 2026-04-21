import type { Metadata } from 'next'
import Navigation from '../components/Navigation'
import Footer from '../../components/sections/Footer'

export const metadata: Metadata = {
  title: 'About — ClawOps Studio',
  description: 'We built ClawOps because hiring is broken for small teams. An operating system for businesses that run lean.',
}

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="pt-16">
        <div className="min-h-screen bg-[#0a0a0a] text-white">

          {/* Hero */}
          <div className="max-w-3xl mx-auto px-6 pt-32 pb-24 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(232,255,71,0.6)] mb-6">
              ABOUT
            </p>
            <h1
              className="text-5xl md:text-6xl font-black text-white mb-8 leading-none"
              style={{ fontFamily: 'var(--font-cabinet)', letterSpacing: '-0.02em' }}
            >
              The OS your
              <br />
              <span className="text-[#e8ff47]">business runs on.</span>
            </h1>
          </div>

          {/* Story */}
          <div className="border-t border-white/5 py-24 px-6">
            <div className="max-w-2xl mx-auto">
              <p className="text-white/40 text-sm font-mono uppercase tracking-widest mb-6">
                Our story
              </p>
              <div className="space-y-5 text-lg text-white/70 leading-relaxed">
                <p>
                  ClawOps was built because hiring is broken for small teams.
                </p>
                <p>
                  The options are brutal: hire an employee you can't afford, outsource to an agency that doesn't know your business, or do everything yourself and burn out by Wednesday.
                </p>
                <p>
                  We're not an agency and we're not traditional software. We're an operating system for businesses that run lean — a team of AI agents that work around the clock, know your business, and execute without you in the room.
                </p>
                <p>
                  Founded by <strong className="text-white">Pulkit</strong>, built in 2026.
                </p>
              </div>
            </div>
          </div>

          {/* What we believe */}
          <div className="border-t border-white/5 py-24 px-6">
            <div className="max-w-2xl mx-auto">
              <p className="text-white/40 text-sm font-mono uppercase tracking-widest mb-6">
                What we believe
              </p>
              <div className="space-y-6">
                {[
                  {
                    title: 'Proactive beats reactive',
                    body: 'Every big AI company waits for you to ask. We built agents that run on schedules and triggers — working while you sleep.',
                  },
                  {
                    title: 'Small teams deserve enterprise tools',
                    body: 'The automation and intelligence that Fortune 500 companies pay millions for — available to a one-person business at $49/month.',
                  },
                  {
                    title: 'No prompt engineering required',
                    body: 'You set goals. Your agents figure out the execution. No AI fluency needed, no LLM expertise required.',
                  },
                ].map(item => (
                  <div key={item.title} className="bg-[#111] rounded-2xl border border-white/7 p-6">
                    <h3 className="text-white font-bold text-base mb-2">{item.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Founder */}
          <div className="border-t border-white/5 py-24 px-6">
            <div className="max-w-2xl mx-auto">
              <p className="text-white/40 text-sm font-mono uppercase tracking-widest mb-6">
                The founder
              </p>
              <div className="bg-[#111] rounded-2xl border border-white/7 p-8 flex items-start gap-6">
                {/* Robot avatar for Pulkit */}
                <div className="w-20 h-20 rounded-2xl bg-[#1a1a1a] border border-white/10 shrink-0 flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <rect width="200" height="200" fill="#111" />
                    <line x1="100" y1="30" x2="100" y2="50" stroke="#e8ff47" strokeWidth="3" />
                    <circle cx="100" cy="24" r="8" fill="#e8ff47" opacity="0.9" />
                    <rect x="50" y="48" width="100" height="80" rx="16" fill="#1a1a1a" stroke="#e8ff47" strokeWidth="2.5" />
                    <rect x="68" y="68" width="26" height="26" rx="6" fill="#e8ff47" opacity="0.9" />
                    <rect x="106" y="68" width="26" height="26" rx="6" fill="#e8ff47" opacity="0.9" />
                    <rect x="75" y="75" width="12" height="12" rx="3" fill="#0a0a0a" />
                    <rect x="113" y="75" width="12" height="12" rx="3" fill="#0a0a0a" />
                    <rect x="76" y="108" width="48" height="10" rx="5" fill="#e8ff47" opacity="0.4" />
                    <rect x="60" y="136" width="80" height="52" rx="12" fill="#1a1a1a" stroke="#e8ff47" strokeWidth="2.5" />
                    <circle cx="100" cy="158" r="14" fill="#e8ff47" opacity="0.15" />
                    <circle cx="100" cy="158" r="8" fill="#e8ff47" opacity="0.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Pulkit</h3>
                  <p className="text-[#e8ff47] text-sm mb-3">Founder, ClawOps Studio</p>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Builder, not a founder story. Worked in AI automation before deciding the whole thing needed to be simpler. Still building.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="border-t border-white/5 py-24 px-6 text-center">
            <div className="max-w-xl mx-auto">
              <h2 className="text-3xl font-black text-white mb-4"
                style={{ fontFamily: 'var(--font-cabinet)' }}>
                Ready to run your business differently?
              </h2>
              <p className="text-white/50 mb-8">
                Your AI team is ready. Set up takes 5 minutes.
              </p>
              <a
                href="/start"
                className="inline-block px-10 py-4 bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a] font-bold rounded-xl transition-colors"
              >
                Get started →
              </a>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
