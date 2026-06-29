import { NextRequest, NextResponse } from 'next/server'
import { parseOAuthCallback } from '@/lib/composio'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const result = parseOAuthCallback(url)

  if (result.status === 'success' && result.connectedAccountId) {
    // Redirect to tools page with success flag
    return NextResponse.redirect(
      'https://clawops.studio/dashboard/tools?connected=true&account=' + result.connectedAccountId
    )
  }

  // Failed — redirect with error
  return NextResponse.redirect(
    'https://clawops.studio/dashboard/tools?error=auth_failed'
  )
}