/**
 * app/api/tools/connections/route.ts
 * API for tool connections — uses Supabase service role to bypass RLS
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createServerClient, createServerClientWithAuth } from '@/lib/supabase/server'

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) throw new Error('Missing Supabase env vars')
  return createAdminClient(supabaseUrl, serviceKey)
}

export async function GET(_req: NextRequest) {
  const supabase = await createServerClientWithAuth()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from('user_connections')
      .select('*')
      .eq('clerk_user_id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ connections: data ?? [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createServerClientWithAuth()
  if (!supabase) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { app_name, connected, connected_account_id, connected_at } = body

  if (!app_name) return NextResponse.json({ error: 'app_name required' }, { status: 400 })

  try {
    const admin = getAdminClient()
    const { data, error } = await admin
      .from('user_connections')
      .upsert({
        clerk_user_id: user.id,
        app_name: String(app_name).toUpperCase(),
        connected: connected ?? false,
        connected_account_id: connected_account_id ?? null,
        connected_at: connected_at ?? null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'clerk_user_id,app_name',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ connection: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
