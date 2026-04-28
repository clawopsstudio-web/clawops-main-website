/**
 * POST /api/chat/message
 * Uses Hermes on the VPS for chat.
 * Auth: Supabase session cookie
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

// Hermes chat API - accessible via hermes.clawops.studio/chat
const HERMES_CHAT_URL = process.env.HERMES_CHAT_URL || 'https://hermes.clawops.studio/chat'
const HERMES_API_KEY = process.env.HERMES_API_KEY || 'test123'

// Agent names
const AGENT_UUIDS: Record<string, string> = {
  'f4720d9d-cf17-4990-aaf4-b4f8688e7b9a': 'Ryan',
  '67965911-391f-4930-ab0b-0f036672f414': 'Arjun',
  'd8008e7c-bb65-4c66-9dbf-e840d5cb3f53': 'Tyler',
  '00000000-0000-0000-0000-000000000000': 'ClawOps',
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getOrCreateWorkspace(userId: string): Promise<string> {
  const { data } = await supabaseAdmin
    .from('workspaces')
    .select('id')
    .eq('workspace_user_id', userId)
    .limit(1)
    .single()

  if (data?.id) return data.id

  const { data: newWs } = await supabaseAdmin
    .from('workspaces')
    .insert({ workspace_user_id: userId, name: 'My Workspace' })
    .select('id')
    .single()

  return newWs?.id ?? userId
}

async function getOrCreateThread(workspaceId: string, agentId: string): Promise<string> {
  const { data: existing } = await supabaseAdmin
    .from('chat_threads')
    .select('id')
    .eq('workspace_id', workspaceId)
    .eq('agent_id', agentId)
    .limit(1)
    .single()

  if (existing?.id) return existing.id

  const { data: newThread } = await supabaseAdmin
    .from('chat_threads')
    .insert({ workspace_id: workspaceId, agent_id: agentId, title: 'New conversation' })
    .select('id')
    .single()

  return newThread?.id ?? ''
}

async function saveMessages(
  workspaceId: string,
  threadId: string,
  agentId: string,
  userMessage: string,
  aiResponse: string
): Promise<void> {
  const now = new Date().toISOString()
  await Promise.all([
    supabaseAdmin.from('chat_messages').insert({
      workspace_id: workspaceId,
      thread_id: threadId,
      agent_id: agentId,
      role: 'user',
      content: userMessage,
      created_at: now,
    }),
    supabaseAdmin.from('chat_messages').insert({
      workspace_id: workspaceId,
      thread_id: threadId,
      agent_id: agentId,
      role: 'assistant',
      content: aiResponse,
      created_at: now,
    }),
  ])
}

// ─── Main Handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { message, threadId, agentId, profile = 'default' } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const effectiveAgentId = agentId || '00000000-0000-0000-0000-000000000000'
  const agentName = AGENT_UUIDS[effectiveAgentId] || 'ClawOps'

  // Get or create workspace + thread
  let workspaceId: string
  let resolvedThreadId: string
  try {
    workspaceId = await getOrCreateWorkspace(userId)
    resolvedThreadId = threadId
      ? threadId
      : await getOrCreateThread(workspaceId, effectiveAgentId)
  } catch (err: any) {
    console.warn('[chat/message] Workspace/thread setup failed:', err.message)
    workspaceId = userId
    resolvedThreadId = threadId ?? ''
  }

  // Build system prompt based on agent
  const systemPrompt = `You are ${agentName}, an AI agent for ClawOps Studio. Be helpful, direct, and technically capable. Keep responses concise and actionable.`

  let aiContent: string

  // Try Hermes chat API
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 120_000)

    const hermesRes = await fetch(HERMES_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `[System: ${systemPrompt}]\n\nUser: ${message.trim()}`,
        profile,
        api_key: HERMES_API_KEY,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (hermesRes.ok) {
      const hermesData = await hermesRes.json()
      aiContent = hermesData.response || hermesData.content || hermesData.message || 'No response'
    } else {
      throw new Error(`Hermes HTTP ${hermesRes.status}`)
    }
  } catch (err: any) {
    console.error('[chat/message] Hermes failed:', err.message)
    aiContent = `⚠️ AI service temporarily unavailable. Please try again.\n\nError: ${err.message}`
  }

  // Truncate if needed
  if (aiContent.length > 8000) {
    aiContent = aiContent.slice(0, 8000) + '\n\n[Response truncated]'
  }

  // Clean up Hermes verbose output
  aiContent = aiContent
    .replace(/🛠️[\s\S]*?Final tool selection.*?\n\n/g, '')
    .replace(/✅[\s\S]*?🛠️/g, '')
    .replace(/⚠️[\s\S]*?$/gm, '')
    .trim()

  // Save to DB
  try {
    await saveMessages(workspaceId, resolvedThreadId, effectiveAgentId, message.trim(), aiContent)
  } catch (err) {
    console.warn('[chat/message] Failed to save messages:', err)
  }

  return NextResponse.json({
    content: aiContent,
    threadId: resolvedThreadId,
    workspaceId,
  })
}
