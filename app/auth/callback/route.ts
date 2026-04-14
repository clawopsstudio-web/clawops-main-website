import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const next = searchParams.get('next')

  console.log('[Auth Callback Route]', { code: code?.substring(0, 15), error, next })

  // Handle OAuth errors
  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?error=${error}`, request.url))
  }

  // Must have a code
  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url))
  }

  // Exchange code for session
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)

  if (authError || !data.session) {
    console.error('[Auth Callback] Exchange failed:', authError?.message)
    return NextResponse.redirect(new URL(`/auth/login?error=session_error`, request.url))
  }

  const { access_token, refresh_token } = data.session
  const userId = data.session.user.id

  console.log('[Auth Callback] Session OK for user:', userId)

  // Redirect destination
  const dest = next || `/${userId}/dashboard`

  // Create redirect response WITH cookies set
  const response = NextResponse.redirect(new URL(dest, request.url), 302)

  // Set auth cookies on the response
  response.cookies.set('sb-access-token', access_token, {
    path: '/',
    maxAge: 3600,
    domain: '.app.clawops.studio',
    sameSite: 'lax',
    secure: true,
    httpOnly: false, // needs to be readable by client-side JS AND middleware
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

  console.log('[Auth Callback] Redirecting to:', dest)
  return response
}
