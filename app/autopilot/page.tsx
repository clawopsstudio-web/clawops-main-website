'use client'

import { useState } from 'react'
import Navigation from '../components/Navigation'
import Footer from '../../components/sections/Footer'
import Link from 'next/link'

type Mode = 'gentle' | 'steady' | 'intense'

const MODES: { id: Mode; label: string; sub: string; desc: string }[] = [
  {
    id: 'gentle',
    label: 'Gentle',
    sub: 'Conservative actions · Frequent confirmations',
    desc: 'Agents move cautiously. Every significant action — sending an email, updating a record, posting content — requires your approval first. Ideal when you want full visibility and control, especially when starting out.',
  },
  {
    id: 'steady',
    label: 'Steady',
    sub: 'Balanced automation · Moderate confirmations',
    desc: 'Agents handle routine work autonomously but pause for complex decisions. Good for daily ops — research, data enrichment, ticket drafting all happen without you. Anything unusual gets flagged.',
  },
  {
    id: 'intense',
    label: 'Intense',
    sub: 'Maximum automation · Minimal friction',
    desc: 'Agents act fast and move without stopping. Approves routine tasks, executes campaigns, handles support tickets, sends outreach — all without touching your attention. Best for experienced users who trust their agent setup.',
  },
]

const FEEDS: Record<Mode, { items: { agent: string; color: string; message: string; time: string }[] }> = {
  gentle: {
    items: [
      { agent: 'Ryan', color: '#e8ff47', message: 'Drafted outreach to 15 prospects. Awaiting your approval to send.', time: 'Just now' },
      { agent: 'Helena', color: '#f59e0b', message: '3 support tickets auto-resolved. 1 flagged — needs your review.', time: '5m ago' },
      { agent: 'Arjun', color: '#10b981', message: 'Competitor research complete. Report ready — 8 new findings.', time: '22m ago' },
      { agent: 'Ryan', color: '#e8ff47', message: 'Drafted follow-up sequence for 20 leads. Confirm to send.', time: '1h ago' },
    ],
  },
  steady: {
    items: [
      { agent: 'Arjun', color: '#10b981', message: 'Scraped 40 competitor landing pages. Data logged to Notion.', time: 'Just now' },
      { agent: 'Ryan', color: '#e8ff47', message: 'Sent 30 outreach emails. 4 positive replies. CRM updated.', time: '8m ago' },
      { agent: 'Helena', color: '#f59e0b', message: 'Resolved 12 tickets automatically. 2 escalated to your inbox.', time: '38m ago' },
      { agent: 'Arjun', color: '#10b981', message: 'Daily brief generated and sent to Slack. 15 intel items.', time: '1h ago' },
    ],
  },
  intense: {
    items: [
      { agent: 'Ryan', color: '#e8ff47', message: 'Ran 3 outreach campaigns. 47 emails sent. 6 meetings booked.', time: 'Just now' },
      { agent: 'Helena', color: '#f59e0b', message: 'Auto-resolved 28 tickets. 3 edge cases escalated.', time: '12m ago' },
      { agent: 'Arjun', color: '#10b981', message: 'Scraped + enriched 120 leads. All added to CRM.', time: '45m ago' },
      { agent: 'Ryan', color: '#e8ff47', message: 'Posted to LinkedIn, Twitter, Instagram. Engagement tracked.', time: '2h ago' },
    ],
  },
}

export default function AutopilotPage() {
  const [mode, setMode] = useState<Mode>('intense')
  const feed = FEEDS[mode]
  const activeMode = MODES.find(m => m.id === mode)!

  return (
    <>
      <Navigation />
      <main className="pt-16">
        <div className="min-h-screen bg-[#0a0a0a] text-white">

          {/* Hero */}
          <div className="px-6 pt-28 pb-20 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(232,255,71,0.6)] mb-6">
              AUTOPILOT
            </p>
            <h1
              className="text-5xl md:text-7xl font-black text-white mb-6 leading-none tracking-tight"
              style={{ fontFamily: 'var(--font-cabinet, sans-serif)', letterSpacing: '-0.03em' }}
            >
              Set the goal.
            </h1>
            <h2
              className="text-4xl md:text-6xl font-black mb-10 leading-none tracking-tight"
              style={{ fontFamily: 'var(--font-cabinet, sans-serif)', letterSpacing: '-0.03em', color: '#e8ff47' }}
            >
              Go to sleep.
            </h2>
            <p className="text-white/40 text-base max-w-md mx-auto leading-relaxed">
              Tell your agents what you need. Choose how much autonomy to give them. They work while you rest.
            </p>
          </div>

          {/* Intensity selector */}
          <div className="px-6 pb-12 max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-3">
              {MODES.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`
                    relative rounded-2xl p-5 text-left transition-all border-2
                    ${mode === m.id
                      ? 'border-[#e8ff47] bg-[rgba(232,255,71,0.06)]'
                      : 'border-white/7 bg-[#111] hover:border-white/20'
                    }
                  `}
                >
                  {mode === m.id && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#e8ff47] animate-pulse" />
                  )}
                  <div className="text-base font-black text-white mb-1 tracking-tight"
                    style={{ fontFamily: 'var(--font-cabinet, sans-serif)' }}>
                    {m.label}
                  </div>
                  <div className="text-[10px] text-white/40 leading-relaxed">{m.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Mode description */}
          <div className="px-6 pb-16 max-w-2xl mx-auto text-center">
            <p className="text-white/60 text-sm leading-relaxed">{activeMode.desc}</p>
          </div>

          {/* Live example feed */}
          <div className="border-y border-white/5 py-20 px-6">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <p className="text-white/40 text-sm">
                  Sample activity on <strong className="text-white">{activeMode.label}</strong> mode
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">Live</span>
                </div>
              </div>

              <div className="space-y-3">
                {feed.items.map((item, i) => (
                  <div
                    key={i}
                    className="bg-[#111] rounded-xl border border-white/7 p-4 flex items-start gap-4"
                  >
                    <div className="shrink-0 mt-0.5">
                      <span
                        className="text-xs font-black px-2 py-1 rounded"
                        style={{ backgroundColor: `${item.color}20`, color: item.color }}
                      >
                        {item.agent}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-white/70 text-sm leading-relaxed">{item.message}</p>
                    </div>
                    <span className="text-[10px] text-white/25 font-mono shrink-0 mt-0.5">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="py-24 px-6 text-center">
            <div className="max-w-xl mx-auto">
              <h2 className="text-3xl font-black text-white mb-4 leading-none"
                style={{ fontFamily: 'var(--font-cabinet, sans-serif)' }}>
                Ready to set the intensity?
              </h2>
              <p className="text-white/40 mb-8 text-sm">
                Your OS goes live within 2 hours of signup.
              </p>
              <Link
                href="/auth/signup"
                className="inline-block px-10 py-4 bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a] font-bold rounded-xl transition-colors"
              >
                Start Your OS →
              </Link>
            </div>
          </div>

        </div>

        <div className="text-center mt-16 py-12 border-t border-white/10">
          <h2 className="text-2xl font-black text-white mb-4">Ready to run on autopilot?</h2>
          <a href="/auth/signup" className="inline-block bg-[#e8ff47] text-[#0a0a0a] font-bold px-8 py-4 rounded-xl hover:bg-[#d4eb3a] transition-colors">
            Start Your OS →
          </a>
        </div>
      </main>
      <Footer />
    </>
  )
}
