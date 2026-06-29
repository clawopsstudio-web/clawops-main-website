/**
 * app/api/composio/status/route.ts — Check connection status for a user + app
 * GET ?clerkUserId=...&appName=...
 * Returns { connected: boolean, connectedAt: string | null }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConnectionStatus, upsertConnection } from '@/lib/composio'
import { getUserIdFromRequest } from '@/lib/auth-server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const appName = searchParams.get('appName')

    if (!appName) {
      return NextResponse.json(
        { error: 'appName query param required' },
        { status: 400 }
      )
    }

    const status = await getConnectionStatus(userId, appName)

    // Upsert into user_connections table
    try {
      const supabaseAdmin = getSupabaseAdmin()
      await upsertConnection({
        supabaseAdmin,
        clerkUserId: userId,
        appName,
        connected: status.connected,
        connectedAccountId: status.connectedAccountId,
        connectedAt: status.connectedAt,
      })
    } catch (dbErr) {
      console.error('[composio/status] DB upsert failed:', dbErr)
      // Non-fatal — still return status
    }

    return NextResponse.json({
      connected: status.connected,
      connectedAt: status.connectedAt,
    })
  } catch (err: any) {
    console.error('[composio/status]', err?.message)
    return NextResponse.json(
      { error: 'Failed to check connection status' },
      { status: 500 }
    )
  }
}
