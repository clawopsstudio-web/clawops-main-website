import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const APP_URL = 'https://app.clawops.studio'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const next = searchParams.get('next')

  console.log('[Auth Callback]', {
    hasCode: !!code,
    codePrefix: code?.substring(0, 10),
    error,
    next,
  })

  // Handle OAuth errors from Supabase
  if (error) {
    console.log('[Auth Callback] OAuth error:', error)
    return NextResponse.redirect(new URL(`/auth/login?error=${error}`, APP_URL))
  }

  // Must have a code
  if (!code) {
    console.log('[Auth Callback] No code in URL — redirect to login')
    return NextResponse.redirect(new URL('/auth/login?error=no_code', APP_URL))
  }

  // Exchange the code for a session
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)

  if (authError || !data.session) {
    console.error('[Auth Callback] Code exchange failed:', authError?.message)
    return NextResponse.redirect(new URL('/auth/login?error=session_error', APP_URL))
  }

  const { access_token, refresh_token } = data.session
  const userId = data.session.user.id

  console.log('[Auth Callback] Session created for user:', userId)

  // Determine redirect destination
  const dest = next || `/${userId}/dashboard`
  const redirectUrl = new URL(dest, APP_URL)

  // Create the redirect response
  const response = NextResponse.redirect(redirectUrl, 302)

  // Set auth cookies on the response so middleware can read them
  response.cookies.set('sb-access-token', access_token, {
    path: '/',
    maxAge: 3600,
    domain: '.app.clawops.studio',
    sameSite: 'lax',
    secure: true,
    httpOnly: false,
  })
  response.cookies.set('sb-refresh-token', refresh_token, {
    path: '/',
    maxAge: 604800,
    domain: '.app.clawops.studio',
    sameSite: 'lax',
    secure: true,
    httpOnly: false,
  })
  response.cookies.set('sb-user-id', userId, {
    path: '/',
    maxAge: 604800,
    domain: '.app.clawops.studio',
    sameSite: 'lax',
    secure: true,
    httpOnly: false,
  })

  console.log('[Auth Callback] Redirecting to:', redirectUrl.toString())
  return response
}
