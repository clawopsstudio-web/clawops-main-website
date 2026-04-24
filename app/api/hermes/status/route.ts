/**
 * app/api/hermes/status/route.ts
 * Health check for Hermes agent on the user's VPS
 * Auth: Supabase session
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: row } = await supabaseAdmin
    .from('onboarding_submissions')
    .select('vps_instance_id, status')
    .eq('clerk_user_id', userId)
    .single()

  if (!row || row.status !== 'active') {
    return NextResponse.json({ live: false })
  }

  // TODO: Actually ping the VPS Hermes endpoint when VPS is provisioned
  // For now, return live if status is active
  return NextResponse.json({ live: row.status === 'active' })
}
