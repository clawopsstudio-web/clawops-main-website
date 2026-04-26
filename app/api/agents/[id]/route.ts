import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) throw error
    if (!data) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    return NextResponse.json({ agent: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { name, role, description, system_prompt, provider, model_id, temperature, max_tokens, sync_status, tools, status, channels, personality, language } = body

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('agents')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existing) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.name = name
    if (role !== undefined) updateData.role = role
    if (description !== undefined) updateData.description = description
    if (system_prompt !== undefined) updateData.system_prompt = system_prompt
    if (provider !== undefined) updateData.provider = provider
    if (model_id !== undefined) updateData.model_id = model_id
    if (temperature !== undefined) updateData.temperature = temperature
    if (max_tokens !== undefined) updateData.max_tokens = max_tokens
    if (sync_status !== undefined) updateData.sync_status = sync_status
    if (tools !== undefined) updateData.tools = tools
    if (status !== undefined) updateData.status = status
    if (channels !== undefined) updateData.channels = channels
    if (personality !== undefined) updateData.personality = personality
    if (language !== undefined) updateData.language = language

    const { data, error } = await supabaseAdmin
      .from('agents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ agent: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    // Verify ownership
    const { data: existing } = await supabaseAdmin
      .from('agents')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existing) return NextResponse.json({ error: 'Agent not found' }, { status: 404 })

    const { error } = await supabaseAdmin
      .from('agents')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
