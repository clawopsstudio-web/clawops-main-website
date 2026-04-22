/**
 * app/api/composio/status/route.ts — Check connected apps for a user
 *
 * Accepts: GET ?clerk_user_id=xxx
 * Returns: [{ app: "Gmail", status: "connected" | "disconnected" }, ...]
 *
 * WHITE-LABEL RULES:
 * - Never expose "Composio" in response
 * - App names mapped to display names
 */

import { NextRequest, NextResponse } from 'next/server'
import { ComposioToolSet } from 'composio-core'

function env(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing env var: ${key}`)
  return val
}

const APP_DISPLAY_NAMES: Record<string, string> = {
  GMAIL: 'Gmail',
  SLACK: 'Slack',
  NOTION: 'Notion',
  HUBSPOT: 'HubSpot',
  HUBSPOT_CRM: 'HubSpot',
  SALESFORCE: 'Salesforce',
  GOOGLEDRIVE: 'Google Drive',
  GITHUB: 'GitHub',
  JIRA: 'Jira',
  ASANA: 'Asana',
}

export async function GET(req: NextRequest) {
  try {
    const clerkUserId = req.nextUrl.searchParams.get('clerk_user_id')
    if (!clerkUserId) {
      return NextResponse.json({ error: 'clerk_user_id required' }, { status: 400 })
    }

    const apiKey = env('COMPOSIO_API_KEY')
    const toolset = new ComposioToolSet({ apiKey })
    const entity = toolset.getEntity({ id: clerkUserId })

    const connectedApps = await entity.getConnections()
    const mapped = (connectedApps ?? []).map((conn: any) => ({
      app: APP_DISPLAY_NAMES[conn.app_name?.toUpperCase()] ?? conn.app_name ?? 'Unknown',
      status: conn.status === 'active' || conn.status === 'approved' ? 'connected' : 'disconnected',
      connectedAt: conn.created_at ?? null,
    }))

    return NextResponse.json({ connections: mapped })
  } catch (err: any) {
    console.error('[composio/status]', err?.message)
    // Don't expose Composio errors to frontend
    return NextResponse.json({ connections: [] })
  }
}
