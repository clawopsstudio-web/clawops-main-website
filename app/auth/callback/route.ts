import { NextResponse } from 'next/server'
import { createServerClient, parseCookieHeader } from '@supabase/ssr'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  // Single cookie store instance — critical fix for the double-cookies() bug
  const cookieStore = await import('next/headers').then(m => m.cookies())

  // Build a response helper that can carry cookies forward
  type ResponseLike = {
    cookies: {
      get(name: string): string | undefined
      getAll(): Array<{ name: string; value: string }>
      set(name: string, value: string, options?: Record<string, unknown>): void
    }
  }

  // In-memory cookie store that persists across the handler
  const memCookies: Array<{ name: string; value: string; opts: Record<string, unknown> }> = []

  const memCookieStore: Parameters<typeof createServerClient>[2]['cookies'] = {
    getAll() {
      // Merge incoming request cookies with ones we've set in this handler
      const requestCookies = parseCookieHeader(request.headers.get('cookie') || '')
        .map(c => ({ name: c.name, value: c.value ?? '' }))
      const memCookieMap = new Map(memCookies.map(c => [c.name, c]))
      const merged = [...requestCookies]
      for (const mc of memCookies) {
        if (!merged.find(c => c.name === mc.name)) {
          merged.push({ name: mc.name, value: mc.value })
        }
      }
      return merged
    },
    setAll(cookiesToSet) {
      for (const cookie of cookiesToSet) {
        const existing = memCookies.findIndex(c => c.name === cookie.name)
        const opts = {
          domain: '.app.clawops.studio',
          secure: true,
          sameSite: 'lax' as const,
          httpOnly: true,
          path: '/',
          ...(cookie.options as Record<string, unknown>),
        }
        if (existing >= 0) {
          memCookies[existing] = { name: cookie.name, value: cookie.value, opts }
        } else {
          memCookies.push({ name: cookie.name, value: cookie.value, opts })
        }
      }
    },
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: memCookieStore }
  )

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error || !data.session) {
      console.error('[AUTH CALLBACK] Exchange error:', error?.message)
      return NextResponse.redirect(new URL('/auth/login?error=auth_callback_failed', request.url))
    }

    // Redirect directly to user-specific dashboard
    const destination = `/${data.session.user.id}/dashboard`
    const response = NextResponse.redirect(new URL(destination, request.url))

    // Apply all cookies set during exchange to the redirect response
    for (const cookie of memCookies) {
      response.cookies.set(cookie.name, cookie.value, {
        domain: '.app.clawops.studio',
        secure: true,
        sameSite: 'lax',
        httpOnly: true,
        path: '/',
        maxAge: 34560000,
      })
    }

    return response
  }

  // No code — check existing session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
