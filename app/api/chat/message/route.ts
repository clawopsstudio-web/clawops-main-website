/**
 * POST /api/chat/message
 * Body: { message: string, agentId?: string }
 * Auth: Supabase session
 *
 * Features:
 * - Detects Telegram commands and sends real messages via Telegram bot
 * - Stores messages in chat_messages table
 * - Calls NVIDIA API for AI responses
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/supabase/client'

const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY
const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const ADMIN_CHAT_ID = '381136631' // Pulkit's Telegram chat ID

// Agent names mapped by agent ID
const AGENT_NAMES: Record<string, { name: string }> = {
  ryan: { name: 'Ryan' },
  arjun: { name: 'Arjun' },
  helena: { name: 'Helena' },
}

function getAgentInfo(agentId?: string) {
  if (!agentId || agentId === 'all') return null
  const key = agentId.toLowerCase()
  return AGENT_NAMES[key] ?? null
}

async function handleTelegramCommand(message: string, userId: string): Promise<{ sent: boolean; result?: string; error?: string }> {
  // Detect Telegram command patterns
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

        // Log to logs table
        try {
          const supabase = createClient()
          await supabase.from('logs').insert({
            user_id: userId,
            agent_name: 'Helena',
            action: `Sent Telegram message: "${textToSend.slice(0, 40)}..."`,
            level: 'info',
          })
        } catch (_) { /* non-critical */ }

        return {
          sent: true,
          result: `✅ Message sent via Telegram bot!\n\n📤 "${textToSend}"\n\nSent to @${ADMIN_CHAT_ID}`,
        }
      } catch (err: any) {
        return { sent: false, error: err.message }
      }
    }
  }

  return { sent: false }
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

  // ── Telegram command detection ────────────────────────────────────────────
  const telegramResult = await handleTelegramCommand(message.trim(), userId)
  let extraContext = ''
  if (telegramResult.sent && telegramResult.result) {
    extraContext = `\n\n[Telegram message sent successfully: ${telegramResult.result}]`
  }

  // ── Call NVIDIA API ────────────────────────────────────────────────────
  if (!NVIDIA_API_KEY) {
    return NextResponse.json({ content: 'AI service not configured.' }, { status: 503 })
  }

  let aiContent: string
  const agentName = agentInfo?.name ?? 'Agent'
  const systemPrompt = telegramResult.sent
    ? `You are ${agentName}, an AI agent for ClawOps Studio. The user just sent a Telegram message. Be helpful and confirm what was done. Keep responses concise.`
    : `You are ${agentName}, an AI agent for ClawOps Studio. Be helpful, direct, and technically capable. Keep responses concise and actionable.`

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
          { role: 'system', content: systemPrompt },
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

    // Append Telegram result to AI response if detected
    if (telegramResult.sent && telegramResult.result) {
      aiContent = telegramResult.result + '\n\n' + aiContent
    } else if (telegramResult.error) {
      aiContent = aiContent + `\n\n⚠️ Telegram: ${telegramResult.error}`
    }

    if (aiContent.length > 8000) aiContent = aiContent.slice(0, 8000) + '\n\n[Response truncated]'
  } catch (err) {
    console.error('[chat/message] AI call failed:', err)
    return NextResponse.json({ content: 'Failed to reach AI service. Please try again.' }, { status: 502 })
  }

  // ── Store in chat_messages ────────────────────────────────────────────
  const now = new Date().toISOString()
  const base = {
    user_id: userId,
    agent_id: agentId ?? NO_AGENT,
    created_at: now,
  }
  try {
    await supabase.from('chat_messages').insert({ ...base, role: 'user', content: message })
    await supabase.from('chat_messages').insert({ ...base, role: 'assistant', content: aiContent })
  } catch (err) {
    console.warn('[chat/message] could not save message:', err)
  }

  return NextResponse.json({ content: aiContent })
}
