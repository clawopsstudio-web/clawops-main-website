import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/settings']

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/auth/login', '/auth/signup', '/login', '/signup']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if user has auth cookies (set by Supabase callback)
  const supabaseAuthCookie = request.cookies.get('sb-access-token')
  const hasSession = !!supabaseAuthCookie?.value

  // Protect dashboard routes
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect auth routes to dashboard if already logged in
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route))
  if (isAuthRoute && hasSession) {
    const redirectTo = request.nextUrl.searchParams.get('redirect') || '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/auth/login',
    '/auth/signup',
    '/login',
    '/signup',
  ],
}
