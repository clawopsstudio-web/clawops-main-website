import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check provisioning status
  const { data: row } = await supabase
    .from('onboarding_submissions')
    .select('status, vps_ip')
    .eq('clerk_user_id', user.id)
    .single()

  const isActive = row?.status === 'active'

  // Count agents
  const { count: agentCount } = await supabase
    .from('agents')
    .select('id', { count: 'exact' })
    .eq('clerk_user_id', user.id)

  // Count missions today
  const today = new Date().toISOString().split('T')[0]
  const { count: missionCount } = await supabase
    .from('missions')
    .select('id', { count: 'exact' })
    .eq('clerk_user_id', user.id)
    .gte('started_at', today)

  return NextResponse.json({
    status: isActive ? 'active' : 'provisioning',
    activeAgents: agentCount ?? 0,
    missionsToday: missionCount ?? 0,
    connectedTools: 0,
    hermesLive: false,
  })
}
