import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const plan = searchParams.get('plan') || 'pro'
  const next = searchParams.get('next') || '/dashboard'

  // If no code, redirect to login with error
  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
  }

  // Create Supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
        },
      },
    }
  )

  // Exchange code for session
  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !session) {
    console.error('[AUTH] Callback error:', error?.message)
    return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
  }

  // Create response and set cookies on it
  const redirectUrl = new URL(next, origin)
  redirectUrl.searchParams.set('plan', plan)

  const response = NextResponse.redirect(redirectUrl)

  // Set auth cookies on the response (from the session)
  response.cookies.set('sb-access-token', session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  response.cookies.set('sb-refresh-token', session.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  response.cookies.set('supabase-auth-token', JSON.stringify([session.access_token, session.refresh_token]), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  console.log('[AUTH] Callback success for:', session.user?.email)
  return response
}
