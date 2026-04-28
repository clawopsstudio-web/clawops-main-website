/**
 * Temporary API route to setup database tables and seed data
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
    // 1. Create vps_agents table
    const { error: agentsError } = await supabase.rpc('exec', {
      sql: `
        DROP TABLE IF EXISTS public.vps_agents;
        CREATE TABLE public.vps_agents (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
          vps_id uuid,
          hermes_agent_id text NOT NULL,
          agent_name text NOT NULL,
          agent_role text,
          status text DEFAULT 'active',
          tools jsonb DEFAULT '[]',
          webhook_url text,
          last_seen timestamptz,
          created_at timestamptz DEFAULT now()
        );
        ALTER TABLE public.vps_agents ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can manage own agents" ON public.vps_agents;
        CREATE POLICY "Users can manage own agents" ON public.vps_agents FOR ALL USING (auth.uid() = user_id);
      `
    })
    
    if (agentsError) {
      console.error('[setup] vps_agents error:', agentsError)
    }

    // 2. Create user_tools table
    const { error: toolsError } = await supabase.rpc('exec', {
      sql: `
        DROP TABLE IF EXISTS public.user_tools;
        CREATE TABLE public.user_tools (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
          tool_name text NOT NULL,
          tool_slug text NOT NULL,
          status text DEFAULT 'connected',
          connected_at timestamptz DEFAULT now()
        );
        ALTER TABLE public.user_tools ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can manage own tools" ON public.user_tools;
        CREATE POLICY "Users can manage own tools" ON public.user_tools FOR ALL USING (auth.uid() = user_id);
      `
    })
    
    if (toolsError) {
      console.error('[setup] user_tools error:', toolsError)
    }

    // 3. Insert/update VPS
    const { error: vpsError } = await supabase
      .from('vps_instances')
      .upsert({
        id: ADMIN_USER_ID,
        user_id: ADMIN_USER_ID,
        instance_id: 'vps-hermes-test',
        name: 'Hermes Test VPS',
        tunnel_url: 'https://hermes.clawops.studio',
        vps_ip: '178.238.232.52',
        status: 'online',
        agent_count: 3,
      }, {
        onConflict: 'user_id'
      })

    // 4. Insert agents
    const { error: agentsInsertError } = await supabase
      .from('vps_agents')
      .upsert([
        { user_id: ADMIN_USER_ID, vps_id: ADMIN_USER_ID, hermes_agent_id: 'agent-ryan', agent_name: 'Ryan', agent_role: 'Sales Agent', status: 'active', tools: ['gmail', 'hubspot', 'linkedin'] },
        { user_id: ADMIN_USER_ID, vps_id: ADMIN_USER_ID, hermes_agent_id: 'agent-arjun', agent_name: 'Arjun', agent_role: 'Research Agent', status: 'active', tools: ['google-search', 'firecrawl', 'notion'] },
        { user_id: ADMIN_USER_ID, vps_id: ADMIN_USER_ID, hermes_agent_id: 'agent-tyler', agent_name: 'Tyler', agent_role: 'Marketing Agent', status: 'active', tools: ['twitter', 'youtube', 'analytics'] },
      ])

    // 5. Insert tools
    const { error: toolsInsertError } = await supabase
      .from('user_tools')
      .upsert([
        { user_id: ADMIN_USER_ID, tool_name: 'Gmail', tool_slug: 'gmail', status: 'connected' },
        { user_id: ADMIN_USER_ID, tool_name: 'Telegram', tool_slug: 'telegram', status: 'connected' },
        { user_id: ADMIN_USER_ID, tool_name: 'Notion', tool_slug: 'notion', status: 'connected' },
      ])

    return NextResponse.json({
      success: true,
      message: 'Database setup complete',
      errors: {
        agentsTable: agentsError?.message,
        toolsTable: toolsError?.message,
        vps: vpsError?.message,
        agentsInsert: agentsInsertError?.message,
        toolsInsert: toolsInsertError?.message,
      }
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
