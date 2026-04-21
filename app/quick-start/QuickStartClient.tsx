'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const STEPS = [
  {
    number: 1,
    title: 'Create Your Account',
    subtitle: 'Sign up in 30 seconds',
    description: 'Choose your plan and create your ClawOps account. No credit card required to start.',
    time: '30 sec',
    icon: '👤',
    action: { label: 'Sign Up Free', href: '/signup' },
    detail: [
      'Go to clawops.studio/signup',
      'Enter your email and password',
      'Choose a plan (Starter $49/mo, Pro $99/mo, Business $149/mo)',
      'Verify your email',
      'You\'re in! 🎉',
    ],
  },
  {
    number: 2,
    title: 'Connect GoHighLevel',
    subtitle: 'Your CRM integration',
    description: 'If you use GoHighLevel, connect it to let AI agents manage contacts, pipelines, and workflows.',
    time: '3 min',
    icon: '📊',
    action: { label: 'GHL Setup Guide', href: '/guides/ghl-mcp' },
    detail: [
      'Get your PIT token from GHL Settings → API Keys',
      'Get your Location ID from GHL Settings → Business Info',
      'Go to Settings → Integrations → GoHighLevel',
      'Paste both values and click "Save & Test"',
      'Test: Ask your agent to search for a contact',
    ],
  },
  {
    number: 3,
    title: 'Connect Automation Tools',
    subtitle: 'Workflow superpowers',
    description: 'Link automation tools to give AI agents the ability to trigger automations, query databases, and orchestrate complex workflows.',
    time: '4 min',
    icon: '⚙️',
    action: { label: 'Automation Setup Guide', href: '/guides' },
    detail: [
      'Enable MCP in Settings → MCP',
      'Copy the MCP endpoint URL',
      'Go to Settings → Integrations',
      'Paste the URL and your API key',
      'Test: Ask your agent to list available automations',
    ],
  },
  {
    number: 4,
    title: 'Install Skills',
    subtitle: 'One-click AI capabilities',
    description: 'Skills are pre-built capability packs. Install them to give your AI agents specialized knowledge.',
    time: '2 min',
    icon: '🧠',
    action: { label: 'Skills Library', href: '/dashboard/skills-library' },
    detail: [
      'Go to Dashboard → Skills Library',
      'Browse by category (CRM, Automation, Productivity)',
      'Find a skill you need and click Install',
      'Fill in your API keys / credentials',
      'The skill is instantly available to all agents',
    ],
  },
  {
    number: 5,
    title: 'Launch Your First Agent',
    subtitle: 'Start talking to AI',
    description: 'Go to Mission Control and start chatting. Tell your agent what you need — it will use all your connected tools automatically.',
    time: '1 min',
    icon: '🚀',
    action: { label: 'Go to Mission Control', href: '/dashboard' },
    detail: [
      'Go to Dashboard → Mission Control',
      'Type: "What tools do you have access to?"',
      'Try: "Search for contacts with the tag \'hot-lead\'"',
      'Try: "Create a Google Doc for our team meeting notes"',
      'Your agent will use the right tools automatically ✨',
    ],
  },
]

