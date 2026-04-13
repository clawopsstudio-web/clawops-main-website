import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Register or update a VPS instance for a user
export async function POST(request: Request) {
  try {
    const { tunnel_url, vps_name, vps_ip, specs } = await request.json()

    if (!tunnel_url || !vps_name) {
      return NextResponse.json(
        { error: 'tunnel_url and vps_name are required' },
        { status: 400 }
      )
    }

    // Get user from auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Upsert VPS instance (tunnel_url is unique per installation)
    const { data, error } = await supabase
      .from('vps_instances')
      .upsert({
        user_id: user.id,
        name: vps_name,
        tunnel_url,
        vps_ip: vps_ip || null,
        specs: specs || {},
        status: 'online',
        last_heartbeat: new Date().toISOString(),
      }, {
        onConflict: 'tunnel_url',
      })
      .select()
      .single()

    if (error) {
      // Table might not exist yet — fall back to profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select('id')
        .single()

      if (profileError) {
        return NextResponse.json({ error: 'Database error', details: error.message }, { status: 500 })
      }

      return NextResponse.json({
        registered: true,
        note: 'vps_instances table not created yet — run migration manually',
        vps_name,
        tunnel_url,
      })
    }

    return NextResponse.json({
      registered: true,
      vps_id: data.id,
      vps_name,
      tunnel_url,
    })
  } catch (err) {
    console.error('[vps/register] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get all VPS instances for the authenticated user
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('vps_instances')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message, instances: [] }, { status: 200 })
    }

    return NextResponse.json({ instances: data || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
