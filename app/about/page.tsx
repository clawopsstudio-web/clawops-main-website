import type { Metadata } from 'next'
import Navigation from '../components/Navigation'
import Footer from '../../components/sections/Footer'

export const metadata: Metadata = {
  title: 'About — ClawOps Studio',
  description: 'We build and manage AI agent teams for businesses. Stop doing everything yourself.',
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
              We build your AI team.
              <br />
              <span className="text-[#e8ff47]">You run your business.</span>
            </h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto leading-relaxed">
              ClawOps is a service company — not software. We build, deploy, and manage AI agents specifically for your business. No prompts to write, no configuration to manage. Just results.
            </p>
          </div>

          {/* Story */}
          <div className="border-t border-white/5 py-24 px-6">
            <div className="max-w-2xl mx-auto">
              <p className="text-white/40 text-sm font-mono uppercase tracking-widest mb-6">
                Our story
              </p>
              <div className="space-y-5 text-lg text-white/70 leading-relaxed">
                <p>
                  Hiring is broken for small teams. The options are brutal: hire an employee you can't afford, outsource to an agency that doesn't know your business, or do everything yourself and burn out by Wednesday.
                </p>
                <p>
                  We built ClawOps because we were living this problem. We needed sales, research, and support capabilities — but not enough to justify hiring full-time people for each role.
                </p>
                <p>
                  So we built AI agents that could do this work. Not generic chatbots — specialized agents configured for our industry, our tools, and our way of working.
                </p>
                <p>
                  Now we do the same for other businesses. We don't just hand you software. We build your AI team, connect it to your tools, and manage it — forever.
                </p>
              </div>
            </div>
          </div>

          {/* What we do */}
          <div className="border-t border-white/5 py-24 px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(232,255,71,0.6)] mb-4">
                  WHAT WE DO
                </p>
                <h2 className="text-4xl font-black text-white">
                  AI agents. Built for your business. Managed by us.
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'We Build',
                    description: 'Custom AI agents configured for your industry, goals, and workflows.',
                    icon: '🔧',
                  },
                  {
                    title: 'We Deploy',
                    description: 'Connected to your tools and working within days, not weeks.',
                    icon: '🚀',
                  },
                  {
                    title: 'We Manage',
                    description: 'Ongoing monitoring, optimization, and improvement — every week.',
                    icon: '📈',
                  },
                ].map((item, i) => (
                  <div key={i} className="bg-[#111] rounded-xl p-6 border border-white/7">
                    <div className="text-3xl mb-4">{item.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Founder */}
          <div className="border-t border-white/5 py-24 px-6">
            <div className="max-w-2xl mx-auto text-center">
              <p className="font-mono text-xs uppercase tracking-widest text-white/40 mb-6">
                FOUNDER
              </p>
              <div className="inline-block">
                <div className="w-20 h-20 rounded-full bg-[#e8ff47]/20 flex items-center justify-center mb-4 mx-auto">
                  <span className="text-3xl">👨‍💻</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Pulkit</h3>
                <p className="text-white/50 text-sm">Founder, ClawOps Studio</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="border-t border-white/5 py-20 px-6 text-center">
            <h2 className="text-3xl font-black text-white mb-4">
              Ready to meet your AI team?
            </h2>
            <p className="text-white/50 text-lg mb-8 max-w-md mx-auto">
              Start with a conversation. Tell us about your business and we'll show you what's possible.
            </p>
            <a
              href="/start"
              className="inline-block bg-[#e8ff47] text-[#0a0a0a] font-bold px-8 py-4 rounded-xl hover:bg-[#d4eb3a] transition-colors"
            >
              Start Your OS →
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
