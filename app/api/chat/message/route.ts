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

// Model: try kimi-k2-thinking first, fallback to llama-3.3
const MODEL = 'meta/llama-3.3-70b-instruct'

// Agent UUIDs to names mapping
const AGENT_UUIDS: Record<string, string> = {
  'f4720d9d-cf17-4990-aaf4-b4f8688e7b9a': 'Ryan',
  '67965911-391f-4930-ab0b-0f036672f414': 'Arjun',
  'd8008e7c-bb65-4c66-9dbf-e840d5cb3f53': 'Helena',
}

async function getAgentInfo(supabase: any, agentId?: string) {
  if (!agentId || agentId === '00000000-0000-0000-0000-000000000000' || agentId === 'all') {
    return null
  }
  const knownName = AGENT_UUIDS[agentId]
  if (knownName) return { name: knownName }
  const { data } = await supabase.from('agents').select('name').eq('id', agentId).single()
  if (data?.name) return { name: data.name }
  return null
}

async function handleTelegramCommand(message: string, userId: string): Promise<{ sent: boolean; result?: string; error?: string }> {
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
          result: `✅ Message sent via Telegram!\n\n📤 "${textToSend}"\n\nSent to Telegram bot @${ADMIN_CHAT_ID}`,
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
  const agentInfo = await getAgentInfo(supabase, agentId)
  const NO_AGENT = '00000000-0000-0000-0000-000000000000'

  const telegramResult = await handleTelegramCommand(message.trim(), userId)
  let extraContext = ''
  if (telegramResult.sent && telegramResult.result) {
    extraContext = `\n\n[Telegram message sent successfully: ${telegramResult.result}]`
  }

  if (!NVIDIA_API_KEY) {
    console.error('[chat/message] NVIDIA_API_KEY not set in Vercel env vars')
    return NextResponse.json({ content: 'AI service not configured. Please contact support.' }, { status: 503 })
  }

  const agentName = agentInfo?.name ?? 'Agent'
  const systemPrompt = telegramResult.sent
    ? `You are ${agentName}, an AI agent for ClawOps Studio. The user just sent a Telegram message. Be helpful and confirm what was done. Keep responses concise.`
    : `You are ${agentName}, an AI agent for ClawOps Studio. Be helpful, direct, and technically capable. Keep responses concise and actionable.`

  let aiContent: string
  try {
    console.log(`[chat/message] Calling NVIDIA API with model ${MODEL}, key present: ${!!NVIDIA_API_KEY}`)

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
      // Log the ACTUAL error so Pulkit can see in Vercel Function Logs
      console.error(`[chat/message] NVIDIA API error: HTTP ${status}`, responseText.slice(0, 500))

      let errorDetail = `AI service returned error ${status}`
      try {
        const errJson = JSON.parse(responseText)
        errorDetail = errJson.message || errJson.error?.message || errJson.error || errorDetail
      } catch (_) {
        errorDetail = responseText.slice(0, 200) || errorDetail
      }

      // If unauthorized (401) or model not found (404), suggest fix
      if (status === 401) {
        return NextResponse.json({
          content: 'AI service authentication failed. NVIDIA_API_KEY may be invalid or expired. Please check Vercel env vars.',
        }, { status: 502 })
      }
      if (status === 404) {
        return NextResponse.json({
          content: `AI model "${MODEL}" not found. Please update the model in chat/route.ts.`,
        }, { status: 502 })
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
      content: `Failed to reach AI service: ${err.message}. Check Vercel Function Logs.`,
    }, { status: 502 })
  }

  // Store in chat_messages
  const now = new Date().toISOString()
  const base = { user_id: userId, agent_id: agentId ?? NO_AGENT, created_at: now }
  try {
    await supabase.from('chat_messages').insert({ ...base, role: 'user', content: message })
    await supabase.from('chat_messages').insert({ ...base, role: 'assistant', content: aiContent })
  } catch (err) {
    console.warn('[chat/message] could not save message:', err)
  }

  return NextResponse.json({ content: aiContent })
}
