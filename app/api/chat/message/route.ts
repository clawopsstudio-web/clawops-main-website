/**
 * app/api/chat/message/route.ts
 * POST — send a message to Hermes via SSH
 */
import { NextRequest, NextResponse } from 'next/server'
import { execSSH } from '@/lib/vps-ssh'
import { createClient } from '@/lib/supabase/client'

export async function POST(req: NextRequest) {
  const { message, agentId } = await req.json()
  if (!message?.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  // Get user from Clerk session via Supabase
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const result = await execSSH(
      user.id,
      `hermes chat -q "${message.replace(/"/g, '\\"')}" -t terminal,file`,
      60_000
    )
    const content = result.stdout.trim() || result.stderr.trim() || 'Agent completed with no output.'
    return NextResponse.json({ content })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Hermes error' }, { status: 500 })
  }
}
