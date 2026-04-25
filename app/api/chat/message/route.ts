/**
 * POST /api/chat/message
 * Body: { message: string, agentId?: string }
 * Auth: Supabase session
 *
 * Architecture: calls NVIDIA API directly for chat responses.
 * Stores messages in chat_messages table ONLY.
 * Never writes to missions table.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/supabase/client'

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'

// Agent names mapped by agent ID
}

function getAgentInfo(agentId?: string) {
  if (!agentId || agentId === 'all') return null
  const key = agentId.toLowerCase()
  return AGENT_NAMES[key] ?? null
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { message, agentId } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const supabase = createClient()
  const agentInfo = getAgentInfo(agentId)
  const NO_AGENT = '00000000-0000-0000-0000-000000000000'

  // ── Call NVIDIA API ────────────────────────────────────────────────────────
  if (!NVIDIA_API_KEY) {
    return NextResponse.json({ content: 'AI service not configured.' }, { status: 503 })
  }

  let aiContent: string
  const agentName = agentInfo?.name ?? 'Agent'
  try {
    const aiRes = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshotai/kimi-k2-thinking',
        messages: [
          {
            role: 'system',
            content: `You are ${agentName}, an AI agent for ClawOps Studio. Be helpful, direct, and technically capable. Keep responses concise and actionable.`,
          },
          { role: 'user', content: message },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text()
      console.error('[chat/message] NVIDIA API error:', aiRes.status, errText)
      return NextResponse.json({ content: 'AI service error. Please try again.' }, { status: 502 })
    }

    const aiData = await aiRes.json()
    aiContent = aiData.choices?.[0]?.message?.content ?? 'No response from AI.'
    if (aiContent.length > 8000) aiContent = aiContent.slice(0, 8000) + '\n\n[Response truncated]'
  } catch (err) {
    console.error('[chat/message] AI call failed:', err)
    return NextResponse.json({ content: 'Failed to reach AI service. Please try again.' }, { status: 502 })
  }

  // ── Store in chat_messages ONLY ─────────────────────────────────────────
  const now = new Date().toISOString()
  const base = {
    user_id: userId,
    agent_id: agentId ?? NO_AGENT,
    created_at: now,
  }
  try {
    await supabase.from('chat_messages').insert({
      ...base,
      role: 'user',
      content: message,
    })
    await supabase.from('chat_messages').insert({
      ...base,
      role: 'assistant',
      content: aiContent,
    })
  } catch (err) {
    // Non-fatal — log but don't fail the user
    console.warn('[chat/message] could not save message:', err)
  }

  return NextResponse.json({ content: aiContent })
}
