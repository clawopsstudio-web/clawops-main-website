/**
 * app/api/tools/connect/route.ts
 * POST /api/tools/connect
 * Body: { appName: string }
 * Returns: { connectUrl: string } - OAuth redirect URL from Composio
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { getOAuthRedirectUrl } from '@/lib/composio'

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromRequest(req)
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { appName } = await req.json()

    if (!appName) {
      return NextResponse.json({ error: 'appName is required' }, { status: 400 })
    }

    const connectUrl = await getOAuthRedirectUrl(userId, appName)

    return NextResponse.json({ connectUrl })
  } catch (err: any) {
    console.error('[tools/connect]', err.message)
    return NextResponse.json(
      { error: err.message || 'Failed to get connection URL' },
      { status: 500 }
    )
  }
}
