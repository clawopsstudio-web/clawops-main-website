/**
 * POST /api/chat/message
 * Body: { message: string, agentId?: string }
 * Auth: Supabase session
 *
 * Architecture: calls NVIDIA API directly for chat responses.
 * Missions are stored in Supabase for history.
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/supabase/client'

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { message, agentId } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const supabase = createClient()

  // ── Call NVIDIA API ────────────────────────────────────────────────────────
  if (!NVIDIA_API_KEY) {
    console.error('[chat/message] NVIDIA_API_KEY not set')
    return NextResponse.json({ content: 'AI service not configured. Please contact support.' }, { status: 503 })
  }

  let aiContent: string
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
            content: `You are Hermes, the AI agent for ClawOps Studio. You are helpful, direct, and technically capable. You help businesses automate their workflows using AI agents. Keep responses concise and actionable. Current user ID: ${userId}.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
    })

    if (!aiRes.ok) {
      const errText = await aiRes.text()
      console.error('[chat/message] NVIDIA API error:', aiRes.status, errText)
      return NextResponse.json({ content: 'AI service returned an error. Please try again.' }, { status: 502 })
    }

    const aiData = await aiRes.json()
    aiContent = aiData.choices?.[0]?.message?.content ?? 'No response from AI.'

    // Trim very long responses
    if (aiContent.length > 8000) {
      aiContent = aiContent.slice(0, 8000) + '\n\n[Response truncated]'
    }
  } catch (err) {
    console.error('[chat/message] AI call failed:', err)
    return NextResponse.json({ content: 'Failed to reach AI service. Please try again.' }, { status: 502 })
  }

  // ── Store mission in DB (best effort — don't fail the chat if this errors) ─
  try {
    await supabase.from('missions').insert({
      user_id: userId,
      agent_id: agentId ?? null,
      title: message.slice(0, 120),
      prompt: message,
      output: aiContent,
      status: 'completed',
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
  } catch (err) {
    // Non-fatal — log but don't fail the user's chat
    console.warn('[chat/message] could not save mission:', err)
  }

  return NextResponse.json({ content: aiContent })
}
