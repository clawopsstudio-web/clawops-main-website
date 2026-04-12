import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const plan = searchParams.get('plan') || 'pro'
  const next = searchParams.get('next') || '/dashboard'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
  }

  // Create the redirect response now — we'll attach all auth cookies to this
  const redirectUrl = new URL(next, origin)
  if (plan) redirectUrl.searchParams.set('plan', plan)
  const redirectResponse = NextResponse.redirect(redirectUrl)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Attach every cookie from @supabase/ssr to our redirect response
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, {
              httpOnly: options.httpOnly ?? true,
              secure: options.secure ?? true,
              sameSite: 'lax',
              path: options.path ?? '/',
              maxAge: options.maxAge,
            })
          })
        },
      },
    }
  )

  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !session) {
    console.error('[AUTH] Callback error:', error?.message)
    return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
  }

  // Also add explicit session marker cookies for our middleware
  redirectResponse.cookies.set('sb-access-token', session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  redirectResponse.cookies.set('sb-refresh-token', session.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  console.log('[AUTH] Callback success for:', session.user?.email, '→ redirecting to', next)
  return redirectResponse
}
