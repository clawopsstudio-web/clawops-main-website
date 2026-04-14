import { NextResponse } from 'next/server'
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || `/${request.headers.get('x-user-id') || ''}/dashboard`

  // Single cookie store for entire handler — this is the critical fix
  // Calling cookies() twice creates TWO separate stores; client writes to one, session reads from the other
  const cookieStore = await import('next/headers').then(m => m.cookies())

  // Build request headers from actual incoming request for cookie reading
  const requestHeaders = new Headers(request.headers)
  const cookieHeader = requestHeaders.get('cookie') || ''

  // Create server client using the SAME cookieStore instance throughout
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(cookieHeader)
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, {
                ...options,
                // Explicit domain so cookies persist on app.clawops.studio
                domain: '.app.clawops.studio',
                secure: true,
                sameSite: 'lax',
                httpOnly: true,
                path: '/',
              } as Parameters<typeof cookieStore.set>[1])
            } catch {
              // Can fail in some server contexts — suppress
            }
          })
        },
      },
    }
  )

  if (code) {
    // Exchange OAuth code for session — this sets cookies via setAll()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.session) {
      console.error('[AUTH CALLBACK] Exchange error:', error?.message)
      return NextResponse.redirect(new URL('/auth/login?error=auth_callback_failed', request.url))
    }

    // Build redirect back to dashboard
    const destination = `/dashboard`
    const redirectUrl = new URL(destination, request.url)

    // Build response with explicit Set-Cookie headers from the cookie store
    const response = NextResponse.redirect(redirectUrl)

    // Manually extract all cookies set by the server client and add to redirect response
    // This ensures cookies are in the Set-Cookie header of the redirect
    for (const cookie of cookieStore.getAll()) {
      const serialized = serializeCookieHeader(cookie.name, cookie.value, {
        domain: '.app.clawops.studio',
        secure: true,
        sameSite: 'lax',
        httpOnly: true,
        path: '/',
        maxAge: cookie.value ? 34560000 : undefined,
      })
      response.headers.append('Set-Cookie', serialized)
    }

    return response
  }

  // No code — check if user has an existing session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
