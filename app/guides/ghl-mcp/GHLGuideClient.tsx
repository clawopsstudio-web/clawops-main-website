'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const steps = [
  {
    title: 'Get Your PIT Token from GoHighLevel',
    description: 'Your PIT (Personal Integration Token) gives ClawOps secure access to your GHL account.',
    detail: '1. Log in to your GoHighLevel account at app.gohighlevel.com\n2. Navigate to Settings → Integrations → API Keys\n3. Click "Create Key" and name it "ClawOps"\n4. Copy the PIT token — you won\'t be able to see it again',
    icon: '🔑',
    tip: 'Keep this token secret. If you lose it, revoke it and create a new one.',
  },
  {
    title: 'Get Your Location ID',
    description: 'The Location ID identifies which GHL location/office you want to manage.',
    detail: '1. In GHL, go to Settings → Business Info\n2. Copy the Location ID from the URL or settings page\n3. It looks like: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"',
    icon: '📍',
    tip: 'Each location has its own ID. Make sure you pick the right one.',
  },
  {
    title: 'Configure in ClawOps Dashboard',
    description: 'Enter your credentials in the ClawOps Settings → Integrations page.',
    detail: '1. Go to Settings → Integrations → GoHighLevel\n2. Paste your PIT Token\n3. Paste your Location ID\n4. Click "Save & Test"',
    icon: '⚙️',
    tip: 'The test will search for contacts to verify your credentials work.',
  },
  {
    title: 'Install the GHL MCP Skill',
    description: 'Enable the GHL MCP skill to give your AI agents full CRM capabilities.',
    detail: '1. Go to Skills & Plugins Library\n2. Find "GHL CRM MCP"\n3. Click "Install"\n4. Enter the same PIT Token and Location ID\n5. Your agents can now search contacts, update pipelines, and trigger workflows',
    icon: '🧠',
    tip: 'Once installed, your AI agents will have access to all GHL actions automatically.',
  },
  {
    title: 'Test Your Setup',
    description: 'Verify everything is working by asking your AI agent to search for a contact.',
    detail: 'Try asking:\n"Search for all contacts with the tag \'hot-lead\' and show me their names and emails"\n\nYour agent will query GHL in real-time and return results.',
    icon: '✅',
    tip: 'If you get errors, double-check your PIT token and Location ID are correct.',
  },
]

export default function GHLGuideClient() {
  const [openStep, setOpenStep] = useState<number | null>(0)
  const [copied, setCopied] = useState(false)

  return (
    <div className="min-h-screen py-32 px-4" style={{ background: '#0a0a0f' }}>
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
          <span>/</span>
          <span className="text-gray-300">GoHighLevel MCP</span>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">📊</span>
            <span className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,107,53,0.15)', color: '#FF6B35' }}>CRM</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Set Up GoHighLevel (GHL) MCP
          </h1>
          <p className="text-gray-400 mb-4">
            Connect your GHL CRM to give AI agents the power to search contacts, manage pipelines, and trigger automations.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">⏱️ 5 min</span>
            <span>•</span>
            <span className="flex items-center gap-1">🆓 Free</span>
            <span>•</span>
            <span className="flex items-center gap-1">🔒 Secure (PIT token)</span>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl overflow-hidden"
              style={{ background: '#1a1a2e', border: '1px solid #2d2d44' }}
            >
              <button
                onClick={() => setOpenStep(openStep === i ? null : i)}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: openStep === i ? 'linear-gradient(135deg, #00D4FF, #6600FF)' : '#2d2d44', color: openStep === i ? 'white' : '#9ca3af' }}>
                  {i + 1}
                </div>
                <span className="text-lg font-medium text-white flex-1">{step.title}</span>
                <span className="text-2xl">{openStep === i ? '−' : '+'}</span>
              </button>

              {openStep === i && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="px-5 pb-5"
                >
                  <div className="ml-12 space-y-4">
                    <p className="text-gray-400 text-sm">{step.description}</p>
                    <pre className="rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed"
                      style={{ background: '#0f0f1a', border: '1px solid #2d2d44' }}>
                      {step.detail}
                    </pre>
                    <div className="flex items-start gap-2 text-sm text-amber-400/80 rounded-lg p-3"
                      style={{ background: 'rgba(251,191,36,0.08)' }}>
                      <span>💡</span>
                      <span>{step.tip}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Copy credentials reminder */}
        <div className="mt-8 rounded-xl p-5" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)' }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">🔐</span>
            <div>
              <h4 className="font-medium text-white text-sm mb-1">Security note</h4>
              <p className="text-gray-400 text-xs">
                Your PIT token is stored securely in the ClawOps vault and never exposed to third parties.
                Always use environment variables for production deployments.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-10 pt-6" style={{ borderTop: '1px solid #2d2d44' }}>
          <Link href="/guides" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            ← All Guides
          </Link>
          <Link href="/guides/n8n-setup" className="text-sm text-[#00D4FF] hover:text-[#00b8e6] transition-colors flex items-center gap-1">
            Next: n8n Setup →
          </Link>
        </div>
      </div>
    </div>
  )
}
