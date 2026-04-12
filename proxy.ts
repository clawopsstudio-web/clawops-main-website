import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Create Supabase client using @supabase/ssr — handles cookie names automatically
  // @supabase/ssr uses: sb-{project-ref}-auth-token
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // In middleware we can't set cookies directly, but @supabase/ssr's
          // getUser() will still work — it uses the request cookies
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
        },
      },
    }
  )

  // Validate the session via getUser() — this is the authoritative check
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('[MIDDLEWARE] Auth error:', error.message)
  }

  // Protected routes: require authentication
  const protectedPrefixes = ['/dashboard', '/settings']
  const isProtected = protectedPrefixes.some(prefix => pathname.startsWith(prefix))

  if (isProtected && !user) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Let all other requests through (including auth pages — no redirect loops)
  return NextResponse.next()
}

// Match only routes that need auth checks — exclude static assets and auth pages
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    // Do NOT match /auth/* here — causes loops when user is already logged in
  ],
}
