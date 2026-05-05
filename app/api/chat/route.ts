/**
 * app/api/chat/route.ts
 * Send chat message to Hermes agent
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, verifyWorkspaceAccess } from '@/lib/auth-server';
import { createServerClient } from '@/lib/supabase/server';
import { HermesClient } from '@/lib/hermes';

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { userId } = authResult;

  try {
    const body = await request.json();
    const { workspaceId, agentId, message, sessionId } = body;

    if (!workspaceId || !message) {
      return NextResponse.json(
        { error: 'workspaceId and message are required' },
        { status: 400 }
      );
    }

    // Verify workspace access
    const hasAccess = await verifyWorkspaceAccess(userId, workspaceId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const supabase = createServerClient();

    // Get VPS instance
    const { data: vps } = await supabase
      .from('vps_instances')
      .select('hermes_url, hermes_token, id')
      .eq('workspace_id', workspaceId)
      .limit(1)
      .single();

    if (!vps) {
      return NextResponse.json(
        { error: 'No VPS connected to workspace' },
        { status: 404 }
      );
    }

    // Get agent if specified
    let profile = 'default';
    if (agentId) {
      const { data: agent } = await supabase
        .from('workspace_agents')
        .select('profile')
        .eq('id', agentId)
        .single();
      if (agent?.profile) {
        profile = agent.profile;
      }
    }

    // Create Hermes client
    let token = vps.hermes_token;
    if (!token) {
      const tempClient = new HermesClient(vps.hermes_url, '');
      token = await tempClient.getSessionToken();
    }

    const client = new HermesClient(vps.hermes_url, token);

    // Check if Hermes is healthy
    const isHealthy = await client.isHealthy();
    if (!isHealthy) {
      return NextResponse.json(
        { error: 'Hermes is not responding' },
        { status: 503 }
      );
    }

    // Send chat message and stream response
    const chunks: string[] = [];
    
    const hermesSessionId = await client.sendChatStream(
      message,
      (chunk) => chunks.push(chunk),
      sessionId
    );

    const fullResponse = chunks.join('');

    // Save to database
    // Create or update chat session
    let chatSessionId = sessionId;
    if (!chatSessionId && hermesSessionId) {
      const { data: newSession } = await supabase
        .from('chat_sessions')
        .insert({
          workspace_id: workspaceId,
          agent_id: agentId || null,
          hermes_session_id: hermesSessionId,
          title: message.slice(0, 50),
          last_message: message,
          message_count: 2,
        })
        .select()
        .single();
      
      if (newSession) {
        chatSessionId = newSession.id;
      }
    }

    // Save user message
    await supabase.from('chat_messages').insert({
      session_id: chatSessionId,
      role: 'user',
      content: message,
    });

    // Save assistant response
    await supabase.from('chat_messages').insert({
      session_id: chatSessionId,
      role: 'assistant',
      content: fullResponse,
    });

    // Update session
    if (chatSessionId) {
      const { data: existing } = await supabase
        .from('chat_sessions')
        .select('message_count')
        .eq('id', chatSessionId)
        .single();

      if (existing) {
        await supabase
          .from('chat_sessions')
          .update({
            last_message: message,
            message_count: (existing.message_count ?? 0) + 2,
          })
          .eq('id', chatSessionId);
      }
    }

    // Log activity
    await supabase.rpc('log_activity', {
      p_workspace_id: workspaceId,
      p_agent_id: agentId || null,
      p_type: 'chat',
      p_message: message.slice(0, 100),
      p_metadata: { hermes_session_id: hermesSessionId },
    });

    return NextResponse.json({
      response: fullResponse,
      session_id: chatSessionId,
      hermes_session_id: hermesSessionId,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to send message', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

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

  // Get chat sessions
  const { data: sessions, error } = await supabase
    .from('chat_sessions')
    .select(`
      *,
      workspace_agents (id, name, role, color)
    `)
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions });
}
