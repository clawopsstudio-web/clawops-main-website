import { NextResponse } from 'next/server'
import { createServerClient, parseCookieHeader } from '@supabase/ssr'

// External base URL — use explicit origin since request.url is the internal proxied URL
const BASE_URL = 'https://app.clawops.studio'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  // ✅ Call cookies() ONCE — reusing the same instance for getAll AND setAll
  // This is the single critical fix. Calling cookies() twice creates two separate stores.
  const cookieStore = await import('next/headers').then(m => m.cookies())
  const cookieHeader = request.headers.get('cookie') || ''

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(cookieHeader).map(c => ({ name: c.name, value: c.value ?? '' }))
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, {
              domain: '.app.clawops.studio',
              secure: true,
              sameSite: 'lax',
              httpOnly: true,
              path: '/',
              maxAge: options?.maxAge as number | undefined,
              ...(options as Record<string, unknown>),
            })
          }
        },
      },
    }
  )

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.session) {
      console.error('[AUTH CALLBACK] Exchange error:', error?.message)
      return NextResponse.redirect(new URL('/auth/login?error=exchange_failed', BASE_URL))
    }

    const destination = `/${data.session.user.id}/dashboard`
    console.log(`[AUTH CALLBACK] Success — redirecting to ${destination}`)
    return NextResponse.redirect(new URL(destination, BASE_URL))
  }

  // No code — check existing session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login?error=no_session', BASE_URL))
  }

  return NextResponse.redirect(new URL('/dashboard', BASE_URL))
}
