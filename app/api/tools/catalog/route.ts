/**
 * app/api/tools/catalog/route.ts
 * GET /api/tools/catalog
 * Returns: { tools: [{ id, name, slug, category, description, icon }], source: 'composio' | 'fallback' }
 * Fetches from Composio if available, falls back to featured tools
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'

// Fallback tools when Composio is unavailable
const FALLBACK_TOOLS = [
  { slug: 'gmail',       name: 'Gmail',       category: 'Email',        description: 'Send and receive emails via Gmail',               icon: '📧' },
  { slug: 'google-calendar', name: 'Google Calendar', category: 'Productivity', description: 'Manage calendar events and schedules',        icon: '📅' },
  { slug: 'google-drive', name: 'Google Drive',    category: 'Productivity', description: 'Access and manage files in Google Drive',      icon: '📁' },
  { slug: 'google-sheets', name: 'Google Sheets', category: 'Productivity', description: 'Read and write spreadsheet data',              icon: '📊' },
  { slug: 'slack',       name: 'Slack',       category: 'Messaging',   description: 'Send messages to Slack channels and DMs',         icon: '💬' },
  { slug: 'telegram',    name: 'Telegram',    category: 'Messaging',   description: 'Send and receive Telegram messages',               icon: '✈️' },
  { slug: 'discord',     name: 'Discord',     category: 'Messaging',   description: 'Post messages to Discord channels via webhooks',   icon: '🎮' },
  { slug: 'whatsapp',    name: 'WhatsApp',    category: 'Messaging',   description: 'Send WhatsApp Business messages',                icon: '📱' },
  { slug: 'github',      name: 'GitHub',      category: 'Dev',         description: 'Manage repos, issues, PRs, and workflows',        icon: '🐙' },
  { slug: 'gitlab',      name: 'GitLab',      category: 'Dev',         description: 'CI/CD pipelines and repo management',             icon: '🦊' },
  { slug: 'notion',      name: 'Notion',      category: 'Docs',        description: 'Read and write Notion pages and databases',       icon: '📓' },
  { slug: 'hubspot',     name: 'HubSpot',     category: 'CRM',         description: 'CRM contacts, deals, and automation',              icon: '🔶' },
  { slug: 'salesforce',  name: 'Salesforce',  category: 'CRM',         description: 'Manage Salesforce leads and opportunities',        icon: '☁️' },
  { slug: 'jira',        name: 'Jira',        category: 'Project Mgmt', description: 'Create and track Jira issues and sprints',        icon: '🗃️' },
  { slug: 'linear',      name: 'Linear',      category: 'Project Mgmt', description: 'Streamlined issue tracking for software teams',   icon: '📐' },
  { slug: 'asana',       name: 'Asana',       category: 'Project Mgmt', description: 'Team tasks and project management',              icon: '✅' },
  { slug: 'trello',      name: 'Trello',      category: 'Project Mgmt', description: 'Kanban boards and task lists',                  icon: '📋' },
  { slug: 'shopify',     name: 'Shopify',      category: 'E-Commerce',  description: 'Manage orders, products, and customers',        icon: '🛒' },
  { slug: 'stripe',      name: 'Stripe',       category: 'Payments',    description: 'Payment processing and subscription management',  icon: '💳' },
  { slug: 'intercom',    name: 'Intercom',    category: 'Support',     description: 'Customer chat and support automation',            icon: '💬' },
  { slug: 'zendesk',     name: 'Zendesk',      category: 'Support',    description: 'Ticket management and customer support',         icon: '🎧' },
  { slug: 'sendgrid',    name: 'SendGrid',     category: 'Email',      description: 'Transactional and marketing emails',             icon: '✉️' },
  { slug: 'mailchimp',   name: 'Mailchimp',    category: 'Email',      description: 'Email marketing campaigns and automation',         icon: '📧' },
  { slug: 'twilio',      name: 'Twilio',       category: 'SMS',         description: 'Send SMS and voice calls',                       icon: '📞' },
  { slug: 'airtable',    name: 'Airtable',     category: 'Database',    description: 'Low-code database and app platform',            icon: '🗄️' },
  { slug: 'postgres',    name: 'PostgreSQL',   category: 'Database',    description: 'Direct SQL database operations',                 icon: '🐘' },
  { slug: 'firebase',    name: 'Firebase',     category: 'Dev',         description: 'Auth, Firestore, and cloud functions',           icon: '🔥' },
  { slug: 'aws',         name: 'AWS',          category: 'Cloud',       description: 'EC2, S3, Lambda, and other AWS services',        icon: '☁️' },
  { slug: 'youtube',     name: 'YouTube',      category: 'Social',      description: 'Manage videos, comments, and channels',          icon: '▶️' },
  { slug: 'twitter',    name: 'Twitter/X',    category: 'Social',      description: 'Post tweets and manage social presence',         icon: '𝕏' },
]

// Featured tools shown at the top
const FEATURED_TOOL_SLUGS = ['gmail', 'github', 'hubspot', 'notion', 'slack', 'telegram', 'stripe', 'salesforce']

export interface CatalogTool {
  id: string
  slug: string
  name: string
  category: string
  description: string
  icon: string
  isFeatured: boolean
}

async function fetchFromComposio(): Promise<CatalogTool[] | null> {
  const apiKey = process.env.COMPOSIO_API_KEY
  if (!apiKey) {
    console.error('[tools/catalog] COMPOSIO_API_KEY not set')
    return null
  }

  try {
    // Use the correct API path discovered from SDK tracing: /api/v3/toolkits
    const res = await fetch('https://backend.composio.dev/api/v3/toolkits?limit=250', {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error(`[tools/catalog] Composio API error: ${res.status}`, text.slice(0, 200))
      return null
    }

    const data = await res.json()
    const items = data.items ?? data.toolkits ?? []

    return items.map((item: any) => {
      const name = item.name ?? 'Unknown'
      const slug = item.slug?.toLowerCase() ?? name.toLowerCase().replace(/[^a-z0-9]/g, '')
      const meta = item.meta ?? {}
      const categories = meta.categories ?? []
      const category = categories[0]?.name ?? categories[0]?.id ?? 'Integration'
      const description = meta.description ?? `Connect ${name} to enable agent actions`
      const logo = meta.logo ?? null

      return {
        id: slug,
        slug,
        name,
        category: category.charAt(0).toUpperCase() + category.slice(1),
        description,
        icon: logo ?? '🔗',
        isFeatured: FEATURED_TOOL_SLUGS.includes(slug),
      }
    })
  } catch (err: any) {
    console.error('[tools/catalog] Composio fetch error:', err?.message ?? err)
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    // Optional: auth check
    await getUserIdFromRequest(req)

    const { searchParams } = req.nextUrl
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featuredOnly = searchParams.get('featured') === 'true'

    // Try Composio first
    let tools = await fetchFromComposio()
    let source: 'composio' | 'fallback' = 'composio'

    if (!tools) {
      // Fallback to static list
      tools = FALLBACK_TOOLS.map(t => ({
        id: t.slug,
        slug: t.slug,
        name: t.name,
        category: t.category,
        description: t.description,
        icon: t.icon,
        isFeatured: FEATURED_TOOL_SLUGS.includes(t.slug),
      }))
      source = 'fallback'
    }

    // Apply filters
    let filtered = tools

    if (featuredOnly) {
      filtered = filtered.filter(t => t.isFeatured)
    }

    if (category && category !== 'All') {
      filtered = filtered.filter(t =>
        t.category.toLowerCase().includes(category.toLowerCase())
      )
    }

    if (search) {
      const q = search.toLowerCase()
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      )
    }

    // Extract unique categories
    const categories = ['All', ...new Set(tools.map(t => t.category).filter(Boolean))]

    return NextResponse.json({
      tools: filtered,
      total: filtered.length,
      source,
      categories,
    })
  } catch (err: any) {
    console.error('[tools/catalog]', err)
    return NextResponse.json(
      { error: 'Failed to fetch tool catalog', detail: err.message },
      { status: 500 }
    )
  }
}
