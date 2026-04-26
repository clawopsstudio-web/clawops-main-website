/**
 * POST /api/chat/message
 * Body: { message: string, threadId?: string, agentId?: string }
 * Auth: Supabase session
 *
 * Features:
 * - Auto-creates workspace + thread for new conversations
 * - Detects Telegram commands and sends real messages via Telegram bot
 * - Stores messages in chat_messages table (Phase 5 schema: workspace_id + thread_id)
 * - Calls NVIDIA API for AI responses
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_CHAT_ID = '381136631' // Pulkit's Telegram chat ID

// Model: llama-3.3
const MODEL = 'meta/llama-3.3-70b-instruct'

// Global agent UUIDs → names (used when no workspace agent exists yet)
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
  // Look for existing thread for this workspace + agent
  const { data: existing } = await supabase
    .from('chat_threads')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('agent_id', agentId)
    .limit(1)
    .single()

  if (existing?.id) return existing.id

  // Create new thread
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
  message: string,
  userId: string
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
        return {
          sent: true,
          result: `✅ Message sent via Telegram!\n\n📤 "${textToSend}"`,
        }
      } catch (err: any) {
        return { sent: false, error: err.message }
      }
    }
  }
  return { sent: false }
}

// ─── Main Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { message, threadId, agentId } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // Use provided threadId or NO_AGENT, then normalize
  const effectiveAgentId = (agentId && agentId !== NO_AGENT) ? agentId : NO_AGENT

  // Get or create workspace and thread (Phase 5 schema)
  let workspaceId: string
  let resolvedThreadId: string
  try {
    const supabase = supabaseAdmin
    workspaceId = await getOrCreateWorkspace(supabase, userId)
    resolvedThreadId = threadId
      ? threadId
      : await getOrCreateThread(supabase, workspaceId, effectiveAgentId)
  } catch (err: any) {
    console.error('[chat/message] Workspace/thread setup failed:', err.message)
    // Fall back to old-style inserts if workspace setup fails
    workspaceId = userId
    resolvedThreadId = threadId ?? NO_AGENT
  }

  // Determine agent name for the AI prompt
  const agentName = AGENT_UUIDS[effectiveAgentId] ?? 'Agent'

  // Telegram command detection
  const telegramResult = await handleTelegramCommand(message.trim(), userId)

  if (!NVIDIA_API_KEY) {
    console.error('[chat/message] NVIDIA_API_KEY not set in Vercel env vars')
    return NextResponse.json({ content: 'AI service not configured. Please contact support.' }, { status: 503 })
  }

  const systemPrompt = telegramResult.sent
    ? `You are ${agentName}, an AI agent for ClawOps Studio. The user just sent a Telegram message. Be helpful and confirm what was done. Keep responses concise.`
    : `You are ${agentName}, an AI agent for ClawOps Studio. Be helpful, direct, and technically capable. Keep responses concise and actionable.`

  let aiContent: string
  try {
    console.log(`[chat/message] Calling NVIDIA API with model ${MODEL}`)

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

    const status = aiRes.status
    const responseText = await aiRes.text()

    if (!aiRes.ok) {
      console.error(`[chat/message] NVIDIA API error: HTTP ${status}`, responseText.slice(0, 500))
      let errorDetail = `AI service returned error ${status}`
      try {
        const errJson = JSON.parse(responseText)
        errorDetail = errJson.message || errJson.error?.message || errJson.error || errorDetail
      } catch (_) {
        errorDetail = responseText.slice(0, 200) || errorDetail
      }

      if (status === 401) {
        return NextResponse.json({
          content: 'AI service authentication failed. NVIDIA_API_KEY may be invalid or expired.',
        }, { status: 502 })
      }
      if (status === 404) {
        return NextResponse.json({ content: `AI model "${MODEL}" not found.` }, { status: 502 })
      }

      return NextResponse.json({
        content: `AI service error (${status}): ${errorDetail}. Please try again.`,
      }, { status: 502 })
    }

    let aiData: any
    try {
      aiData = JSON.parse(responseText)
    } catch (_) {
      console.error('[chat/message] Failed to parse NVIDIA response:', responseText.slice(0, 200))
      return NextResponse.json({ content: 'AI returned invalid response. Please try again.' }, { status: 502 })
    }

    aiContent = aiData.choices?.[0]?.message?.content ?? 'No response from AI.'

    if (telegramResult.sent && telegramResult.result) {
      aiContent = telegramResult.result + '\n\n' + aiContent
    } else if (telegramResult.error) {
      aiContent = aiContent + `\n\n⚠️ Telegram: ${telegramResult.error}`
    }

    if (aiContent.length > 8000) aiContent = aiContent.slice(0, 8000) + '\n\n[Response truncated]'
  } catch (err: any) {
    console.error('[chat/message] AI call failed:', err.message)
    return NextResponse.json({
      content: `Failed to reach AI service: ${err.message}.`,
    }, { status: 502 })
  }

  // Save messages to DB using Phase 5 schema
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
    console.warn('[chat/message] Failed to save messages to DB:', err)
    // Don't fail the request — AI response was already generated
  }

  return NextResponse.json({
    content: aiContent,
    threadId: resolvedThreadId,
    workspaceId,
  })
}
