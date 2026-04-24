/**
 * POST /api/chat/message
 * Body: { message: string, agentId?: string }
 * Auth: Clerk server-side auth
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { createClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { message, agentId } = body

  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const supabase = createClient()

  // Store mission in DB
  const { data: mission } = await supabase.from('missions').insert({
    clerk_user_id: userId,
    agent_id: agentId ?? null,
    prompt: message,
    status: 'running',
    started_at: new Date().toISOString()
  }).select().single()

  // Call AI agent via proxy
  try {
    const res = await fetch('/api/proxy/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, agentId, missionId: mission?.id })
    })
    const data = await res.json()
    return NextResponse.json({ content: data.content ?? data.response ?? 'Done' })
  } catch (err) {
    console.error('[chat/message] agent error:', err)
    return NextResponse.json({ content: 'Agent error. Please try again.' })
  }
}
