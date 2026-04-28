/**
 * Temporary API route to seed data (tables already exist)
 * DELETE AFTER USE
 */
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

export async function POST() {
  try {
    // 1. Check VPS
    const { data: existingVps } = await supabase
      .from('vps_instances')
      .select('*')
      .eq('user_id', ADMIN_USER_ID)
      .single()
    
    if (existingVps) {
      // Update existing VPS
      await supabase
        .from('vps_instances')
        .update({
          name: 'Hermes Test VPS',
          tunnel_url: 'https://hermes.clawops.studio',
          vps_ip: '178.238.232.52',
          status: 'online',
          agent_count: 3,
        })
        .eq('user_id', ADMIN_USER_ID)
    } else {
      // Insert new VPS
      await supabase
        .from('vps_instances')
        .insert({
          id: ADMIN_USER_ID,
          user_id: ADMIN_USER_ID,
          instance_id: 'vps-hermes-test',
          name: 'Hermes Test VPS',
          tunnel_url: 'https://hermes.clawops.studio',
          vps_ip: '178.238.232.52',
          status: 'online',
          agent_count: 3,
        })
    }

    // 2. Delete old agents and insert new
    await supabase.from('vps_agents').delete().eq('user_id', ADMIN_USER_ID)
    
    const { error: agentsError } = await supabase
      .from('vps_agents')
      .insert([
        { user_id: ADMIN_USER_ID, vps_id: ADMIN_USER_ID, hermes_agent_id: 'agent-ryan', agent_name: 'Ryan', agent_role: 'Sales Agent', status: 'active', tools: ['gmail', 'hubspot', 'linkedin'] },
        { user_id: ADMIN_USER_ID, vps_id: ADMIN_USER_ID, hermes_agent_id: 'agent-arjun', agent_name: 'Arjun', agent_role: 'Research Agent', status: 'active', tools: ['google-search', 'firecrawl', 'notion'] },
        { user_id: ADMIN_USER_ID, vps_id: ADMIN_USER_ID, hermes_agent_id: 'agent-tyler', agent_name: 'Tyler', agent_role: 'Marketing Agent', status: 'active', tools: ['twitter', 'youtube', 'analytics'] },
      ])

    // 3. Delete old tools and insert new
    await supabase.from('user_tools').delete().eq('user_id', ADMIN_USER_ID)
    
    const { error: toolsError } = await supabase
      .from('user_tools')
      .insert([
        { user_id: ADMIN_USER_ID, tool_name: 'Gmail', tool_slug: 'gmail', status: 'connected' },
        { user_id: ADMIN_USER_ID, tool_name: 'Telegram', tool_slug: 'telegram', status: 'connected' },
        { user_id: ADMIN_USER_ID, tool_name: 'Notion', tool_slug: 'notion', status: 'connected' },
      ])

    // 4. Verify
    const { data: agents } = await supabase.from('vps_agents').select('*').eq('user_id', ADMIN_USER_ID)
    const { data: tools } = await supabase.from('user_tools').select('*').eq('user_id', ADMIN_USER_ID)

    return NextResponse.json({
      success: true,
      message: 'Database seeded!',
      agents: agents?.length || 0,
      tools: tools?.length || 0,
      errors: {
        agents: agentsError?.message,
        tools: toolsError?.message,
      }
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
