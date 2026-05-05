/**
 * app/api/workspace/[id]/vps/route.ts
 * Connect/manage VPS instance for workspace
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
    const { hermes_url, hermes_token, name, region, vps_ip } = body;

    // Validate required fields
    if (!hermes_url || !name) {
      return NextResponse.json(
        { error: 'hermes_url and name are required' },
        { status: 400 }
      );
    }

    // Build full URL if only IP provided
    let fullUrl = hermes_url;
    if (!hermes_url.startsWith('http')) {
      fullUrl = `http://${hermes_url}:9119`;
    }

    // Check if VPS is reachable
    const health = await checkVPSHealth(fullUrl, hermes_token);

    const supabase = createServerClient();

    // Create VPS instance
    const { data: vps, error } = await supabase
      .from('vps_instances')
      .insert({
        workspace_id: workspaceId,
        name: name.trim(),
        hermes_url: fullUrl,
        hermes_token: hermes_token || null,
        vps_ip: vps_ip || null,
        region: region || null,
        status: health.online ? 'online' : 'offline',
        last_heartbeat: health.online ? new Date().toISOString() : null,
        health_error: health.error || null,
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

    return NextResponse.json({ vps, health }, { status: 201 });
  } catch (error) {
    console.error('Connect VPS error:', error);
    return NextResponse.json(
      { error: 'Failed to connect VPS' },
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

  const { data: vpsInstances, error } = await supabase
    .from('vps_instances')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ vps_instances: vpsInstances });
}

export async function PUT(
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
    const { vps_id, action } = body;

    if (!vps_id) {
      return NextResponse.json(
        { error: 'vps_id is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verify VPS belongs to workspace
    const { data: existingVps } = await supabase
      .from('vps_instances')
      .select('id')
      .eq('id', vps_id)
      .eq('workspace_id', workspaceId)
      .single();

    if (!existingVps) {
      return NextResponse.json({ error: 'VPS not found' }, { status: 404 });
    }

    if (action === 'health_check') {
      // Perform health check
      const { data: vps } = await supabase
        .from('vps_instances')
        .select('hermes_url, hermes_token')
        .eq('id', vps_id)
        .single();

      if (vps) {
        const health = await checkVPSHealth(vps.hermes_url, vps.hermes_token);
        
        await supabase
          .from('vps_instances')
          .update({
            status: health.online ? 'online' : 'offline',
            last_health_check: new Date().toISOString(),
            health_error: health.error,
            last_heartbeat: health.online ? new Date().toISOString() : null,
          })
          .eq('id', vps_id);

        return NextResponse.json({ health });
      }
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
