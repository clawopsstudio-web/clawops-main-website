'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

const steps = [
  {
    title: 'Understand MCP Servers',
    description: 'Model Context Protocol servers expose AI tools through a standardized interface.',
    detail: 'MCP is a protocol (like REST or GraphQL) for AI tool access.\n\nKey concepts:\n• MCP Server: A service that exposes tools\n• Transport: HTTP/SSE (most common) or stdio (for local)\n• Tools: Individual actions (search, create, update, etc.)\n• Session: MCP uses session-based auth (handled by mcporter)\n\nClawOps uses mcporter to manage all MCP connections.',
    icon: '🔌',
    tip: 'Most modern AI tools (Notion, Slack, GitHub, Linear) have MCP servers available.',
  },
  {
    title: 'Find an MCP Server Endpoint',
    description: 'Get the MCP server URL from any service that supports MCP.',
    detail: 'Common MCP server formats:\n• Smithery.ai: https://server.smithery.ai/{server-id}\n• n8n MCP: https://your-n8n.com/mcp/{server-id}\n• Custom: https://your-service.com/mcp\n\nFor Smithery.ai:\n1. Go to smithery.ai\n2. Search for the service (e.g. "Notion")\n3. Copy the MCP URL',
    icon: '🔍',
    tip: 'ClawOps pre-configures n8n MCP (44 tools) and GHL MCP. Add others as needed.',
  },
  {
    title: 'Add the Server to ClawOps',
    description: 'Register the MCP server in the ClawOps MCP Library.',
    detail: '1. Go to Dashboard → MCP Library\n2. Click "+ Add Server"\n3. Enter a name (e.g. "notion", "github")\n4. Paste the MCP server URL\n5. Click "Add Server"\n6. The server will appear in your list\n7. Click it to see available tools\n\nmcporter will handle the session-based authentication automatically.',
    icon: '⚙️',
    tip: 'The server must be reachable from your ClawOps VPS. Use Tailscale domains for internal services.',
  },
]

export default function MCPServersGuideClient() {
  const [openStep, setOpenStep] = useState<number | null>(null)

  return (
    <div className="min-h-screen py-32 px-4" style={{ background: '#0a0a0f' }}>
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/guides" className="hover:text-white transition-colors">Guides</Link>
          <span>/</span>
          <span className="text-gray-300">MCP Servers</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">🔌</span>
            <span className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ background: 'rgba(102,0,255,0.15)', color: '#6600FF' }}>Developer</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Add Custom MCP Servers</h1>
          <p className="text-gray-400 mb-4">
            Connect any Model Context Protocol server to extend your AI agents. GitHub, Notion, Slack, Linear — if it has an MCP server, you can connect it.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span>⏱️ 3 min</span><span>•</span><span>🆓 Free</span><span>•</span><span>Any MCP-compatible service</span>
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
          <Link href="/guides/chrome-vnc" className="text-sm text-gray-400 hover:text-white transition-colors">← Chrome VNC</Link>
          <Link href="/guides/skills-library" className="text-sm text-[#00D4FF] hover:text-[#00b8e6]">Skills & Plugins Library →</Link>
        </div>
      </div>
    </div>
  )
}
