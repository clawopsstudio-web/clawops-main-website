import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUPABASE_PROJECT = 'dyzkfmdjusdyjmytgeah'

function decodeJWT(token: string): { sub: string; exp: number; ref: string; iss: string; email?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload
  } catch {
    return null
  }
}

function validateSupabaseJWT(token: string): { userId: string; email?: string } | null {
  const payload = decodeJWT(token)
  if (!payload) return null

  // Check expiration
  if (payload.exp && Date.now() >= payload.exp * 1000) return null

  // Check ref (project ID)
  if (payload.ref !== SUPABASE_PROJECT) return null

  // Check issuer
  if (!payload.iss || !payload.iss.includes('.supabase.co/auth/v1')) return null

  return { userId: payload.sub, email: payload.email }
}

function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  cookieString.split(';').forEach(cookie => {
    const [name, ...valueParts] = cookie.trim().split('=')
    if (name) {
      cookies[name] = decodeURIComponent(valueParts.join('='))
    }
  })
  return cookies
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host') || ''

  // ---- NO-CACHE HEADERS FOR AUTH ROUTES ----
  if (pathname === '/auth/callback' || pathname.startsWith('/auth/callback/')) {
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    response.headers.set('Surrogate-Control', 'no-store')
    return response
  }

  // Static files and API routes pass through (including Next.js static assets)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Parse all cookies from the request
  const cookieString = request.cookies.toString()
  const cookies = parseCookies(cookieString)
  const accessToken = cookies['sb-access-token']

  // ---- SERVICE ROUTES: /n8n, /chrome, /gateway ----
  // Validate Supabase JWT locally. If valid: proxy to service. If invalid: redirect to login.
  if (pathname === '/n8n' || pathname === '/n8n/' ||
      pathname === '/chrome' || pathname === '/chrome/' ||
      pathname === '/gateway' || pathname === '/gateway/') {

    if (!accessToken) {
      const loginUrl = new URL('/auth/login', `https://${host}`)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const user = validateSupabaseJWT(accessToken)
    if (!user) {
      const loginUrl = new URL('/auth/login', `https://${host}`)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Valid JWT — determine target service
    const targetPort = pathname.startsWith('/chrome') ? 5800 :
                       pathname.startsWith('/gateway') ? 18789 : 5678

    const url = new URL(request.url)
    const servicePath = url.pathname === '/' ? '' : url.pathname

    // Rewrite the URL to proxy to the service
    const newUrl = new URL(`http://127.0.0.1:${targetPort}${servicePath}`)
    newUrl.search = url.search

    const response = await fetch(newUrl.toString(), {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'X-Auth-User-Id': user.userId,
        'X-Auth-User-Email': user.email || '',
        'X-Forwarded-Host': host,
        'Cookie': cookieString,
      },
      body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
      redirect: 'manual',
      signal: undefined,
    } as RequestInit)

    const headers = new Headers(response.headers)
    headers.set('X-Auth-User-Id', user.userId)
    headers.set('X-Auth-User-Email', user.email || '')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }

  // Build a response we can mutate (add Set-Cookie headers)
  let response = NextResponse.next()

  const refreshToken = cookies['sb-refresh-token']

  // /dashboard without userId → redirect to /{userId}/dashboard
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    if (accessToken) {
      const user = validateSupabaseJWT(accessToken)
      if (user) {
        return NextResponse.redirect(
          new URL(`/${user.userId}/dashboard`, `https://${host}`)
        )
      }
    }
    return NextResponse.redirect(new URL('/auth/login', `https://${host}`))
  }

  // ---- URL NORMALIZATION: /{userId}/dashboard → /dashboard/{userId} ----
  const userDashMatch = pathname.match(/^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/dashboard(\?.*)?$/i)
  if (userDashMatch) {
    const userId = userDashMatch[1]
    const queryString = userDashMatch[2] || ''
    const newUrl = new URL(`/dashboard/${userId}${queryString}`, `https://${host}`)
    return NextResponse.redirect(newUrl)
  }

  // ---- SERVICE PAGES: /{userId}/n8n, /{userId}/chrome, /{userId}/metaclaw → /dashboard/{userId}/... ----
  const oldServiceMatch = pathname.match(/^\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/(n8n|chrome|metaclaw)(.*)$/i)
  if (oldServiceMatch) {
    const userId = oldServiceMatch[1]
    const service = oldServiceMatch[2]
    const rest = oldServiceMatch[3] || ''
    const newUrl = new URL(`/dashboard/${userId}/${service}${rest}`, `https://${host}`)
    return NextResponse.redirect(newUrl)
  }

  // ---- PROTECT /dashboard/{userId}/... routes ----
  if (pathname.startsWith('/dashboard/')) {
    if (!accessToken) {
      const loginUrl = new URL('/auth/login', `https://${host}`)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
    const user = validateSupabaseJWT(accessToken)
    if (!user) {
      const loginUrl = new URL('/auth/login', `https://${host}`)
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
    '/n8n',
    '/n8n/',
    '/chrome',
    '/chrome/',
    '/gateway',
    '/gateway/',
  ],
}
