/**
 * app/api/composio/status/route.ts — Check connection status for a user + app
 * GET ?clerkUserId=...&appName=...
 * Returns { connected: boolean, connectedAt: string | null }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getConnectionStatus, upsertConnection } from '@/lib/composio'
import { getAuth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = req.nextUrl
    const clerkUserId = searchParams.get('clerkUserId')
    const appName = searchParams.get('appName')

    if (!clerkUserId || !appName) {
      return NextResponse.json(
        { error: 'clerkUserId and appName query params required' },
        { status: 400 }
      )
    }

    // Security: only allow checking own connections
    if (userId !== clerkUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const status = await getConnectionStatus(clerkUserId, appName)

    // Upsert into user_connections table
    try {
      const supabaseAdmin = getSupabaseAdmin()
      await upsertConnection({
        supabaseAdmin,
        clerkUserId,
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
