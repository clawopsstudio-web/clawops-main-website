import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Heartbeat — VPS calls this every 30 seconds to update its status
export async function POST(request: Request) {
  try {
    const { tunnel_url, status, openclaw_version, agent_count, specs, system } = await request.json()

    if (!tunnel_url) {
      return NextResponse.json({ error: 'tunnel_url required' }, { status: 400 })
    }

    // Update the VPS instance by tunnel_url
    const { data, error } = await supabase
      .from('vps_instances')
      .update({
        status: status || 'online',
        last_heartbeat: new Date().toISOString(),
        openclaw_version: openclaw_version || null,
        agent_count: agent_count || 0,
        specs: specs || {},
        updated_at: new Date().toISOString(),
      })
      .eq('tunnel_url', tunnel_url)
      .select('id, status')
      .single()

    if (error) {
      return NextResponse.json({
        ok: false,
        error: error.message,
        note: 'vps_instances table may not exist'
      }, { status: 200 }) // Return 200 so VPS doesn't stop sending
    }

    return NextResponse.json({ ok: true, vps_id: data.id, status: data.status })
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 200 })
  }
}
