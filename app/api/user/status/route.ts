import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createClient()

  // Provisioning status
  const { data: row } = await supabase
    .from('onboarding_submissions')
    .select('status, vps_ip')
    .eq('clerk_user_id', userId)
    .single()

  if (!row) {
    return NextResponse.json({ status: 'not_found' })
  }

  // Agent count
  const { count: agentCount } = await supabase
    .from('agents')
    .select('id', { count: 'exact' })
    .eq('clerk_user_id', userId)

  const today = new Date().toISOString().split('T')[0]
  const { count: missionCount } = await supabase
    .from('missions')
    .select('id', { count: 'exact' })
    .eq('clerk_user_id', userId)
    .gte('started_at', today)

  return NextResponse.json({
    status: row.status === 'active' ? 'active' : 'provisioning',
    activeAgents: agentCount ?? 0,
    missionsToday: missionCount ?? 0,
    hermesLive: false, // updated by polling in layout
    connectedTools: 0,
    vpsIp: row.vps_ip ?? null,
  })
}
