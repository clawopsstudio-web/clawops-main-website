import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // For admin demo account: simulate fully provisioned
  if (userId === '5a1f1a65-b620-46dc-879d-c67e69ba0c04') {
    return NextResponse.json({
      status: 'ready',
      dashboard_url: 'https://demo.app.clawops.studio',
      vps_ip: '178.238.232.52',
    })
  }

  // For real users: query Supabase for provisioning status
  const { createClient } = await import('@/lib/supabase/client')
  const supabase = createClient()

  const { data } = await supabase
    .from('onboarding_submissions')
    .select('status, dashboard_url, vps_ip')
    .eq('clerk_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) {
    return NextResponse.json({ status: 'unknown' })
  }

  return NextResponse.json({
    status: data.status === 'active' ? 'ready' : 'provisioning',
    dashboard_url: data.dashboard_url,
    vps_ip: data.vps_ip,
  })
}
