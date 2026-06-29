/**
 * GET /api/chat/threads
 * Returns all threads for the authenticated user.
 * Auth: Supabase session cookie
 */
import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get or create workspace for this user
  let { data: workspaces } = await supabaseAdmin
    .from('workspaces')
    .select('id')
    .eq('workspace_user_id', userId)
    .limit(1)

  let workspaceId: string

  if (!workspaces || workspaces.length === 0) {
    // Create workspace on first access
    const { data: newWs, error } = await supabaseAdmin
      .from('workspaces')
      .insert({ workspace_user_id: userId, name: 'My Workspace' })
      .select('id')
      .single()

    if (error || !newWs) {
      console.error('[chat/threads] Failed to create workspace:', error)
      return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 })
    }
    workspaceId = newWs.id
  } else {
    workspaceId = workspaces[0].id
  }

  // Get all threads for this workspace
  const { data: threads, error } = await supabaseAdmin
    .from('chat_threads')
    .select(`
      id,
      agent_id,
      title,
      created_at,
      chat_messages (
        content,
        created_at
      )
    `)
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[chat/threads] Failed to fetch threads:', error)
    return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 })
  }

  // Transform: get last message preview and time for each thread
  const result = (threads ?? []).map((t: any) => {
    const msgs = t.chat_messages ?? []
    // Sort messages by created_at descending to get the latest
    const sorted = msgs.slice().sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    const lastMsg = sorted[0]
    return {
      id: t.id,
      agent_id: t.agent_id,
      title: t.title ?? 'New conversation',
      created_at: t.created_at,
      last_message: lastMsg?.content?.slice(0, 60) ?? '',
      last_time: lastMsg?.created_at ?? t.created_at,
    }
  })

  return NextResponse.json({ threads: result, workspaceId })
}
