/**
 * POST /api/chat/stream
 * Body: { message: string, threadId?: string, agentId?: string, profile?: string }
 * Returns: text/event-stream (SSE)
 *
 * Streams Hermes AI responses as Server-Sent Events.
 * The VPS Hermes /stream endpoint sends incremental tokens.
 * Falls back to chunked NVIDIA if VPS is unavailable.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'
const MODEL = 'meta/llama-3.3-70b-instruct'

const VPS_HOST = process.env.VPS_HERMES_HOST || '178.238.232.52'
const VPS_PORT = process.env.VPS_HERMES_PORT || '5000'
const VPS_API_KEY = process.env.VPS_HERMES_API_KEY || 'test123'
const HERMES_URL = `http://${VPS_HOST}:${VPS_PORT}`

const AGENT_UUIDS: Record<string, string> = {
  'f4720d9d-cf17-4990-aaf4-b4f8688e7b9a': 'Ryan',
  '67965911-391f-4930-ab0b-0f036672f414': 'Arjun',
  'd8008e7c-bb65-4c66-9dbf-e840d5cb3f53': 'Helena',
}

const NO_AGENT = '00000000-0000-0000-0000-000000000000'

// ─── SSE Helpers ────────────────────────────────────────────────────────────

function sse(data: string, event?: string): string {
  const prefix = event ? `event: ${event}\n` : ''
  return `${prefix}data: ${data}\n\n`
}

function encoder(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}

// ─── NVIDIA Streaming (fallback) ─────────────────────────────────────────────

async function* streamNVIDIA(
  message: string,
  systemPrompt: string
): AsyncGenerator<string, void, unknown> {
  const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NVIDIA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      max_tokens: 2048,
      temperature: 0.7,
      stream: true,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`NVIDIA API error ${res.status}: ${body.slice(0, 200)}`)
  }

  if (!res.body) throw new Error('NVIDIA returned empty stream body')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  const newline = new Uint8Array([10]) // \n
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const payload = trimmed.slice(5).trim()
        if (payload === '[DONE]') return
        try {
          const parsed = JSON.parse(payload)
          const content: string = parsed.choices?.[0]?.delta?.content
          if (content) yield content
        } catch {
          // skip malformed JSON
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// ─── Hermes SSE Streaming ─────────────────────────────────────────────────────

async function* streamHermes(
  message: string,
  profile: string = 'default'
): AsyncGenerator<string, void, unknown> {
  const res = await fetch(`${HERMES_URL}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${VPS_API_KEY}`,
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      message,
      profile,
      api_key: VPS_API_KEY,
    }),
  })

  if (!res.ok) {
    throw new Error(`Hermes stream HTTP ${res.status}`)
  }

  if (!res.body) throw new Error('Hermes returned empty stream body')

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue
        const payload = trimmed.slice(5).trim()
        if (payload === '[DONE]') return
        yield payload
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// ─── Main Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) {
    return new NextResponse(sse(JSON.stringify({ error: 'Unauthorized' })), {
      status: 401,
      headers: { 'Content-Type': 'text/event-stream' },
    })
  }

  const body = await req.json()
  const { message, threadId, agentId, profile = 'default' } = body

  if (!message?.trim()) {
    return new NextResponse(sse(JSON.stringify({ error: 'Message is required' })), {
      status: 400,
      headers: { 'Content-Type': 'text/event-stream' },
    })
  }

  const effectiveAgentId = (agentId && agentId !== NO_AGENT) ? agentId : NO_AGENT
  const agentName = AGENT_UUIDS[effectiveAgentId] ?? 'Agent'
  const systemPrompt = `You are ${agentName}, an AI agent for ClawOps Studio. Be helpful, direct, and technically capable. Keep responses concise and actionable.`

  // Try Hermes first, fall back to NVIDIA
  let streamSource: 'hermes' | 'nvidia' = 'hermes'
  let generator: AsyncGenerator<string, void, unknown>

  try {
    // Test Hermes connectivity with a quick health check
    const health = await fetch(`${HERMES_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    }).then(r => r.ok).catch(() => false)

    if (health) {
      generator = streamHermes(message.trim(), profile)
    } else {
      throw new Error('Hermes health check failed')
    }
  } catch {
    console.warn('[chat/stream] Hermes unavailable, falling back to NVIDIA streaming')
    streamSource = 'nvidia'
    if (!NVIDIA_API_KEY) {
      return new NextResponse(
        sse(JSON.stringify({ error: 'No AI service available. Configure NVIDIA_API_KEY.' })),
        { status: 503, headers: { 'Content-Type': 'text/event-stream' } }
      )
    }
    generator = streamNVIDIA(message.trim(), systemPrompt)
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (text: string) => {
        try {
          controller.enqueue(encoder(sse(text)))
        } catch {
          // stream may already be closed
        }
      }

      // Send metadata event
      enqueue(JSON.stringify({ type: 'start', source: streamSource, threadId, agentId: effectiveAgentId }))

      try {
        for await (const chunk of generator) {
          enqueue(JSON.stringify({ type: 'chunk', content: chunk }))
        }
        enqueue(JSON.stringify({ type: 'done' }))
      } catch (err: any) {
        console.error('[chat/stream] Stream error:', err.message)
        enqueue(JSON.stringify({ type: 'error', error: err.message }))
      } finally {
        try {
          controller.close()
        } catch {
          // already closed
        }
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering on Vercel
    },
  })
}
