import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Heartbeat is a server-to-server call from the VPS — use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Heartbeat — VPS calls this every minute to update its status
export async function POST(request: Request) {
  try {
    const { tunnel_url, status, openclaw_version, agent_count, specs } = await request.json()

    if (!tunnel_url) {
      return NextResponse.json({ error: 'tunnel_url required' }, { status: 400 })
    }

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

    if (error || !data) {
      console.error('[heartbeat] error:', error)
      // Return 200 so the VPS keeps retrying even if this VPS isn't in the DB yet
      return NextResponse.json({ ok: false, error: error?.message }, { status: 200 })
    }

    return NextResponse.json({ ok: true, vps_id: data.id, status: data.status })
  } catch (err) {
    console.error('[heartbeat] uncaught:', err)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 200 })
  }
}
