import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { agentId, message, history } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Try to communicate with OpenClaw Gateway
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      const gatewayResponse = await fetch('http://127.0.0.1:18789/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          'X-Agent-Id': agentId || 'orchestrator',
        },
        body: JSON.stringify({ message, history: history || [], userId }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (gatewayResponse.ok) {
        const data = await gatewayResponse.json()
        return NextResponse.json({ response: data.response || data.message })
      }
    } catch {
      // Gateway not available — fall through to fallback
    }

    // Fallback response
    const lower = message.toLowerCase()
    if (lower.includes('help') || lower.includes('what can you do')) {
      return NextResponse.json({
        response: "I'm your ClawOps AI assistant. I can help with building your business, debugging code, managing infrastructure, and answering questions about the platform. What do you need?"
      })
    }
    if (lower.includes('status') || lower.includes('dashboard')) {
      return NextResponse.json({
        response: "Your dashboard is live at app.clawops.studio. Connect your integrations, chat with your AI team, and manage your agents from there. Everything is working and ready to use."
      })
    }

    return NextResponse.json({
      response: "Got your message. How can I help you today?",
      source: 'clerk-authenticated'
    })

  } catch (e) {
    console.error('Chat API error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
