'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const steps = [
  {
    title: 'Access the Browser (No Setup Required)',
    description: 'Your Chrome browser is already running on the ClawOps VPS. Access it via VNC.',
    detail: '1. Open your browser and go to:\n   https://app.clawops.studio/chrome/\n\n2. You\'ll see a real Chrome browser running on your VPS\n3. This browser is controlled by AI agents\n4. The browser runs in a Docker container, isolated from the host',
    icon: '🌐',
    tip: 'The VNC URL uses Tailscale Funnel. It\'s publicly accessible but secured by Tailscale authentication.',
  },
  {
    title: 'Configure Browser Automation',
    description: 'AI agents use Chrome DevTools Protocol (CDP) to control the browser programmatically.',
    detail: '1. AI agents connect to Chrome via CDP at ws://localhost:9222\n2. They can: navigate pages, fill forms, click buttons, extract data, take screenshots\n3. No additional configuration needed — it\'s built into ClawOps\n4. The browser maintains session state (cookies, localStorage) between requests',
    icon: '🔧',
    tip: 'Browser sessions persist. If you log into a site manually, the AI agent can see the logged-in state.',
  },
  {
    title: 'Use Browser Automation in AI Agents',
    description: 'Tell your AI agent to use the browser for tasks that require JavaScript rendering or form submission.',
    detail: 'Examples:\n• "Go to linkedin.com and search for \'AI automation agencies\'"\n• "Fill out this form on https://example.com with name=John, email=john@test.com"\n• "Take a screenshot of the current page"\n• "Scrape all job listings from this job board"\n\nAI agents automatically use browser automation when the task requires it.',
    icon: '🤖',
    tip: 'Browser automation is slower than API calls but handles any website — even ones without APIs.',
  },
]

export default function ChromeVNCGuideClient() {
  const [openStep, setOpenStep] = useState<number | null>(null)

  return (
    <div className="min-h-screen py-32 px-4" style={{ background: '#0a0a0f' }}>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
          <span>/</span>
          <span className="text-gray-300">Browser Automation</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🌐</span>
            <span className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ background: 'rgba(0,212,255,0.15)', color: '#00D4FF' }}>Browser</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Browser Automation (Chrome VNC)</h1>
          <p className="text-gray-400 mb-4">
            Give your AI agents a real browser. Scrape any website, fill forms, take screenshots, and automate any web workflow.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span>⏱️ 2 min</span><span>•</span><span>🆓 Included</span><span>•</span><span>No setup</span>
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

        <div className="flex justify-between items-center mt-10 pt-6" style={{ borderTop: '1px solid #2d2d44' }}>
          <Link href="/guides/google-workspace" className="text-sm text-gray-400 hover:text-white transition-colors">← Google Workspace</Link>
          <Link href="/guides/mcp-servers" className="text-sm text-[#00D4FF] hover:text-[#00b8e6]">MCP Servers →</Link>
        </div>
      </div>
    </div>
  )
}
