/**
 * app/api/composio/connect/route.ts — Initiate Composio OAuth connection
 *
 * Accepts: POST { clerk_user_id, app_name }
 * Returns: { connect_url: string }
 *
 * WHITE-LABEL RULES:
 * - Never expose "Composio" in API response
 * - App names mapped to display names in response
 */

import { NextRequest, NextResponse } from 'next/server'
import { ComposioToolSet } from 'composio-core'

function env(key: string): string {
  const val = process.env[key]
  if (!val) throw new Error(`Missing env var: ${key}`)
  return val
}

// Display name mapping (never expose "composio" in frontend-facing responses)
const APP_DISPLAY_NAMES: Record<string, string> = {
  GMAIL: 'Gmail',
  SLACK: 'Slack',
  NOTION: 'Notion',
  HUBSPOT: 'HubSpot',
  SALESFORCE: 'Salesforce',
  HUBSPOT_CRM: 'HubSpot',
  GOOGLEDRIVE: 'Google Drive',
  GITHUB: 'GitHub',
  JIRA: 'Jira',
  ASANA: 'Asana',
}

export async function POST(req: NextRequest) {
  try {
    const { clerk_user_id, app_name } = await req.json()

    if (!clerk_user_id || !app_name) {
      return NextResponse.json({ error: 'clerk_user_id and app_name required' }, { status: 400 })
    }

    const apiKey = env('COMPOSIO_API_KEY')
    const toolset = new ComposioToolSet({ apiKey })
    const entity = toolset.getEntity({ id: clerk_user_id })

    const displayName = APP_DISPLAY_NAMES[app_name.toUpperCase()] ?? app_name

    const connection = await entity.initiateConnection({
      appName: app_name,
      redirectUrl: 'https://connect.clawops.studio/oauth/callback',
    })

    return NextResponse.json({
      connect_url: connection.redirectUrl,
      app: displayName,
      status: 'pending',
    })
  } catch (err: any) {
    console.error('[composio/connect]', err?.message)
    return NextResponse.json({ error: 'Failed to initiate connection' }, { status: 500 })
  }
}
