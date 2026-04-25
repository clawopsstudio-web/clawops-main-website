/**
 * app/api/composio/connect/route.ts — Initiate OAuth connection for a user
 * POST { clerkUserId, appName }
 * Returns { connectUrl: string }
 *
 * WHITE-LABEL: Never exposes "Composio" in response
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConnectLink } from '@/lib/composio'
import { getUserIdFromRequest } from '@/lib/auth-server'

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { appName } = await req.json()

    if (!appName) {
      return NextResponse.json(
        { error: 'appName is required' },
        { status: 400 }
      )
    }

    const redirectUri = "https://clawops.studio/dashboard/tools?connected=true"
    const connectUrl = await getConnectLink(userId, appName, redirectUri)

    return NextResponse.json({ connectUrl })
  } catch (err: any) {
    console.error('[composio/connect]', err?.message)
    return NextResponse.json(
      { error: 'Connection failed, please try again' },
      { status: 500 }
    )
  }
}
