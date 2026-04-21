'use client'

import { useState } from 'react'
import Navigation from '../components/Navigation'
import Footer from '../../components/sections/Footer'
import Link from 'next/link'

type Mode = 'observe' | 'assist' | 'autopilot'

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: 'observe', label: 'OBSERVE', sub: 'Agents monitor and report only' },
  { id: 'assist', label: 'ASSIST', sub: 'Agents draft, you approve' },
  { id: 'autopilot', label: 'AUTOPILOT', sub: 'Agents act fully autonomously' },
]

const FEEDS: Record<Mode, { text: string; items: { agent: string; color: string; message: string; time: string }[] }> = {
  observe: {
    text: 'Agents watch and report — no action taken without your say.',
    items: [
      { agent: 'REX', color: '#34d399', message: 'Found 3 competitor price changes. Report sent to Slack.', time: '2m ago' },
      { agent: 'ATLAS', color: '#e8ff47', message: 'Spotted 8 new leads in your ICP segment. Logged to CRM.', time: '18m ago' },
      { agent: 'NOVA', color: '#a78bfa', message: 'Brand mention spike detected on LinkedIn (+340%). Summary queued.', time: '1h ago' },
      { agent: 'MAYA', color: '#22d3ee', message: 'Invoice #1049 is 14 days overdue. Flagged for review.', time: '2h ago' },
    ],
  },
  assist: {
    text: 'Agents draft — you review and approve before anything goes out.',
    items: [
      { agent: 'ATLAS', color: '#e8ff47', message: 'Drafted outreach to 12 warm leads. 3 awaiting your approval.', time: 'Just now' },
      { agent: 'ZARA', color: '#fb923c', message: 'Drafted 6 customer responses. 2 flagged for your review.', time: '5m ago' },
      { agent: 'NOVA', color: '#a78bfa', message: 'Scheduled 5 LinkedIn posts for next week. Ready to publish.', time: '22m ago' },
      { agent: 'MARCUS', color: '#60a5fa', message: 'Weekly ops report ready. 3 tasks need your sign-off.', time: '1h ago' },
    ],
  },
  autopilot: {
    text: 'Agents act — everything runs without touching your attention.',
    items: [
      { agent: 'NOVA', color: '#a78bfa', message: 'Published 3 posts to LinkedIn, Twitter, and Instagram.', time: 'Just now' },
      { agent: 'ATLAS', color: '#e8ff47', message: 'Contacted 47 leads. 3 booked meetings. CRM updated.', time: '12m ago' },
      { agent: 'ZARA', color: '#fb923c', message: 'Resolved 12 support tickets. 1 escalated to your inbox.', time: '38m ago' },
      { agent: 'REX', color: '#34d399', message: 'Delivered morning briefing to Slack. 12 intel items.', time: '1h ago' },
    ],
  },
}

export default function AutopilotPage() {
  const [mode, setMode] = useState<Mode>('autopilot')
  const feed = FEEDS[mode]

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
              className="text-5xl md:text-7xl font-black text-white mb-3 leading-none tracking-tight"
              style={{ fontFamily: 'var(--font-cabinet, sans-serif)', letterSpacing: '-0.03em' }}
            >
              SET THE MISSION.
            </h1>
            <h2
              className="text-4xl md:text-6xl font-black mb-8 leading-none tracking-tight"
              style={{ fontFamily: 'var(--font-cabinet, sans-serif)', letterSpacing: '-0.03em', color: '#e8ff47' }}
            >
              YOUR AGENTS HANDLE THE REST.
            </h2>
            <p className="text-white/40 text-base max-w-md mx-auto leading-relaxed">
              Tell ClawOps what you need done.<br />
              Set the intensity. Go run your business.
            </p>
          </div>

          {/* Intensity selector */}
          <div className="px-6 pb-20 max-w-3xl mx-auto">
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

          {/* Live example feed */}
          <div className="border-y border-white/5 py-20 px-6">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <p className="text-white/40 text-sm">{feed.text}</p>
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
                Ready to activate Autopilot?
              </h2>
              <p className="text-white/40 mb-8 text-sm">
                Your OS goes live within 2 hours of signup.
              </p>
              <Link
                href="/start"
                className="inline-block px-10 py-4 bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a] font-bold rounded-xl transition-colors"
              >
                Activate Autopilot →
              </Link>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
