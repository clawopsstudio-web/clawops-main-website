import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

interface SetCookie {
  name: string
  value: string
  options?: Record<string, unknown>
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ---- NO-CACHE HEADERS FOR AUTH ROUTES ----
  // Auth callback must NEVER be cached — it processes dynamic OAuth codes
  if (pathname === '/auth/callback' || pathname.startsWith('/auth/callback/')) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    return response
  }

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

  // Parse cookies manually (no external dependency needed for simple cookie read)
  const cookieHeader = request.cookies.toString()
  const cookies: Record<string, string> = {}
  cookieHeader.split(';').forEach(cookie => {
    const [name, ...valueParts] = cookie.trim().split('=')
    if (name) {
      cookies[name] = valueParts.join('=')
    }
  })

  const accessToken = cookies['sb-access-token']
  const refreshToken = cookies['sb-refresh-token']

  // /dashboard without userId → redirect to /{userId}/dashboard
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    if (accessToken) {
      return NextResponse.redirect(
        new URL(`/${cookies['sb-user-id']}/dashboard`, request.url)
      )
    }
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // /{userId}/dashboard routes — protect with auth
  const dashboardMatch = pathname.match(/^\/[0-9a-f-]{36}\/dashboard/)
  if (dashboardMatch && !accessToken) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: [
    '/auth/callback/:path*',
    '/dashboard/:path*',
    '/:uuid/dashboard/:path*',
  ],
}
