/**
 * app/api/workspace/[id]/route.ts
 * Single workspace operations
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyWorkspaceAccess } from '@/lib/auth-server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { userId } = authResult;
  const { id } = await params;

  // Verify workspace access
  const hasAccess = await verifyWorkspaceAccess(userId, id);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const supabase = createServerClient();

  // Get workspace with VPS and agents
  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select(`
      *,
      vps_instances (*),
      workspace_agents (*)
    `)
    .eq('id', id)
    .single();

  if (error || !workspace) {
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
  }

  return NextResponse.json({ workspace });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { userId } = authResult;
  const { id } = await params;

  // Verify workspace access
  const hasAccess = await verifyWorkspaceAccess(userId, id);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, logo_url } = body;

    const updates: { name?: string; logo_url?: string } = {};
    if (name) updates.name = name.trim();
    if (logo_url !== undefined) updates.logo_url = logo_url;

    const supabase = createServerClient();
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workspace });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { userId } = authResult;
  const { id } = await params;

  // Verify workspace access
  const hasAccess = await verifyWorkspaceAccess(userId, id);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
