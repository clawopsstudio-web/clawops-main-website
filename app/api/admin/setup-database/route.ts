/**
 * Fix VPS data - temporary
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
    // Check if VPS exists
    const { data: existingVps } = await supabase
      .from('vps_instances')
      .select('id')
      .eq('user_id', ADMIN_USER_ID)
      .single()
    
    if (existingVps) {
      // Update
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
      // Insert with a random ID since user_id isn't the primary key
      await supabase
        .from('vps_instances')
        .insert({
          user_id: ADMIN_USER_ID,
          instance_id: 'vps-hermes-test',
          name: 'Hermes Test VPS',
          tunnel_url: 'https://hermes.clawops.studio',
          vps_ip: '178.238.232.52',
          status: 'online',
          agent_count: 3,
        })
    }

    // Verify
    const { data: vps } = await supabase
      .from('vps_instances')
      .select('*')
      .eq('user_id', ADMIN_USER_ID)
      .single()
      
    const { data: agents } = await supabase.from('vps_agents').select('*').eq('user_id', ADMIN_USER_ID)
    const { data: tools } = await supabase.from('user_tools').select('*').eq('user_id', ADMIN_USER_ID)

    return NextResponse.json({
      success: true,
      vps,
      agents: agents?.length || 0,
      tools: tools?.length || 0,
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
