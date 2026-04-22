/**
 * app/api/composio/connect/route.ts — Initiate OAuth connection for a user
 * POST { clerkUserId, appName }
 * Returns { connectUrl: string }
 *
 * WHITE-LABEL: Never exposes "Composio" in response
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConnectLink } from '@/lib/composio'
import { getAuth } from '@clerk/nextjs/server'

export async function POST(req: NextRequest) {
  try {
    // Verify authenticated session
    const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { clerkUserId, appName } = await req.json()

    if (!clerkUserId || !appName) {
      return NextResponse.json(
        { error: 'clerkUserId and appName are required' },
        { status: 400 }
      )
    }

    // Security: ensure the authenticated user matches the requested clerkUserId
    if (userId !== clerkUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const connectUrl = await getConnectLink(clerkUserId, appName)

    return NextResponse.json({ connectUrl })
  } catch (err: any) {
    console.error('[composio/connect]', err?.message)
    return NextResponse.json(
      { error: 'Connection failed, please try again' },
      { status: 500 }
    )
  }
}
