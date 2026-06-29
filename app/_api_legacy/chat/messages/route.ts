/**
 * GET /api/chat/messages
 * Query params: threadId=xxx
 * Returns all messages for the specified thread.
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

  const { searchParams } = new URL(req.url)
  const threadId = searchParams.get('threadId')

  if (!threadId) {
    return NextResponse.json({ error: 'threadId is required' }, { status: 400 })
  }

  // Verify the thread belongs to this user's workspace
  const { data: thread, error: threadError } = await supabaseAdmin
    .from('chat_threads')
    .select('id, workspace_id, agent_id')
    .eq('id', threadId)
    .single()

  if (threadError || !thread) {
    return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
  }

  // Verify workspace ownership
  const { data: workspace } = await supabaseAdmin
    .from('workspaces')
    .select('id')
    .eq('id', thread.workspace_id)
    .eq('workspace_user_id', userId)
    .single()

  if (!workspace) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Fetch messages for this thread
  const { data: messages, error } = await supabaseAdmin
    .from('chat_messages')
    .select('id, agent_id, role, content, created_at')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[chat/messages] Failed to fetch messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }

  return NextResponse.json({
    messages: messages ?? [],
    agent_id: thread.agent_id,
  })
}
