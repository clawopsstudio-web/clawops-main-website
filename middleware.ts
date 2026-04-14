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

  // ---- URL NORMALIZATION: /{userId}/dashboard → /dashboard/{userId} ----
  // This catches old-style URLs like /5dffe281-b8eb-459d-9110-1f5cee5df80f/dashboard
  // and redirects to /dashboard/5dffe281-b8eb-459d-9110-1f5cee5df80f
  const userDashMatch = pathname.match(/^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/dashboard(\?.*)?$/i)
  if (userDashMatch) {
    const userId = userDashMatch[1]
    const queryString = userDashMatch[2] || ''
    const newUrl = new URL(`/dashboard/${userId}${queryString}`, request.url)
    return NextResponse.redirect(newUrl)
  }

  // ---- SERVICE PAGES: /{userId}/n8n, /{userId}/chrome, /{userId}/metaclaw → /dashboard/{userId}/... ----
  // Also normalize old-style service URLs to the new /dashboard/{userId}/... pattern
  const oldServiceMatch = pathname.match(/^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/(n8n|chrome|metaclaw)(.*)$/i)
  if (oldServiceMatch) {
    const userId = oldServiceMatch[1]
    const service = oldServiceMatch[2]
    const rest = oldServiceMatch[3] || ''
    const newUrl = new URL(`/dashboard/${userId}/${service}${rest}`, request.url)
    return NextResponse.redirect(newUrl)
  }

  // ---- PROTECT /dashboard/{userId}/... routes ----
  if (pathname.startsWith('/dashboard/')) {
    if (!accessToken) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/auth/callback/:path*',
    '/dashboard/:path*',
    '/:uuid/dashboard/:path*',
    '/:uuid/:service(n8n|chrome|metaclaw|gateway)/:path*',
  ],
}
