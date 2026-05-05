/**
 * app/api/hermes/status/route.ts
 * Get Hermes status for a workspace
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyWorkspaceAccess } from '@/lib/auth-server';
import { createServerClient } from '@/lib/supabase/server';
import { HermesClient } from '@/lib/hermes';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { userId } = authResult;
  const workspaceId = request.nextUrl.searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json(
      { error: 'workspaceId is required' },
      { status: 400 }
    );
  }

  // Verify workspace access
  const hasAccess = await verifyWorkspaceAccess(userId, workspaceId);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const supabase = createServerClient();

  // Get VPS instance for workspace
  const { data: vps, error } = await supabase
    .from('vps_instances')
    .select('hermes_url, hermes_token')
    .eq('workspace_id', workspaceId)
    .limit(1)
    .single();

  if (error || !vps) {
    return NextResponse.json(
      { error: 'No VPS connected to workspace' },
      { status: 404 }
    );
  }

  try {
    // Create Hermes client
    let token = vps.hermes_token;
    
    // If no token, try to get from dashboard
    if (!token) {
      const tempClient = new HermesClient(vps.hermes_url, '');
      token = await tempClient.getSessionToken();
    }

    const client = new HermesClient(vps.hermes_url, token);
    const status = await client.getStatus();

    // Update last heartbeat
    await supabase
      .from('vps_instances')
      .update({
        status: 'online',
        last_heartbeat: new Date().toISOString(),
      })
      .eq('id', vps.id);

    return NextResponse.json({ status });
  } catch (error) {
    // Update status to offline
    await supabase
      .from('vps_instances')
      .update({
        status: 'offline',
        health_error: error instanceof Error ? error.message : 'Unknown error',
      })
      .eq('id', vps.id);

    return NextResponse.json(
      { error: 'Failed to connect to Hermes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    );
  }
}
