/**
 * middleware.ts
 * Supabase session-based auth — replaces Clerk proxy
 *
 * Protects /dashboard/* routes.
 * Allows: /, /auth/*, /api/webhooks/*, /api/provision, /start
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/callback',
  '/start',
  '/pricing',
  '/about',
  '/contact',
]

const PUBLIC_API_PATHS = [
  '/api/webhooks',
  '/api/provision',
  '/api/auth/signup',
  '/api/auth/login',
  '/api/composio/callback',
  '/api/composio/status',
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next()
  }
  if (PUBLIC_API_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Create Supabase client from request cookies
  let supabaseResponse = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          req.cookies.set({ name, value })
          supabaseResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          req.cookies.set({ name, value: '', ...options })
          supabaseResponse.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect /dashboard/* — redirect to login
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect_url', pathname)
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  // Protect /api/* that need auth (but not public API paths)
  if (pathname.startsWith('/api/')) {
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return supabaseResponse
  }

  // Root → redirect to dashboard if logged in, else login
  if (pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
