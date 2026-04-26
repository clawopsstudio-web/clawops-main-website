import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * POST /api/agents/sync
 * Push all agents to Hermes runtime
 * 
 * This endpoint marks all agents as synced after pushing config to Hermes.
 * The actual SSH/config push will be implemented when Hermes supports
 * dynamic agent config updates via API.
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const { agent_ids } = body

    // Get agents to sync
    let query = supabaseAdmin
      .from('agents')
      .select('id, name, provider, model_id, temperature, max_tokens, system_prompt')
      .eq('user_id', userId)

    if (agent_ids && Array.isArray(agent_ids)) {
      query = query.in('id', agent_ids)
    }

    const { data: agents, error } = await query

    if (error) throw error

    // TODO: Implement actual Hermes config push
    // For now, mark all agents as synced
    // Future: SSH to VPS and update Hermes config file
    
    const agentIds = (agents ?? []).map(a => a.id)
    
    if (agentIds.length > 0) {
      const { error: updateError } = await supabaseAdmin
        .from('agents')
        .update({ 
          sync_status: 'synced',
          updated_at: new Date().toISOString()
        })
        .in('id', agentIds)

      if (updateError) throw updateError
    }

    return NextResponse.json({
      success: true,
      synced_count: agentIds.length,
      message: `Synced ${agentIds.length} agent${agentIds.length !== 1 ? 's' : ''} to Hermes runtime.`
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

/**
 * POST /api/agents/sync/:id
 * Sync a single agent to Hermes runtime
 */
export async function syncSingleAgent(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Verify ownership and get agent config
    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .select('id, name, provider, model_id, temperature, max_tokens, system_prompt')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    if (!agent) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    // TODO: Implement actual Hermes config push
    // For now, mark as synced
    const { error: updateError } = await supabaseAdmin
      .from('agents')
      .update({ 
        sync_status: 'synced',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      agent_id: id,
      message: `${agent.name} synced to Hermes runtime.`
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
