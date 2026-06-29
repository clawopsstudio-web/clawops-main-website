/**
 * app/api/composio/catalog/route.ts
 * Get Composio tool catalog (850+ tools)
 */
import { NextRequest, NextResponse } from 'next/server';

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;
const COMPOSIO_API_URL = 'https://api.composio.dev/v2/tools/apps';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    // Build query params
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (category) {
      params.set('category', category);
    }

    // Fetch from Composio API
    const response = await fetch(`${COMPOSIO_API_URL}?${params}`, {
      headers: {
        'Authorization': `Bearer ${COMPOSIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Composio API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform to our format
    const tools = (data.items || []).map((tool: any) => ({
      id: tool.id || tool.toolName,
      name: tool.displayName || tool.name,
      slug: tool.toolName?.toLowerCase() || tool.id?.toLowerCase(),
      description: tool.description || '',
      logo: tool.logoUrl || null,
      category: tool.category || 'other',
      isNoAuth: tool.noAuth || false,
      docsUrl: tool.docsUrl || null,
      actions: tool.actions?.length || 0,
    }));

    // Filter by search if provided
    let filteredTools = tools;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTools = tools.filter((t: any) => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower) ||
        t.slug?.includes(searchLower)
      );
    }

    return NextResponse.json({
      tools: filteredTools,
      total: data.total || filteredTools.length,
      limit,
      offset,
      hasMore: offset + filteredTools.length < (data.total || filteredTools.length),
    });
  } catch (error) {
    console.error('Composio catalog error:', error);
    
    // Return fallback tools if API fails
    return NextResponse.json({
      tools: getFallbackTools(),
      total: 17,
      limit,
      offset,
      hasMore: false,
      source: 'fallback',
    });
  }
}

function getFallbackTools() {
  return [
    { id: 'gmail', name: 'Gmail', slug: 'gmail', description: 'Send and receive emails', category: 'communication', isNoAuth: false },
    { id: 'googlecalendar', name: 'Google Calendar', slug: 'googlecalendar', description: 'Manage calendar events', category: 'productivity', isNoAuth: false },
    { id: 'github', name: 'GitHub', slug: 'github', description: 'Manage repositories and issues', category: 'development', isNoAuth: false },
    { id: 'notion', name: 'Notion', slug: 'notion', description: 'Read and write to Notion', category: 'productivity', isNoAuth: false },
    { id: 'slack', name: 'Slack', slug: 'slack', description: 'Send messages to Slack', category: 'communication', isNoAuth: false },
    { id: 'hubspot', name: 'HubSpot', slug: 'hubspot', description: 'CRM for sales pipeline', category: 'crm', isNoAuth: false },
    { id: 'salesforce', name: 'Salesforce', slug: 'salesforce', description: 'Salesforce CRM integration', category: 'crm', isNoAuth: false },
    { id: 'jira', name: 'Jira', slug: 'jira', description: 'Project management', category: 'productivity', isNoAuth: false },
    { id: 'linear', name: 'Linear', slug: 'linear', description: 'Issue tracking', category: 'productivity', isNoAuth: false },
    { id: 'stripe', name: 'Stripe', slug: 'stripe', description: 'Payment processing', category: 'payments', isNoAuth: false },
    { id: 'shopify', name: 'Shopify', slug: 'shopify', description: 'E-commerce platform', category: 'ecommerce', isNoAuth: false },
    { id: 'zendesk', name: 'Zendesk', slug: 'zendesk', description: 'Customer support', category: 'support', isNoAuth: false },
    { id: 'intercom', name: 'Intercom', slug: 'intercom', description: 'Customer messaging', category: 'communication', isNoAuth: false },
    { id: 'twitter', name: 'Twitter/X', slug: 'twitter', description: 'Post tweets and manage account', category: 'social', isNoAuth: false },
    { id: 'linkedin', name: 'LinkedIn', slug: 'linkedin', description: 'Professional networking', category: 'social', isNoAuth: false },
    { id: 'figma', name: 'Figma', slug: 'figma', description: 'Design collaboration', category: 'design', isNoAuth: false },
    { id: 'postgres', name: 'PostgreSQL', slug: 'postgres', description: 'Database operations', category: 'database', isNoAuth: false },
  ];
}
