/**
 * middleware.ts
 * Supabase session-based auth — subdomain routing + admin dashboard protection
 *
 * - Subdomain routing: {slug}.app.clawops.studio → rewrites to /workspace/[slug]
 * - Admin-only /dashboard (userId: 5a1f1a65-b620-46dc-879d-c67e69ba0c04)
 * - Non-admin users hitting /dashboard → redirect to their subdomain workspace
 * - Public paths bypass auth
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const ADMIN_USER_ID = '5a1f1a65-b620-46dc-879d-c67e69ba0c04'

// Static public page paths (prefix match)
const PUBLIC_PATHS = [
  '/',
  '/auth',
  '/start',
  '/pricing',
  '/how-it-works',
  '/use-cases',
  '/roles',
  '/integrations',
]

// Public API paths (prefix match)
const PUBLIC_API_PATHS = [
  '/api/webhooks',
  '/api/provision',
  '/api/auth',
  '/api/composio/callback',
  '/api/checkout',
  '/api/admin/seed',
]

// Root → redirect logged-in users to dashboard, else to login
function handleRoot(req: NextRequest, userId: string | null): NextResponse {
  if (userId) {
    // Logged-in: go to personal workspace subdomain if not admin,
    // otherwise admin dashboard
    const target = userId === ADMIN_USER_ID ? '/dashboard' : '/'
    return NextResponse.redirect(new URL(target, req.url))
  }
  return NextResponse.redirect(new URL('/auth/login', req.url))
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hostname = req.headers.get('host') ?? ''

  // ── Subdomain detection ──────────────────────────────────────────────────
  // Match: {slug}.app.clawops.studio
  const subdomainMatch = hostname.match(/^(.+)\.app\.clawops\.studio$/i)
  if (subdomainMatch) {
    const slug = subdomainMatch[1]
    const url = req.nextUrl.clone()
    // Rewrite keeps browser URL but serves from /workspace/[slug]
    url.pathname = `/workspace/${slug}`
    const response = NextResponse.rewrite(url)
    // Set cookie so the workspace page knows the slug
    response.cookies.set('workspace_slug', slug, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
    })
    return response
  }

  // ── Public paths — bypass auth ────────────────────────────────────────────
  if (
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/')) ||
    PUBLIC_API_PATHS.some(p => pathname.startsWith(p))
  ) {
    return NextResponse.next()
  }

  // ── Root path ─────────────────────────────────────────────────────────────
  if (pathname === '/') {
    // Get user to decide redirect (reuse Supabase client below)
    const supabaseResponse = NextResponse.next()
    const supabase = createSupabaseClient(req, supabaseResponse)
    const { data: { user } } = await supabase.auth.getUser()
    return handleRoot(req, user?.id ?? null)
  }

  // ── Create Supabase client for auth checks ────────────────────────────────
  let supabaseResponse = NextResponse.next()
  const supabase = createSupabaseClient(req, supabaseResponse)
  const { data: { user } } = await supabase.auth.getUser()
  const userId: string | null = user?.id ?? null

  // ── /dashboard protection — admin only ───────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!userId) {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/login'
      url.searchParams.set('redirect_url', pathname)
      return NextResponse.redirect(url)
    }
    // Only admin can access /dashboard
    if (userId !== ADMIN_USER_ID) {
      // Non-admin users should go to their workspace subdomain
      // Look up their slug from the workspace_slug cookie, or redirect to home
      const slug = req.cookies.get('workspace_slug')?.value
      if (slug) {
        return NextResponse.redirect(new URL(`https://${slug}.app.clawops.studio`, req.url))
      }
      return NextResponse.redirect(new URL('/', req.url))
    }
    return supabaseResponse
  }

  // ── Protected /api/* routes ────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return supabaseResponse
  }

  // ── All other routes — require auth ───────────────────────────────────────
  if (!userId) {
    const url = req.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirect_url', pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

function createSupabaseClient(req: NextRequest, supabaseResponse: NextResponse) {
  return createServerClient(
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
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
