import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Register or update a VPS instance for a user
export async function POST(request: Request) {
  try {
    // Clerk auth — user must be signed in
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { tunnel_url, vps_name, vps_ip, specs } = await request.json()

    if (!tunnel_url || !vps_name) {
      return NextResponse.json({ error: 'tunnel_url and vps_name are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('vps_instances')
      .upsert({
        user_id: userId,
        name: vps_name,
        tunnel_url,
        vps_ip: vps_ip || null,
        specs: specs || {},
        status: 'online',
        last_heartbeat: new Date().toISOString(),
      }, {
        onConflict: 'user_id,tunnel_url',
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ registered: true, vps_id: data.id, vps_name, tunnel_url })

  } catch (err) {
    console.error('[vps/register] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get all VPS instances for the authenticated user
export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabase
      .from('vps_instances')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ instances: data || [] })

  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
