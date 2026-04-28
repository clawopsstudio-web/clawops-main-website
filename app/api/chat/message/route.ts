/**
 * POST /api/chat/message
 * Body: { message: string, threadId?: string, agentId?: string, profile?: string }
 * Auth: Supabase session
 *
 * Connects to Hermes AI on the VPS (178.238.232.52:5000).
 * Falls back to NVIDIA API if VPS is unavailable.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'
const MODEL = 'meta/llama-3.3-70b-instruct'

// VPS Hermes config
const VPS_HOST = process.env.VPS_HERMES_HOST || '178.238.232.52'
const VPS_PORT = process.env.VPS_HERMES_PORT || '5000'
const VPS_API_KEY = process.env.VPS_HERMES_API_KEY || 'test123'
const HERMES_URL = `http://${VPS_HOST}:${VPS_PORT}`

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_CHAT_ID = '381136631'

// Agent UUIDs → names
const AGENT_UUIDS: Record<string, string> = {
  'f4720d9d-cf17-4990-aaf4-b4f8688e7b9a': 'Ryan',
  '67965911-391f-4930-ab0b-0f036672f414': 'Arjun',
  'd8008e7c-bb65-4c66-9dbf-e840d5cb3f53': 'Helena',
}

const NO_AGENT = '00000000-0000-0000-0000-000000000000'

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getOrCreateWorkspace(supabase: any, userId: string): Promise<string> {
  const { data } = await supabase
    .from('workspaces')
    .select('id')
    .eq('workspace_user_id', userId)
    .limit(1)
    .single()

  if (data?.id) return data.id

  const { data: newWs, error } = await supabase
    .from('workspaces')
    .insert({ workspace_user_id: userId, name: 'My Workspace' })
    .select('id')
    .single()

  if (error || !newWs) throw new Error(`Failed to create workspace: ${error?.message}`)
  return newWs.id
}

async function getOrCreateThread(
  supabase: any,
  workspaceId: string,
  agentId: string
): Promise<string> {
  const { data: existing } = await supabase
    .from('chat_threads')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('agent_id', agentId)
    .limit(1)
    .single()

  if (existing?.id) return existing.id

  const { data: newThread, error } = await supabase
    .from('chat_threads')
    .insert({ workspace_id: workspaceId, agent_id: agentId, title: 'New conversation' })
    .select('id')
    .single()

  if (error || !newThread) throw new Error(`Failed to create thread: ${error?.message}`)
  return newThread.id
}

async function saveMessages(
  supabase: any,
  workspaceId: string,
  threadId: string,
  agentId: string,
  userMessage: string,
  aiResponse: string
): Promise<void> {
  const now = new Date().toISOString()
  await Promise.all([
    supabase.from('chat_messages').insert({
      workspace_id: workspaceId,
      thread_id: threadId,
      agent_id: agentId,
      role: 'user',
      content: userMessage,
      created_at: now,
    }),
    supabase.from('chat_messages').insert({
      workspace_id: workspaceId,
      thread_id: threadId,
      agent_id: agentId,
      role: 'assistant',
      content: aiResponse,
      created_at: now,
    }),
  ])
}

async function handleTelegramCommand(
  message: string
): Promise<{ sent: boolean; result?: string; error?: string }> {
  const patterns = [
    /^send (?:to )?telegram[:\s]+(.+)/i,
    /^telegram[:\s]+(.+)/i,
    /^send via telegram[:\s]+(.+)/i,
  ]
  for (const pattern of patterns) {
    const match = message.match(pattern)
    if (match) {
      const textToSend = match[1].trim()
      if (!textToSend) return { sent: false }
      if (!TELEGRAM_BOT_TOKEN) return { sent: false, error: 'Telegram bot not configured on server.' }
      try {
        const tgRes = await fetch(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: ADMIN_CHAT_ID,
              text: `📤 *ClawOps Message*\n\n${textToSend}`,
              parse_mode: 'Markdown',
            }),
          }
        )
        const tgData = await tgRes.json()
        if (!tgRes.ok || !tgData.ok) {
          return { sent: false, error: tgData.description ?? 'Telegram API error' }
        }
        return { sent: true, result: `✅ Message sent via Telegram!\n\n📤 "${textToSend}"` }
      } catch (err: any) {
        return { sent: false, error: err.message }
      }
    }
  }
  return { sent: false }
}

// ─── Hermes VPS Chat ─────────────────────────────────────────────────────────

interface HermesChatResponse {
  response?: string
  content?: string
  message?: string
  error?: string
}

async function chatWithHermes(
  message: string,
  profile: string = 'default'
): Promise<HermesChatResponse> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 90_000)

  try {
    const res = await fetch(`${HERMES_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${VPS_API_KEY}`,
      },
      body: JSON.stringify({
        message,
        profile,
        api_key: VPS_API_KEY,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      return { error: `Hermes HTTP ${res.status}` }
    }

    const text = await res.text()
    let data: HermesChatResponse
    try {
      data = JSON.parse(text)
    } catch {
      return { response: text }
    }

    return data
  } catch (err: any) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') {
      return { error: 'Hermes request timed out (>90s)' }
    }
    return { error: err.message }
  }
}

// ─── NVIDIA Fallback ─────────────────────────────────────────────────────────

async function chatWithNVIDIA(message: string, systemPrompt: string): Promise<string> {
  if (!NVIDIA_API_KEY) throw new Error('NVIDIA_API_KEY not configured')

  const aiRes = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
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
    }),
  })

  if (!aiRes.ok) {
    const body = await aiRes.text()
    throw new Error(`NVIDIA API error ${aiRes.status}: ${body.slice(0, 200)}`)
  }

  const aiData = await aiRes.json()
  return aiData.choices?.[0]?.message?.content ?? 'No response from AI.'
}

// ─── Main Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { message, threadId, agentId, profile = 'default' } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const effectiveAgentId = (agentId && agentId !== NO_AGENT) ? agentId : NO_AGENT
  const agentName = AGENT_UUIDS[effectiveAgentId] ?? 'Agent'

  // Get or create workspace + thread (Phase 5 schema)
  let workspaceId: string
  let resolvedThreadId: string
  try {
    const supabase = supabaseAdmin
    workspaceId = await getOrCreateWorkspace(supabase, userId)
    resolvedThreadId = threadId
      ? threadId
      : await getOrCreateThread(supabase, workspaceId, effectiveAgentId)
  } catch (err: any) {
    console.warn('[chat/message] Workspace/thread setup failed:', err.message)
    workspaceId = userId
    resolvedThreadId = threadId ?? NO_AGENT
  }

  // Telegram command detection
  const telegramResult = await handleTelegramCommand(message.trim())

  const systemPrompt = telegramResult.sent
    ? `You are ${agentName}, an AI agent for ClawOps Studio. The user just sent a Telegram message. Be helpful and confirm what was done.`
    : `You are ${agentName}, an AI agent for ClawOps Studio. Be helpful, direct, and technically capable. Keep responses concise and actionable.`

  let aiContent: string
  let source: 'hermes' | 'nvidia' = 'hermes'

  // Try Hermes VPS first
  const hermesResult = await chatWithHermes(message.trim(), profile)

  if (hermesResult.error) {
    console.warn(`[chat/message] Hermes failed: ${hermesResult.error}. Falling back to NVIDIA.`)
    source = 'nvidia'
    try {
      aiContent = await chatWithNVIDIA(message.trim(), systemPrompt)
    } catch (err: any) {
      console.error('[chat/message] NVIDIA fallback failed:', err.message)
      return NextResponse.json({
        content: `AI service unavailable. Hermes: ${hermesResult.error}. NVIDIA: ${err.message}`,
      }, { status: 502 })
    }
  } else {
    aiContent = hermesResult.response || hermesResult.content || hermesResult.message || ''
  }

  // Append Telegram result to response
  if (telegramResult.sent && telegramResult.result) {
    aiContent = telegramResult.result + '\n\n' + aiContent
  } else if (telegramResult.error && !telegramResult.sent) {
    aiContent = aiContent + `\n\n⚠️ Telegram: ${telegramResult.error}`
  }

  if (aiContent.length > 8000) aiContent = aiContent.slice(0, 8000) + '\n\n[Response truncated]'

  // Save to DB
  try {
    await saveMessages(
      supabaseAdmin,
      workspaceId,
      resolvedThreadId,
      effectiveAgentId,
      message.trim(),
      aiContent
    )
  } catch (err) {
    console.warn('[chat/message] Failed to save messages:', err)
  }

  return NextResponse.json({
    content: aiContent,
    threadId: resolvedThreadId,
    workspaceId,
    source,
  })
}
