/**
 * app/api/channels/route.ts
 * CRUD endpoints for /api/channels
 * Auth: Supabase session
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// Helper: verify user owns the project
async function verifyProjectAccess(projectId: string, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('projects')
    .select('user_id')
    .eq('id', projectId)
    .single()
  return data?.user_id === userId
}

// GET /api/channels?project_id=xxx
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const projectId = searchParams.get('project_id')

    if (!projectId) return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
    if (!(await verifyProjectAccess(projectId, userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabaseAdmin
      .from('channels')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return NextResponse.json({ channels: data ?? [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/channels
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { project_id, name, description, icon } = body

    if (!project_id) return NextResponse.json({ error: 'project_id is required' }, { status: 400 })
    if (!name?.trim()) return NextResponse.json({ error: 'Channel name is required' }, { status: 400 })
    if (!(await verifyProjectAccess(project_id, userId))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get next sort_order
    const { count } = await supabaseAdmin
      .from('channels')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', project_id)

    const channel = {
      project_id,
      name: name.trim().toLowerCase().replace(/\s+/g, '-'),
      description: description?.trim() ?? '',
      icon: icon ?? '#',
      sort_order: (count ?? 0),
      is_private: body.is_private ?? false,
    }

    const { data, error } = await supabaseAdmin
      .from('channels')
      .insert(channel)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ channel: data }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/channels — update channel or reorder
export async function PATCH(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { id, name, description, icon, sort_order, is_private } = body

    if (!id) return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 })

    // Get channel + verify access
    const { data: channel } = await supabaseAdmin
      .from('channels')
      .select('project_id')
      .eq('id', id)
      .single()

    if (!channel || !(await verifyProjectAccess(channel.project_id, userId))) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (name !== undefined) updates.name = name.trim().toLowerCase().replace(/\s+/g, '-')
    if (description !== undefined) updates.description = description.trim()
    if (icon !== undefined) updates.icon = icon
    if (sort_order !== undefined) updates.sort_order = sort_order
    if (is_private !== undefined) updates.is_private = is_private

    const { data, error } = await supabaseAdmin
      .from('channels')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ channel: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/channels?id=xxx
export async function DELETE(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 })

    const { data: channel } = await supabaseAdmin
      .from('channels')
      .select('project_id')
      .eq('id', id)
      .single()

    if (!channel || !(await verifyProjectAccess(channel.project_id, userId))) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }

    const { error } = await supabaseAdmin.from('channels').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
