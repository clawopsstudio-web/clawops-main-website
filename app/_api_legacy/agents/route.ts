/**
 * app/api/agents/route.ts
 * GET  /api/agents?workspaceId=xxx - List workspace agents
 * POST /api/agents                  - Create new agent for workspace
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyWorkspaceAccess } from '@/lib/auth-server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  const workspaceId = request.nextUrl.searchParams.get('workspaceId');
  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required' }, { status: 400 });
  }

  const hasAccess = await verifyWorkspaceAccess(userId, workspaceId);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const supabase = createServerClient();

  // Fetch agents with tools
  const { data: agents, error } = await supabase
    .from('workspace_agents')
    .select(`
      *,
      agent_tools(
        id,
        enabled,
        tools(
          id,
          name,
          display_name,
          icon,
          category
        )
      )
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten agent_tools into tools array for easier frontend use
  const formattedAgents = (agents || []).map((agent: any) => ({
    ...agent,
    tools: (agent.agent_tools || [])
      .filter((at: any) => at.enabled)
      .map((at: any) => at.tools)
      .filter(Boolean),
    agent_tools: undefined, // remove nested join from response
  }));

  return NextResponse.json({ agents: formattedAgents });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;

  try {
    const body = await request.json();
    const { workspaceId, name, role, model, profile, systemPrompt, description, color, toolIds } = body;

    if (!workspaceId || !name || !role) {
      return NextResponse.json(
        { error: 'workspaceId, name, and role are required' },
        { status: 400 }
      );
    }

    const hasAccess = await verifyWorkspaceAccess(userId, workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const supabase = createServerClient();

    // Create the agent
    const { data: agent, error } = await supabase
      .from('workspace_agents')
      .insert({
        workspace_id: workspaceId,
        name,
        role,
        model: model || null,
        profile: profile || 'default',
        system_prompt: systemPrompt || null,
        description: description || null,
        color: color || '#6366f1',
        status: 'inactive',
        tools: [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Link tools if provided
    if (toolIds && Array.isArray(toolIds) && toolIds.length > 0) {
      const agentToolLinks = toolIds.map((toolId: string) => ({
        agent_id: agent.id,
        tool_id: toolId,
        enabled: true,
      }));

      const { error: toolLinkError } = await supabase
        .from('agent_tools')
        .insert(agentToolLinks);

      if (toolLinkError) {
        console.error('Error linking tools:', toolLinkError);
      }
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_workspace_id: workspaceId,
      p_agent_id: agent.id,
      p_type: 'agent_action',
      p_message: `Created agent: ${name}`,
      p_metadata: { action: 'created', role },
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error('Create agent error:', error);
    return NextResponse.json(
      { error: 'Failed to create agent', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
