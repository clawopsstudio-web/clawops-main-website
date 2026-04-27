/**
 * app/api/composio/oauth/callback/route.ts — OAuth proxy redirect
 *
 * Composio OAuth redirects here after user approves an app.
 * We forward ALL query params to Composio's backend as-is.
 * Composio completes the token exchange server-to-server.
 *
 * WHITE-LABEL: User never sees Composio in this flow.
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // Forward all query params to Composio backend
  const params = req.nextUrl.searchParams.toString()
  const composioCallbackUrl = `https://backend.composio.dev/oauth/callback${params ? `?${params}` : ''}`

  // 302 redirect — Composio handles the rest
  return NextResponse.redirect(composioCallbackUrl, { status: 302 })
}
