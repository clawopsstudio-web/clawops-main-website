import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Auth check using cookies only (no Supabase in Edge runtime)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, skip auth check
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  // Try to get user from Supabase session cookie
  const accessToken = request.cookies.get('sb-access-token')?.value
  const userId = request.cookies.get('sb-user-id')?.value

  const isAuthenticated = !!(accessToken && userId)

  // Protect /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redirect logged-in users away from auth pages
  if (isAuthenticated && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
    const next = request.nextUrl.searchParams.get('next') || '/dashboard'
    const url = request.nextUrl.clone()
    url.pathname = next
    url.searchParams.delete('next')
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