export default function QuickStartClient() {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <div className="min-h-screen py-32 px-4" style={{ background: '#0a0a0f' }}>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
            style={{ background: 'rgba(0,212,255,0.1)', color: '#e8ff47', border: '1px solid rgba(0,212,255,0.2)' }}>
            ⚡ Quick Start
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get running in{' '}
            <span style={{ background: 'linear-gradient(135deg, #e8ff47, #e8ff47)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              5 minutes
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Follow these 5 steps to connect your tools and get your first AI agent running.
          </p>

          {/* Time badge */}
          <div className="inline-flex items-center gap-3 mt-6 rounded-full px-6 py-3"
            style={{ background: '#1a1a2e', border: '1px solid #2d2d44' }}>
            <span className="text-sm text-gray-400">Total time:</span>
            <span className="text-sm font-bold text-white">~10 minutes</span>
            <span className="text-gray-600">•</span>
            <span className="text-sm text-gray-400">5 steps</span>
            <span className="text-gray-600">•</span>
            <span className="text-sm text-emerald-400">Free to set up</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step list (left) */}
          <div className="lg:col-span-1 space-y-2">
            {STEPS.map((step) => (
              <motion.button
                key={step.number}
                onClick={() => setActiveStep(step.number - 1)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.number * 0.1 }}
                className="w-full text-left rounded-xl p-4 transition-all duration-200"
                style={{
                  background: activeStep === step.number - 1 ? '#1a1a2e' : 'transparent',
                  border: `1px solid ${activeStep === step.number - 1 ? '#e8ff47' : 'transparent'}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: activeStep === step.number - 1 ? 'linear-gradient(135deg, #e8ff47, #e8ff47)' : '#2d2d44',
                      color: activeStep === step.number - 1 ? 'white' : '#9ca3af',
                    }}>
                    {step.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{step.icon}</span>
                      <span className="text-sm font-medium text-white truncate">{step.title}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{step.time}</div>
                  </div>
                </div>
              </motion.button>
            ))}

            {/* CTA */}
            <div className="mt-6 pt-4" style={{ borderTop: '1px solid #2d2d44' }}>
              <Link href="/dashboard" className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #e8ff47, #e8ff47)', boxShadow: '0 0 20px rgba(0,212,255,0.25)' }}>
                Go to Dashboard →
              </Link>
            </div>
          </div>

          {/* Step detail (right) */}
          <div className="lg:col-span-2">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6"
              style={{ background: '#1a1a2e', border: '1px solid #2d2d44' }}
            >
              {/* Step header */}
              <div className="flex items-start gap-4 mb-6">
                <span className="text-4xl">{STEPS[activeStep].icon}</span>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Step {STEPS[activeStep].number} of 5</div>
                  <h2 className="text-2xl font-bold text-white">{STEPS[activeStep].title}</h2>
                  <p className="text-sm text-[#e8ff47]">{STEPS[activeStep].subtitle}</p>
                </div>
              </div>

              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                {STEPS[activeStep].description}
              </p>

              {/* Steps */}
              <div className="space-y-3 mb-6">
                {STEPS[activeStep].detail.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5"
                      style={{ background: '#0f0f1a', color: '#e8ff47', border: '1px solid #2d2d44' }}>
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="flex items-center gap-3">
                <Link href={STEPS[activeStep].action.href}
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #e8ff47, #e8ff47)', boxShadow: '0 0 15px rgba(0,212,255,0.2)' }}>
                  {STEPS[activeStep].action.label} →
                </Link>
                {activeStep < STEPS.length - 1 && (
                  <button onClick={() => setActiveStep(activeStep + 1)}
                    className="text-sm text-gray-400 hover:text-white transition-colors">
                    Next step →
                  </button>
                )}
              </div>
            </motion.div>

            {/* Navigation arrows */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="text-sm text-gray-500 hover:text-white transition-colors disabled:opacity-30"
              >
                ← Previous
              </button>
              <div className="flex gap-1">
                {STEPS.map((_, i) => (
                  <button key={i}
                    onClick={() => setActiveStep(i)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{ background: i === activeStep ? '#e8ff47' : '#2d2d44' }}
                  />
                ))}
              </div>
              <button
                onClick={() => setActiveStep(Math.min(STEPS.length - 1, activeStep + 1))}
                disabled={activeStep === STEPS.length - 1}
                className="text-sm text-gray-500 hover:text-white transition-colors disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center rounded-2xl p-8"
          style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(102,0,255,0.06))', border: '1px solid rgba(0,212,255,0.12)' }}>
          <h3 className="text-xl font-semibold text-white mb-2">Need detailed help?</h3>
          <p className="text-gray-400 text-sm mb-4">Each step has a full guide with screenshots and troubleshooting tips.</p>
          <Link href="/guides" className="inline-flex items-center gap-2 text-sm text-[#e8ff47] hover:text-[#d4eb3a] transition-colors">
            Browse all setup guides →
          </Link>
        </div>
      </div>
    </div>
  )
}
