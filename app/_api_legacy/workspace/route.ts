/**
 * app/api/workspace/route.ts
 * Workspace CRUD operations
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, createSlug, getUserWorkspace } from '@/lib/auth-server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { userId } = authResult;
  const supabase = createServerClient();

  const { data: workspaces, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ workspaces });
}

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { userId } = authResult;

  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = createSlug(name);
    
    // Check if slug exists and make it unique if needed
    const supabase = createServerClient();
    const { data: existing } = await supabase
      .from('workspaces')
      .select('slug')
      .like('slug', `${slug}%`);

    if (existing && existing.length > 0) {
      slug = `${slug}-${existing.length + 1}`;
    }

    // Create workspace
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .insert({
        user_id: userId,
        name: name.trim(),
        slug,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error) {
    console.error('Create workspace error:', error);
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
