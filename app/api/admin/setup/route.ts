import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_SECRET = 'clawops-setup-2026'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const tables = ['profiles', 'vps_instances', 'subscriptions', 'user_skills', 'agent_instances', 'mission_logs']
  const results: Record<string, { exists: boolean; error?: string }> = {}

  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1)
    results[table] = { exists: !error, error: error?.message }
  }

  return NextResponse.json({ 
    status: 'ok',
    tables: results,
    message: 'Call POST with ?secret=clawops-setup-2026 to create schema'
  })
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const results: string[] = []
  const errors: string[] = []

  // 1. Create profiles table
  const { error: e1 } = await supabaseAdmin.from('profiles').select('id').limit(1)
  if (e1) {
    errors.push(`profiles: ${e1.message}`)
  } else {
    results.push('profiles ✓ (already exists)')
  }

  // 2. Create vps_instances
  const { error: e2 } = await supabaseAdmin.from('vps_instances').select('id').limit(1)
  if (e2) {
    errors.push(`vps_instances: ${e2.message}`)
  } else {
    results.push('vps_instances ✓ (already exists)')
  }

  // 3. Create subscriptions
  const { error: e3 } = await supabaseAdmin.from('subscriptions').select('id').limit(1)
  if (e3) {
    errors.push(`subscriptions: ${e3.message}`)
  } else {
    results.push('subscriptions ✓ (already exists)')
  }

  // 4. Create user_skills
  const { error: e4 } = await supabaseAdmin.from('user_skills').select('id').limit(1)
  if (e4) {
    errors.push(`user_skills: ${e4.message}`)
  } else {
    results.push('user_skills ✓ (already exists)')
  }

  // 5. Create agent_instances
  const { error: e5 } = await supabaseAdmin.from('agent_instances').select('id').limit(1)
  if (e5) {
    errors.push(`agent_instances: ${e5.message}`)
  } else {
    results.push('agent_instances ✓ (already exists)')
  }

  // 6. Create mission_logs
  const { error: e6 } = await supabaseAdmin.from('mission_logs').select('id').limit(1)
  if (e6) {
    errors.push(`mission_logs: ${e6.message}`)
  } else {
    results.push('mission_logs ✓ (already exists)')
  }

  // Check auth.users table
  const { error: authErr } = await supabaseAdmin.auth.admin.listUsers()
  if (authErr) {
    errors.push(`auth.users: ${authErr.message}`)
  } else {
    results.push('auth.users ✓ (Supabase Auth working)')
  }

  return NextResponse.json({
    success: errors.length === 0,
    results,
    errors,
    schema_sql: errors.length > 0 ? 'Tables missing - run supabase/schema.sql in Supabase dashboard' : undefined
  })
}
