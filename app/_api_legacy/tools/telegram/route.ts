/**
 * POST /api/tools/telegram/send
 * Sends a message via the user's Telegram bot
 * Body: { chat_id: string, message: string }
 * Auth: Supabase session
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { chat_id, message } = body

  if (!chat_id || !message?.trim()) {
    return NextResponse.json({ error: 'chat_id and message are required' }, { status: 400 })
  }

  // Get Telegram bot token — from env or from user_connections
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) {
    return NextResponse.json({ error: 'Telegram bot not configured' }, { status: 500 })
  }

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    const tgData = await tgRes.json()

    if (!tgRes.ok || !tgData.ok) {
      return NextResponse.json({
        error: tgData.description ?? 'Telegram API error',
        raw: tgData,
      }, { status: 400 })
    }

    // Log the action to logs table
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.from('logs').insert({
        user_id: userId,
        agent_name: 'Helena',
        action: `Sent Telegram message to chat ${chat_id}`,
        level: 'info',
      })
    } catch (_) { /* non-critical */ }

    return NextResponse.json({
      success: true,
      message_id: tgData.result?.message_id,
      chat_id,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
