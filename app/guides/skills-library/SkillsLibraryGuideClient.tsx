'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const steps = [
  {
    title: 'Browse the Skills & Plugins Library',
    description: 'The Skills & Plugins Library has pre-configured skill packs for GHL, n8n, Google Workspace, and more.',
    detail: '1. Go to Dashboard → Skills & Plugins Library\n2. Browse skills by category:\n   • CRM: GoHighLevel, HubSpot, Pipedrive\n   • Productivity: Google Workspace, Notion, Linear\n   • Automation: n8n, Make, Zapier\n   • Communication: Telegram, Slack, Discord\n   • Browser: Chrome VNC, Playwright\n\n3. Use the search bar to find specific skills\n4. Filter by category or platform',
    icon: '🧠',
    tip: 'Skills are curated and tested. Each skill includes setup instructions, prerequisites, and example usage.',
  },
  {
    title: 'Install a Skill',
    description: 'One-click installation copies the skill files to your ClawOps VPS and configures it.',
    detail: '1. Find the skill you want (e.g. "GHL CRM MCP")\n2. Click the "Install" button\n3. A modal opens showing:\n   • The installation command\n   • Prerequisites (API keys, tokens)\n   • Configuration fields\n4. Fill in the required fields\n5. Click "Install"\n6. Wait for the success confirmation\n7. The skill is now available to all your AI agents',
    icon: '⚡',
    tip: 'Installed skills appear in the "Installed" tab. You can uninstall them anytime.',
  },
]

export default function SkillsLibraryGuideClient() {
  const [openStep, setOpenStep] = useState<number | null>(null)

  return (
    <div className="min-h-screen py-32 px-4" style={{ background: '#0a0a0f' }}>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
          <span>/</span>
          <span className="text-gray-300">Skills & Plugins Library</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🧠</span>
            <span className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>AI Skills</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Install Skills from the Library</h1>
          <p className="text-gray-400 mb-4">
            Pre-built skill packs for every integration. One-click install, zero configuration needed. Available skills are tested and maintained by the ClawOps team.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span>⏱️ 2 min</span><span>•</span><span>🆓 Free</span><span>•</span><span>One-click install</span>
          </div>
        </motion.div>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-xl overflow-hidden" style={{ background: '#1a1a2e', border: '1px solid #2d2d44' }}>
              <button onClick={() => setOpenStep(openStep === i ? null : i)}
                className="w-full flex items-center gap-4 p-5 text-left">
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: openStep === i ? 'linear-gradient(135deg, #00D4FF, #6600FF)' : '#2d2d44', color: openStep === i ? 'white' : '#9ca3af' }}>
                  {i + 1}
                </div>
                <span className="text-lg font-medium text-white flex-1">{step.title}</span>
                <span className="text-2xl text-gray-400">{openStep === i ? '−' : '+'}</span>
              </button>
              {openStep === i && (
                <div className="px-5 pb-5 ml-12 space-y-4">
                  <p className="text-gray-400 text-sm">{step.description}</p>
                  <pre className="rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed"
                    style={{ background: '#0f0f1a', border: '1px solid #2d2d44' }}>{step.detail}</pre>
                  <div className="flex items-start gap-2 text-sm text-amber-400/80 rounded-lg p-3"
                    style={{ background: 'rgba(251,191,36,0.08)' }}>
                    <span>💡</span><span>{step.tip}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link href="/dashboard/skills-library" className="inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-semibold text-white transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #00D4FF, #6600FF)', boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}>
            🧠 Browse Skills & Plugins Library
          </Link>
        </div>

        <div className="flex justify-between items-center mt-10 pt-6" style={{ borderTop: '1px solid #2d2d44' }}>
          <Link href="/guides/mcp-servers" className="text-sm text-gray-400 hover:text-white transition-colors">← MCP Servers</Link>
          <Link href="/quick-start" className="text-sm text-[#00D4FF] hover:text-[#00b8e6]">Quick Start →</Link>
        </div>
      </div>
    </div>
  )
}
