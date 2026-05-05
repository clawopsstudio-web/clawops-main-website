/**
 * app/api/composio/mcp-config/route.ts
 * Configure Hermes to use Composio MCP tools
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { createServerClient } from '@/lib/supabase/server';
import { Composio } from '@composio/core';

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY!;

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { userId } = authResult;

  try {
    // Get user's connected tools from Composio
    const composio = new Composio({ apiKey: COMPOSIO_API_KEY });
    const session = await composio.create(userId);
    const { items: toolkits } = await session.toolkits();

    // Filter connected tools
    const connectedTools = toolkits
      .filter(t => t.connection?.isActive)
      .map(t => ({
        slug: t.slug,
        name: t.name,
        logo: t.logo,
      }));

    // Generate MCP server config for Hermes
    const mcpConfig = {
      mcpServers: {
        composio: {
          command: 'npx',
          args: ['-y', '@composio/core', 'execute', '--api-key', COMPOSIO_API_KEY],
        },
      },
    };

    return NextResponse.json({
      connectedTools,
      totalConnected: connectedTools.length,
      mcpConfig,
    });
  } catch (error) {
    console.error('Composio MCP config error:', error);
    return NextResponse.json(
      { error: 'Failed to get Composio tools' },
      { status: 500 }
    );
  }
}

/**
 * Get available Composio tools (not connected yet)
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;
  
  const { userId } = authResult;

  try {
    const body = await request.json();
    const { action, toolSlug } = body;

    if (action === 'connect' && toolSlug) {
      // Get OAuth URL for tool
      const composio = new Composio({ apiKey: COMPOSIO_API_KEY });
      const session = await composio.create(userId);
      
      const authRequest = await session.authorize(toolSlug, {
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/composio/callback`,
      });

      return NextResponse.json({
        redirectUrl: authRequest.redirectUrl,
      });
    }

    if (action === 'disconnect' && toolSlug) {
      // Find and disconnect
      const composio = new Composio({ apiKey: COMPOSIO_API_KEY });
      const session = await composio.create(userId);
      const { items } = await session.toolkits();
      
      const toolkit = items.find(t => t.slug === toolSlug);
      if (toolkit?.connection?.authConfig?.id) {
        await composio.connectedAccounts.delete(toolkit.connection.authConfig.id);
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Composio action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}
