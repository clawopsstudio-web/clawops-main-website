/**
 * app/api/workspace/[id]/connect/route.ts
 * Guided workspace connection flow
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyWorkspaceAccess } from '@/lib/auth-server';
import { createServerClient } from '@/lib/supabase/server';
import { checkVPSHealth, HermesClient } from '@/lib/hermes';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { userId } = authResult;
  const { id: workspaceId } = await params;

  // Verify workspace access
  const hasAccess = await verifyWorkspaceAccess(userId, workspaceId);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { step, hermes_url, hermes_token, agent_name, agent_role } = body;

    const supabase = createServerClient();

    switch (step) {
      case 1: {
        // Step 1: Just acknowledge workspace is ready
        return NextResponse.json({ 
          success: true, 
          message: 'Workspace created. Proceed to step 2 to connect VPS.' 
        });
      }

      case 2: {
        // Step 2: Connect VPS
        if (!hermes_url) {
          return NextResponse.json(
            { error: 'hermes_url is required' },
            { status: 400 }
          );
        }

        // Build full URL
        let fullUrl = hermes_url;
        if (!hermes_url.startsWith('http')) {
          fullUrl = `http://${hermes_url}:9119`;
        }

        // Try to get token from URL if not provided
        let token = hermes_token;
        if (!token) {
          try {
            const tempClient = new HermesClient(fullUrl, '');
            token = await tempClient.getSessionToken();
          } catch (e) {
            // Continue without token
          }
        }

        // Check health
        const health = await checkVPSHealth(fullUrl, token);

        // Create VPS instance
        const { data: vps, error } = await supabase
          .from('vps_instances')
          .insert({
            workspace_id: workspaceId,
            name: 'Main VPS',
            hermes_url: fullUrl,
            hermes_token: token,
            status: health.online ? 'online' : 'offline',
            last_heartbeat: health.online ? new Date().toISOString() : null,
            health_error: health.error,
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Update workspace with default VPS
        await supabase
          .from('workspaces')
          .update({ default_vps_id: vps.id })
          .eq('id', workspaceId);

        return NextResponse.json({ 
          success: true, 
          vps,
          health,
          message: 'VPS connected. Proceed to step 3 to create your first agent.'
        });
      }

      case 3: {
        // Step 3: Create first agent
        if (!agent_name || !agent_role) {
          return NextResponse.json(
            { error: 'agent_name and agent_role are required' },
            { status: 400 }
          );
        }

        // Create agent
        const { data: agent, error } = await supabase
          .from('workspace_agents')
          .insert({
            workspace_id: workspaceId,
            name: agent_name,
            role: agent_role,
            status: 'active',
            profile: agent_name.toLowerCase().replace(/\s+/g, '-'),
          })
          .select()
          .single();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Mark onboarding complete
        await supabase
          .from('profiles')
          .update({ onboarding_complete: true })
          .eq('id', userId);

        return NextResponse.json({ 
          success: true, 
          agent,
          message: 'Agent created! Your workspace is ready.'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid step' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Connect error:', error);
    return NextResponse.json(
      { error: 'Connection failed' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { userId } = authResult;
  const { id: workspaceId } = await params;

  // Verify workspace access
  const hasAccess = await verifyWorkspaceAccess(userId, workspaceId);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const supabase = createServerClient();

  // Get workspace with related data
  const { data: workspace } = await supabase
    .from('workspaces')
    .select(`
      *,
      vps_instances (*),
      workspace_agents (*)
    `)
    .eq('id', workspaceId)
    .single();

  if (!workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  // Determine current step
  let step = 1;
  if (workspace.vps_instances && workspace.vps_instances.length > 0) {
    step = 3;
  }
  if (workspace.workspace_agents && workspace.workspace_agents.length > 0) {
    step = 4; // Complete
  }

  return NextResponse.json({
    workspace,
    step,
    has_vps: workspace.vps_instances && workspace.vps_instances.length > 0,
    has_agents: workspace.workspace_agents && workspace.workspace_agents.length > 0,
  });
}
