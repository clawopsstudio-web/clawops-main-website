/**
 * app/api/agents/[id]/route.ts
 * GET  /api/agents/[id] - Get agent details
 * PUT  /api/agents/[id] - Update agent
 * DELETE /api/agents/[id] - Remove agent
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { createServerClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;
  const { id } = await params;

  const supabase = createServerClient();

  // Get agent and verify workspace ownership
  const { data: agent, error } = await supabase
    .from('workspace_agents')
    .select(`
      *,
      agent_tools(
        id,
        enabled,
        config,
        tools(
          id,
          name,
          display_name,
          icon,
          category,
          description
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error || !agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Verify workspace ownership
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', agent.workspace_id)
    .eq('user_id', userId)
    .single();

  if (!workspace) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Format tools
  const formattedAgent = {
    ...agent,
    tools: (agent.agent_tools || [])
      .filter((at: any) => at.enabled)
      .map((at: any) => ({ ...at.tools, config: at.config })),
    agent_tools: undefined,
  };

  return NextResponse.json({ agent: formattedAgent });
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;
  const { id } = await params;

  try {
    const body = await request.json();
    const { name, role, model, profile, systemPrompt, description, color, status, toolIds } = body;

    const supabase = createServerClient();

    // Get agent and verify workspace ownership
    const { data: existingAgent, error: fetchError } = await supabase
      .from('workspace_agents')
      .select('workspace_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingAgent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Verify workspace ownership
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('id')
      .eq('id', existingAgent.workspace_id)
      .eq('user_id', userId)
      .single();

    if (!workspace) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Build update payload
    const updates: Record<string, any> = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (model !== undefined) updates.model = model;
    if (profile !== undefined) updates.profile = profile;
    if (systemPrompt !== undefined) updates.system_prompt = systemPrompt;
    if (description !== undefined) updates.description = description;
    if (color !== undefined) updates.color = color;
    if (status !== undefined) updates.status = status;

    // Update agent
    const { data: agent, error } = await supabase
      .from('workspace_agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update tools if provided
    if (toolIds !== undefined && Array.isArray(toolIds)) {
      // Remove existing tool links
      await supabase
        .from('agent_tools')
        .delete()
        .eq('agent_id', id);

      // Add new tool links
      if (toolIds.length > 0) {
        const agentToolLinks = toolIds.map((toolId: string) => ({
          agent_id: id,
          tool_id: toolId,
          enabled: true,
        }));

        await supabase
          .from('agent_tools')
          .insert(agentToolLinks);
      }
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_workspace_id: existingAgent.workspace_id,
      p_agent_id: id,
      p_type: 'agent_action',
      p_message: `Updated agent: ${agent.name}`,
      p_metadata: { action: 'updated', changes: Object.keys(body) },
    });

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Update agent error:', error);
    return NextResponse.json(
      { error: 'Failed to update agent', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  const { userId } = authResult;
  const { id } = await params;

  const supabase = createServerClient();

  // Get agent and verify workspace ownership
  const { data: agent, error: fetchError } = await supabase
    .from('workspace_agents')
    .select('workspace_id, name')
    .eq('id', id)
    .single();

  if (fetchError || !agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  // Verify workspace ownership
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('id')
    .eq('id', agent.workspace_id)
    .eq('user_id', userId)
    .single();

  if (!workspace) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Delete agent (agent_tools will cascade)
  const { error } = await supabase
    .from('workspace_agents')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log activity
  await supabase.rpc('log_activity', {
    p_workspace_id: agent.workspace_id,
    p_type: 'agent_action',
    p_message: `Deleted agent: ${agent.name}`,
    p_metadata: { action: 'deleted', agentId: id },
  });

  return NextResponse.json({ success: true });
}
