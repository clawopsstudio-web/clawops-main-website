import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const cookies = request.cookies.getAll()

  // DEBUG: Log all requests to auth routes
  if (pathname.startsWith('/auth') || pathname === '/' || pathname.startsWith('/dashboard')) {
    console.log('[PROXY DEBUG]', pathname, 'cookies:', cookies.map(c => c.name).join(', ') || 'none')
  }

  // TEMPORARY: Let ALL requests through — disable auth protection for debugging
  // Remove this return and uncomment auth logic below once we confirm the routing works
  return NextResponse.next()

  // --- AUTH LOGIC (disabled for debug) ---
  /*
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options ?? {})
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  console.log('[PROXY] pathname:', pathname, 'user:', user?.email || 'none')

  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/settings')
  const isAuthRoute = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup')

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
  */
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
