/**
 * app/api/user/status/route.ts
 * Returns provisioning + session status for the current user
 * Auth: Supabase session
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  // Read user from session cookie
  let userId: string | null = null
  try {
    const { createServerClient } = await import('@supabase/ssr')
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) { return null }, // cookies accessed via headers in middleware context
          set(_n: string, _v: string, _o: any) {},
          remove(_n: string, _o: any) {},
        },
      }
    )
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } catch {}

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Provisioning status
  const { data: row } = await supabaseAdmin
    .from('onboarding_submissions')
    .select('status, vps_ip')
    .eq('clerk_user_id', userId)
    .single()

  if (!row) {
    return NextResponse.json({ status: 'not_found' })
  }

  return NextResponse.json({
    status: row.status === 'active' ? 'active' : 'provisioning',
    vpsIp: row.vps_ip ?? null,
  })
}
