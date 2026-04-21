import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * OAuth callback handler for connect.clawops.studio/oauth/callback
 * 
 * Flow:
 * 1. Composio redirects here with ?code=...&state=...
 * 2. We exchange the code for an access token via Composio API
 * 3. We store the connection in Supabase
 * 4. We redirect the user to their dashboard
 */

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY || ''
const COMPOSIO_BASE_URL = 'https://backend.composio.dev'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent(errorDescription || error)}`, req.url)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/auth/login?error=missing_params', req.url))
  }

  try {
    // Parse state to get user info (state contains redirect_url and connection_type)
    let redirectTo = '/dashboard'
    let connectionType = ''

    try {
      const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
      redirectTo = stateData.redirect_url || '/dashboard'
      connectionType = stateData.connection_type || ''
    } catch {
      // State parsing failed, use defaults
    }

    // Exchange code for access token via Composio API
    const tokenRes = await fetch(`${COMPOSIO_BASE_URL}/oauth/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': COMPOSIO_API_KEY,
      },
      body: JSON.stringify({ code }),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('Composio token exchange failed:', errText)
      return NextResponse.redirect(
        new URL(`/auth/login?error=oauth_exchange_failed`, req.url)
      )
    }

    const tokenData = await tokenRes.json()

    // Store the connection in Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const userId = stateData?.user_id || null
    if (userId) {
      await supabase.from('user_connections').upsert({
        user_id: userId,
        connection_type: connectionType,
        access_token: tokenData.access_token || null,
        refresh_token: tokenData.refresh_token || null,
        expires_at: tokenData.expires_at ? new Date(tokenData.expires_at).toISOString() : null,
        metadata: tokenData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,connection_type' })
    }

    // Redirect to the intended page
    return NextResponse.redirect(new URL(redirectTo, req.url))

  } catch (err) {
    console.error('OAuth callback error:', err)
    return NextResponse.redirect(
      new URL('/auth/login?error=callback_error', req.url)
    )
  }
}
