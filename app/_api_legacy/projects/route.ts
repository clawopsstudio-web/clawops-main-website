/**
 * app/api/projects/route.ts
 * CRUD endpoints for /api/projects
 * Auth: Supabase session
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET /api/projects — list all projects for the authenticated user
export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select(`
        *,
        channels:id,count,
        project_members:project_members(id,user_id,role)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Attach computed stats (channels count, members count) inline
    const enriched = await Promise.all(
      (data ?? []).map(async (project: any) => {
        const [chResult, memResult] = await Promise.all([
          supabaseAdmin.from('channels').select('id', { count: 'exact', head: true }).eq('project_id', project.id),
          supabaseAdmin.from('project_members').select('id', { count: 'exact', head: true }).eq('project_id', project.id),
        ])
        return {
          ...project,
          channel_count: chResult.count ?? 0,
          member_count: memResult.count ?? 0,
        }
      })
    )

    return NextResponse.json({ projects: enriched })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/projects — create a new project
export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { name, description, color } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 })
    }

    const project = {
      user_id: userId,
      name: name.trim(),
      description: description?.trim() ?? '',
      color: color ?? '#e8ff47',
      status: 'active',
    }

    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (error) throw error

    // Auto-add creator as owner
    await supabaseAdmin
      .from('project_members')
      .insert({ project_id: data.id, user_id: userId, role: 'owner' })

    // Auto-create #general channel
    await supabaseAdmin
      .from('channels')
      .insert({ project_id: data.id, name: 'general', description: 'General discussions', icon: '#', sort_order: 0 })

    return NextResponse.json({ project: { ...data, channel_count: 1, member_count: 1 } }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH /api/projects — update a project
export async function PATCH(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { id, name, description, color, status } = body

    if (!id) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }

    const updates: Record<string, any> = { updated_at: new Date().toISOString() }
    if (name !== undefined) updates.name = name.trim()
    if (description !== undefined) updates.description = description.trim()
    if (color !== undefined) updates.color = color
    if (status !== undefined) updates.status = status

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ project: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/projects — soft-delete a project
export async function DELETE(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })

    const { data: existing } = await supabaseAdmin
      .from('projects')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }

    const { error } = await supabaseAdmin
      .from('projects')
      .update({ status: 'deleted', updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
