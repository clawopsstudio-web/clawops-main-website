'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

const CALENDLY_URL = 'https://calendly.com/clawops-studio/30min'

const agentTeams = [
  {
    name: 'SEO Agent Team',
    description: 'Research keywords, monitor competitors, draft briefs, optimize pages, and track what is moving.',
    tasks: ['Keyword + SERP research', 'Content briefs', 'Technical SEO checks', 'Weekly reporting'],
  },
  {
    name: 'Content & Social Team',
    description: 'Turn raw ideas, blogs, calls, and offers into posts, carousels, newsletters, and publishing workflows.',
    tasks: ['Content calendars', 'LinkedIn/X posts', 'Repurposing workflows', 'Approval-ready drafts'],
  },
  {
    name: 'Outreach Agent Team',
    description: 'Find leads, enrich data, personalize outreach, follow up, and keep your CRM clean.',
    tasks: ['Lead research', 'Personalized outreach', 'CRM updates', 'Follow-up sequences'],
  },
  {
    name: 'Operations Agent Team',
    description: 'Automate the repetitive back-office work that slows your team down every week.',
    tasks: ['n8n automations', 'GHL workflows', 'Sheets/Docs ops', 'Internal reporting'],
  },
]

const pillars = [
  {
    eyebrow: 'AI Consulting',
    title: 'We map where AI actually helps.',
    copy: 'We audit your manual workflows, identify the highest-leverage automations, and design a practical AI roadmap around your current tools.',
  },
  {
    eyebrow: 'AI Agent Builds',
    title: 'We build custom agents for real work.',
    copy: 'Hermes-style agent teams for research, content, outreach, reporting, support, and operations — connected to the systems your business already uses.',
  },
  {
    eyebrow: 'Automation Systems',
    title: 'We connect the boring middle.',
    copy: 'n8n, GHL, CRMs, Google Workspace, Slack, WhatsApp, scraping, docs, sheets, dashboards — wired into workflows your team can trust.',
  },
]

const process = [
  ['01', 'Discover', 'We learn your business, tools, bottlenecks, and the manual processes your team hates.'],
  ['02', 'Design', 'We turn that into an AI workflow map: agents, automations, handoffs, approvals, and success metrics.'],
  ['03', 'Build', 'We build the agents and integrations, connect them to your stack, and test them against real work.'],
  ['04', 'Manage', 'We monitor, improve, and expand the system so it keeps getting better after launch.'],
]

const integrations = ['Hermes', 'OpenClaw', 'n8n', 'GoHighLevel', 'Google Workspace', 'Airtable', 'Slack', 'WhatsApp', 'Telegram', 'CRMs', 'Apify', 'GitHub']

export default function LandingPage() {
  return (
    <main className="bg-[#0a0a0a] text-white overflow-hidden">
      <section className="relative min-h-screen flex items-center px-6 pt-24 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-[#6600ff]/25 blur-[140px]" />
          <div className="absolute top-1/3 -left-40 h-[420px] w-[420px] rounded-full bg-[#e8ff47]/10 blur-[120px]" />
          <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-cyan-400/10 blur-[130px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#e8ff47]/20 bg-[#e8ff47]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#e8ff47]">
              AI consulting • AI agents • automations
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl lg:text-8xl">
              We build and run your AI workforce.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/60 md:text-xl">
              ClawOps Studio helps SMB and mid-market teams replace tedious manual work with custom AI agents, n8n automations, and managed AI employee systems.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/start"
                className="rounded-2xl bg-[#e8ff47] px-7 py-4 text-center text-sm font-black uppercase tracking-wide text-black transition hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(232,255,71,0.22)]"
              >
                Start AI Assessment →
              </Link>
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-white/15 px-7 py-4 text-center text-sm font-bold uppercase tracking-wide text-white/85 transition hover:border-[#e8ff47]/50 hover:text-white"
              >
                Book 30-min call
              </a>
            </div>

            <p className="mt-5 text-sm text-white/35">
              No generic chatbot installs. We design, build, integrate, and manage the system around your business.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#0d0d0d] p-5">
                <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/35">Live AI Ops Board</p>
                    <p className="mt-1 text-lg font-bold">Agent teams at work</p>
                  </div>
                  <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">Online</div>
                </div>

                <div className="space-y-3">
                  {['SEO researcher mapped 42 competitor pages', 'Content agent drafted 8 LinkedIn posts', 'Outreach agent enriched 120 leads', 'Ops agent updated CRM and follow-up tasks'].map((item, index) => (
                    <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#e8ff47] shadow-[0_0_18px_rgba(232,255,71,0.8)]" />
                        <div>
                          <p className="text-sm font-semibold text-white/90">{item}</p>
                          <p className="mt-1 text-xs text-white/35">Workflow #{index + 1} • waiting for human approval where needed</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="agent-teams" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 max-w-3xl">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-[#e8ff47]/70">What we automate</p>
            <h2 className="text-4xl font-black tracking-[-0.04em] md:text-6xl">The tedious work your team should not be doing manually.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {agentTeams.map((team) => (
              <div key={team.name} className="rounded-3xl border border-white/10 bg-white/[0.035] p-7 transition hover:border-[#e8ff47]/30 hover:bg-white/[0.055]">
                <h3 className="text-2xl font-black">{team.name}</h3>
                <p className="mt-3 text-white/55">{team.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {team.tasks.map((task) => (
                    <span key={task} className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/55">{task}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-4 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-3xl border border-white/10 bg-[#101010] p-7">
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.24em] text-[#e8ff47]/65">{pillar.eyebrow}</p>
              <h3 className="text-2xl font-black leading-tight">{pillar.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/55">{pillar.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-20">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-[#e8ff47]/70">How it works</p>
              <h2 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">Consulting first. Systems second. Managed forever.</h2>
              <p className="mt-5 text-white/55">We do not sell a dashboard and disappear. We find the highest-value manual work, build the agent workflow, and keep improving it.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {process.map(([number, title, copy]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-black/25 p-5">
                  <p className="text-sm font-black text-[#e8ff47]">{number}</p>
                  <h3 className="mt-3 text-xl font-black">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/50">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="integrations" className="px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-[#e8ff47]/70">Built around your stack</p>
          <h2 className="mx-auto max-w-3xl text-4xl font-black tracking-[-0.04em] md:text-5xl">Agents that work inside the tools you already use.</h2>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {integrations.map((item) => (
              <span key={item} className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-sm text-white/60">{item}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#e8ff47]/20 bg-[#e8ff47]/10 p-8 text-center md:p-12">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-[#e8ff47]">Ready to find your first AI workflow?</p>
          <h2 className="text-4xl font-black tracking-[-0.04em] md:text-6xl">Book a free AI assessment.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-white/60">Tell us where your team is stuck. We will map the manual work, recommend the agent team, and show what should be automated first.</p>
          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/start" className="rounded-2xl bg-[#e8ff47] px-7 py-4 text-sm font-black uppercase tracking-wide text-black transition hover:-translate-y-0.5">
              Fill onboarding form →
            </Link>
            <a href={CALENDLY_URL} target="_blank" rel="noreferrer" className="rounded-2xl border border-white/15 px-7 py-4 text-sm font-bold uppercase tracking-wide text-white/85 transition hover:border-[#e8ff47]/50 hover:text-white">
              Open Calendly
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
