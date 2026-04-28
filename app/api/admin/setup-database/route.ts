/**
 * Fix all database tables
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
    // 1. Create mission_logs table
    const { error: logsError } = await supabase.rpc('pg', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.mission_logs (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
          agent_id text,
          mission_type text,
          status text DEFAULT 'pending',
          input_data jsonb DEFAULT '{}',
          output_data jsonb DEFAULT '{}',
          error text,
          started_at timestamptz DEFAULT now(),
          completed_at timestamptz,
          created_at timestamptz DEFAULT now()
        );
        ALTER TABLE public.mission_logs ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can view own logs" ON public.mission_logs;
        CREATE POLICY "Users can view own logs" ON public.mission_logs FOR SELECT USING (auth.uid() = user_id);
        DROP POLICY IF EXISTS "Users can insert logs" ON public.mission_logs;
        CREATE POLICY "Users can insert logs" ON public.mission_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
      `
    })

    // 2. Create agent_instances table as alias for vps_agents
    const { error: agentError } = await supabase.rpc('pg', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.agent_instances (
          id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
          vps_id uuid,
          hermes_agent_id text NOT NULL,
          agent_name text NOT NULL,
          agent_role text,
          status text DEFAULT 'active',
          tools jsonb DEFAULT '[]',
          config jsonb DEFAULT '{}',
          webhook_url text,
          last_seen timestamptz,
          created_at timestamptz DEFAULT now()
        );
        ALTER TABLE public.agent_instances ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users manage own instances" ON public.agent_instances;
        CREATE POLICY "Users manage own instances" ON public.agent_instances FOR ALL USING (auth.uid() = user_id);
      `
    })

    // 3. Seed agent_instances with data from vps_agents
    const { data: vpsAgents } = await supabase.from('vps_agents').select('*').eq('user_id', ADMIN_USER_ID)
    
    if (vpsAgents && vpsAgents.length > 0) {
      const instances = vpsAgents.map(a => ({
        user_id: a.user_id,
        vps_id: a.vps_id,
        hermes_agent_id: a.hermes_agent_id,
        agent_name: a.agent_name,
        agent_role: a.agent_role,
        status: a.status,
        tools: a.tools,
        config: {},
      }))
      
      await supabase.from('agent_instances').delete().eq('user_id', ADMIN_USER_ID)
      await supabase.from('agent_instances').insert(instances)
    }

    // 4. Seed some mission logs
    await supabase.from('mission_logs').insert([
      { user_id: ADMIN_USER_ID, agent_id: 'agent-ryan', mission_type: 'Send follow-up emails', status: 'completed', started_at: new Date(Date.now() - 3600000).toISOString(), completed_at: new Date(Date.now() - 3500000).toISOString() },
      { user_id: ADMIN_USER_ID, agent_id: 'agent-arjun', mission_type: 'Research competitor pricing', status: 'completed', started_at: new Date(Date.now() - 7200000).toISOString(), completed_at: new Date(Date.now() - 7000000).toISOString() },
      { user_id: ADMIN_USER_ID, agent_id: 'agent-tyler', mission_type: 'Generate social media posts', status: 'running', started_at: new Date(Date.now() - 1800000).toISOString() },
    ])

    // 5. Verify
    const { data: agents } = await supabase.from('vps_agents').select('*').eq('user_id', ADMIN_USER_ID)
    const { data: instances } = await supabase.from('agent_instances').select('*').eq('user_id', ADMIN_USER_ID)
    const { data: logs } = await supabase.from('mission_logs').select('*').eq('user_id', ADMIN_USER_ID)
    const { data: tools } = await supabase.from('user_tools').select('*').eq('user_id', ADMIN_USER_ID)
    const { data: vps } = await supabase.from('vps_instances').select('*').eq('user_id', ADMIN_USER_ID).single()

    return NextResponse.json({
      success: true,
      vps: vps ? { name: vps.name, status: vps.status } : null,
      vps_agents: agents?.length || 0,
      agent_instances: instances?.length || 0,
      mission_logs: logs?.length || 0,
      user_tools: tools?.length || 0,
      errors: {
        logsTable: logsError?.message,
        agentTable: agentError?.message,
      }
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
