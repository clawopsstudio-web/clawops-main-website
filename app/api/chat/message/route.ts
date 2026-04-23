/**
 * POST /api/chat/message
 * Body: { message: string, agentId?: string }
 * Auth: Clerk server-side auth
 */
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'import { execSSH } from '@/lib/vps-ssh'
import { createClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  const { userId } = auth()
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
    title: message.trim().slice(0, 100),
    prompt: message,
    status: 'running',
    started_at: new Date().toISOString(),
  }).select().single()

  try {
    const result = await execSSH(userId, `hermes chat -q "${message.replace(/"/g, '\\"')}" -t terminal,file`, 60_000)

    const content = result.stdout.trim() || result.stderr.trim() || 'Agent completed with no output.'

    // Update mission in DB
    if (mission?.id) {
      await supabase.from('missions').update({
        output: content,
        status: 'completed',
        completed_at: new Date().toISOString(),
      }).eq('id', mission.id)
    }

    return NextResponse.json({ content })
  } catch (err: any) {
    if (mission?.id) {
      await supabase.from('missions').update({ status: 'failed' }).eq('id', mission.id).catch(() => {})
    }
    return NextResponse.json({ error: err.message ?? 'Hermes error' }, { status: 500 })
  }
}
