import { NextResponse } from 'next/server'
import { createServerClient, parseCookieHeader, serializeCookieHeader } from '@supabase/ssr'

interface ParsedCookie {
  name: string
  value: string
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  // Single cookie store for entire handler — this is the critical fix
  // Calling cookies() twice creates TWO separate stores; client writes to one, session reads from the other
  const cookieStore = await import('next/headers').then(m => m.cookies())

  // Read raw cookie header from the actual incoming request
  const cookieHeader = request.headers.get('cookie') || ''

  // Create server client using the SAME cookieStore instance throughout
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll(): ParsedCookie[] {
          const parsed = parseCookieHeader(cookieHeader)
          return parsed.map(c => ({ name: c.name, value: c.value ?? '' }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try {
              cookieStore.set(name, value, {
                ...options,
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

    // Direct to user-specific dashboard to avoid extra redirect step
    const destination = `/${data.session.user.id}/dashboard`
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
