import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, parseCookieHeader } from '@supabase/ssr'

interface CookieHeader {
  name: string
  value: string
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Static files and API routes pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Build a response we can mutate (add Set-Cookie headers)
  let response = NextResponse.next()

  // Build cookie interface from Next.js request/response
  const cookieStore = {
    getAll(): CookieHeader[] {
      return parseCookieHeader(request.cookies.toString()).map(c => ({
        name: c.name,
        value: c.value ?? '',
      }))
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, {
          domain: '.app.clawops.studio',
          secure: true,
          sameSite: 'lax',
          httpOnly: true,
          path: '/',
          ...options,
        })
      })
    },
  }

  // Create Supabase client with this cookie store
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieStore }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // /dashboard without userId → redirect to /{userId}/dashboard
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    if (session) {
      return NextResponse.redirect(
        new URL(`/${session.user.id}/dashboard`, request.url)
      )
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // /{userId}/dashboard routes — protect with auth
  const dashboardMatch = pathname.match(/^\/[0-9a-f-]{36}\/dashboard/)
  if (dashboardMatch && !session) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/:uuid/dashboard/:path*',
  ],
}
