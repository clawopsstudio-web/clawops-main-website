import type { Metadata } from 'next'
import Link from 'next/link'

const CALENDLY_URL = 'https://calendly.com/clawops-studio/30min'

export const metadata: Metadata = {
  title: 'Start AI Assessment — ClawOps Studio',
  description: 'Tell ClawOps Studio where your team is stuck. Book a 30-minute AI assessment and map your first AI agent workflow.',
  openGraph: {
    title: 'Start AI Assessment — ClawOps Studio',
    description: 'Book a 30-minute AI assessment and map your first AI agent workflow.',
    type: 'website',
    images: [{ url: 'https://clawops.studio/og/start.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Start AI Assessment — ClawOps Studio',
    description: 'Book a 30-minute AI assessment and map your first AI agent workflow.',
    images: ['https://clawops.studio/og/start.png'],
  },
}

const questions = [
  'What manual process is slowing your team down right now?',
  'Which tools do you already use — CRM, GHL, Sheets, Slack, email, WhatsApp, or something else?',
  'What would a useful AI employee do every day without you reminding it?',
  'Where should a human approve the work before anything goes out?',
]

export default function StartPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <section className="relative overflow-hidden px-6 py-10 md:py-16">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#6600ff]/25 blur-[130px]" />
          <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-[#e8ff47]/10 blur-[120px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-black tracking-tight">
            Claw<span className="text-[#e8ff47]">Ops</span> Studio
          </Link>

          <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="mb-5 font-mono text-xs uppercase tracking-[0.28em] text-[#e8ff47]/70">AI Assessment</p>
              <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">
                Show us the workflow. We’ll map the AI system.
              </h1>
              <p className="mt-7 text-lg leading-8 text-white/60">
                Use this page to prepare for the call. Bring the tedious, repetitive, manual work your team keeps doing. We’ll help you turn it into an AI agent or automation plan.
              </p>

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                <h2 className="text-xl font-black">Before the call, think through:</h2>
                <div className="mt-5 space-y-4">
                  {questions.map((question) => (
                    <div key={question} className="flex gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#e8ff47]" />
                      <p className="text-sm leading-6 text-white/60">{question}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#0d0d0d] p-5 md:p-7">
                <div className="mb-6">
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-[#e8ff47]/70">Book the call</p>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">30-minute AI assessment</h2>
                  <p className="mt-3 text-sm leading-6 text-white/50">
                    Pick a time. We’ll use the call to identify one high-value workflow and outline what agent team or automation should be built first.
                  </p>
                </div>

                <form
                  action={CALENDLY_URL}
                  method="get"
                  target="_blank"
                  className="mb-6 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-white/80">
                      Name
                      <input
                        name="name"
                        type="text"
                        placeholder="Your name"
                        className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-[#e8ff47]/60"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-white/80">
                      Work email
                      <input
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-[#e8ff47]/60"
                      />
                    </label>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2 text-sm font-semibold text-white/80">
                      Company
                      <input
                        name="company"
                        type="text"
                        placeholder="Company name"
                        className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-[#e8ff47]/60"
                      />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-white/80">
                      Team size
                      <select
                        name="team_size"
                        className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition focus:border-[#e8ff47]/60"
                        defaultValue=""
                      >
                        <option value="" disabled>Choose one</option>
                        <option>1-10</option>
                        <option>11-50</option>
                        <option>51-200</option>
                        <option>200+</option>
                      </select>
                    </label>
                  </div>

                  <label className="grid gap-2 text-sm font-semibold text-white/80">
                    What manual process should your AI employee handle first?
                    <textarea
                      name="workflow"
                      rows={4}
                      placeholder="Example: lead follow-up, SEO research, content production, social posting, outreach, CRM updates, reporting..."
                      className="resize-none rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-[#e8ff47]/60"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-semibold text-white/80">
                    Current tools / stack
                    <input
                      name="tools"
                      type="text"
                      placeholder="GHL, HubSpot, Sheets, Slack, n8n, WhatsApp, email, etc."
                      className="rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-[#e8ff47]/60"
                    />
                  </label>

                  <button
                    type="submit"
                    className="rounded-2xl bg-[#e8ff47] px-6 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:-translate-y-0.5"
                  >
                    Continue to Calendly →
                  </button>
                </form>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-white">
                  <iframe
                    src={`${CALENDLY_URL}?hide_gdpr_banner=1&background_color=0a0a0a&text_color=ffffff&primary_color=e8ff47`}
                    title="Schedule a 30-minute ClawOps Studio AI assessment"
                    className="h-[720px] w-full"
                  />
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={CALENDLY_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-2xl bg-[#e8ff47] px-6 py-4 text-center text-sm font-black uppercase tracking-wide text-black transition hover:-translate-y-0.5"
                  >
                    Open Calendly →
                  </a>
                  <Link
                    href="/"
                    className="flex-1 rounded-2xl border border-white/15 px-6 py-4 text-center text-sm font-bold uppercase tracking-wide text-white/80 transition hover:border-[#e8ff47]/50 hover:text-white"
                  >
                    Back to site
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
