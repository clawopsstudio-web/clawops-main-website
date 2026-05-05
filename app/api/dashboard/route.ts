import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Hermes client (minimal inline to avoid circular deps)
class DashboardHermesClient {
  constructor(private baseUrl: string, private token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  async getSessionToken(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/`)
    const html = await response.text()
    const match = html.match(/window\.__HERMES_SESSION_TOKEN__="([^"]+)"/)
    if (!match) throw new Error('Could not extract session token')
    return match[1]
  }

  async getStatus(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/status`, {
      headers: { 'X-Session-Token': this.token },
    })
    if (!response.ok) throw new Error(`Hermes status failed: ${response.status}`)
    return response.json()
  }

  async getSessions(limit = 5): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/sessions?limit=${limit}`, {
        headers: { 'X-Session-Token': this.token },
      })
      if (!response.ok) return []
      return response.json()
    } catch {
      return []
    }
  }
}

function getSupabaseAdmin() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    // Fetch core data in parallel
    const [profileResult, instancesResult, agentsResult, toolsResult, workspacesResult] =
      await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('vps_instances').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('vps_agents').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('user_tools').select('*').eq('user_id', userId).eq('status', 'connected'),
        supabase.from('workspaces').select('id').eq('user_id', userId).limit(1),
      ])

    const profile = profileResult.data
    const instances = instancesResult.data || []
    const agents = agentsResult.data || []
    const tools = toolsResult.data || []

    // Hermes status — one instance at a time, first VPS with a hermes_url
    let hermesStatus: any = null
    let hermesOnline = false
    const instanceWithHermes = instances.find(i => i.hermes_url)

    if (instanceWithHermes?.hermes_url) {
      try {
        const hermesUrl = instanceWithHermes.hermes_url
        const hermes = new DashboardHermesClient(hermesUrl, '')
        let token = instanceWithHermes.hermes_token || ''
        if (!token) {
          token = await hermes.getSessionToken()
        }
        const status = await hermes.getStatus()
        hermesStatus = status
        hermesOnline = status?.gateway_running === true && status?.gateway_state === 'running'

        // Update VPS status in DB
        await supabase
          .from('vps_instances')
          .update({ status: hermesOnline ? 'online' : 'offline', last_heartbeat: new Date().toISOString() })
          .eq('id', instanceWithHermes.id)
      } catch (err: any) {
        console.warn('[dashboard] Hermes status error:', err.message)
        // Mark offline
        if (instanceWithHermes) {
          await supabase
            .from('vps_instances')
            .update({ status: 'offline', health_error: err.message })
            .eq('id', instanceWithHermes.id)
        }
      }
    }

    // Fetch recent Hermes sessions if Hermes is online
    let recentActivity: any[] = []
    if (hermesOnline && instanceWithHermes?.hermes_url) {
      try {
        const hermes = new DashboardHermesClient(instanceWithHermes.hermes_url, '')
        let token = instanceWithHermes.hermes_token || ''
        if (!token) {
          token = await hermes.getSessionToken()
        }
        recentActivity = await hermes.getSessions(5)
      } catch {
        // Silently skip session fetch
      }
    }

    // Fetch mission logs if available (gracefully)
    let missions: any[] = []
    try {
      const { data: mData } = await supabase
        .from('mission_logs')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(10)
      missions = mData || []
    } catch {
      // Table may not exist
    }

    return NextResponse.json({
      profile,
      instances,
      agents,
      tools,
      hermesStatus,
      hermesOnline,
      recentActivity,
      missions,
      stats: {
        activeAgents: agents.filter((a: any) => a.status === 'active').length,
        connectedTools: tools.length,
        totalInstances: instances.length,
        onlineInstances: instances.filter((i: any) => i.status === 'online').length,
        completedMissions: missions.filter((m: any) => m.status === 'completed').length,
        runningMissions: missions.filter((m: any) => m.status === 'running').length,
      },
    })
  } catch (error: any) {
    console.error('[dashboard] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
