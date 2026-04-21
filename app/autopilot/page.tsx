import Navigation from '../components/Navigation'
import Footer from '../../components/sections/Footer'

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Autopilot — ClawOps Studio',
  description: 'Set the goal. Go to sleep. Your AI team executes while you rest.',
  openGraph: {
    title: 'Autopilot — ClawOps Studio',
    description: 'Set the goal. Go to sleep. Your AI team executes while you rest.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Autopilot — ClawOps Studio',
    description: 'Set the goal. Go to sleep. Your AI team executes while you rest.',
  },
}
const FEATURES = [
  {
    title: 'Define the mission',
    description: 'Tell your agents what you want to achieve. One sentence. No prompts needed.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
      </svg>
    ),
  },
  {
    title: 'Agents take it from here',
    description: 'Your team divides the work, researches, drafts, and executes — without you in the loop.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    ),
  },
  {
    title: 'You wake up to results',
    description: 'Agents report back with completed tasks, summaries, and next steps. Ready for your review.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3" />
      </svg>
    ),
  },
]

const MISSIONS = [
  {
    title: 'Weekly market report',
    schedule: 'Every Monday 8am',
    agent: 'Arjun',
    color: '#34d399',
    description: 'Scrapes competitor pricing, monitors industry news, compiles a brief for your review.',
  },
  {
    title: 'Lead nurture sequence',
    schedule: 'Daily at 10am',
    agent: 'Ryan',
    color: '#e8ff47',
    description: 'Follows up with every unresponded lead from your CRM. Personalizes each touchpoint.',
  },
  {
    title: 'Social content calendar',
    schedule: 'Every Friday 5pm',
    agent: 'Tyler',
    color: '#a78bfa',
    description: 'Writes and schedules the next week of posts across LinkedIn, Twitter, and Instagram.',
  },
  {
    title: 'Support ticket digest',
    schedule: 'Daily at 9am',
    agent: 'Helena',
    color: '#fb923c',
    description: 'Triages overnight tickets, responds to FAQs, escalates anything that needs human attention.',
  },
  {
    title: 'Invoice follow-up',
    schedule: '1st of month',
    agent: 'Maya',
    color: '#22d3ee',
    description: 'Sends payment reminders to overdue invoices, flags cash flow issues.',
  },
  {
    title: 'Pipeline review',
    schedule: 'Every Monday 9am',
    agent: 'Ryan',
    color: '#e8ff47',
    description: 'Reviews your CRM pipeline, flags stale deals, and prepares a Monday pipeline report.',
  },
]

export default function AutopilotPage() {
  return (
      <>
      <Navigation />
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero */}
      <div className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-3xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-[rgba(232,255,71,0.6)] mb-6">
            AUTOPILOT
          </p>
          <h1
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-none"
            style={{ fontFamily: 'var(--font-cabinet)', letterSpacing: '-0.02em' }}
          >
            Set the goal.
            <br />
            <span className="text-[#e8ff47]">Go to sleep.</span>
          </h1>
          <p className="text-white/50 text-lg md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
            Your AI team runs on schedules you set — not on your attention.
            They work through the night, the weekend, the holiday.
            You wake up to done.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/start"
              className="px-8 py-4 bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a] font-bold rounded-xl transition-colors"
            >
              Set up your autopilot →
            </a>
            <a
              href="/agents"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10"
            >
              Meet your agents
            </a>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-white/30 mb-12">
            How it works
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => (
              <div key={feature.title} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5 text-[#e8ff47]">
                  {feature.icon}
                </div>
                <div className="text-xs font-mono text-white/30 mb-2">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Missions */}
      <div className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4"
              style={{ fontFamily: 'var(--font-cabinet)' }}>
              Missions your team runs
            </h2>
            <p className="text-white/50 max-w-lg mx-auto">
              Pre-built schedules for common business tasks. Each one runs automatically — no babysitting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MISSIONS.map(mission => (
              <div
                key={mission.title}
                className="bg-[#111] rounded-2xl border border-white/7 p-6 hover:border-white/15 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-bold text-base mb-1">{mission.title}</h3>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${mission.color}20`, color: mission.color }}
                      >
                        {mission.agent}
                      </span>
                      <span className="text-xs text-white/30 font-mono">{mission.schedule}</span>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2 animate-pulse shrink-0" />
                </div>
                <p className="text-white/50 text-sm leading-relaxed">{mission.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-24 px-6 border-t border-white/5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4"
            style={{ fontFamily: 'var(--font-cabinet)' }}>
            Ready to hand off the grind?
          </h2>
          <p className="text-white/50 mb-8">
            Your autopilot goes live within 2 hours of signup.
            No training. No prompts. No babysitting.
          </p>
          <a
            href="/start"
            className="inline-block px-10 py-4 bg-[#e8ff47] hover:bg-[#d4eb3a] text-[#0a0a0a] font-bold rounded-xl transition-colors"
          >
            Start for $49 →
          </a>
        </div>
      </div>
    </main>
      <Footer />
      </>
  )
}
