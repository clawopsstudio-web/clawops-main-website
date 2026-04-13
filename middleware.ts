import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Intercept /dashboard (without trailing slash) → redirect to app domain
  if (pathname === '/dashboard') {
    return NextResponse.redirect(
      new URL('/auth/login', 'https://app.clawops.studio'),
      307
    )
  }

  // Intercept /dashboard/ (with trailing slash) → redirect to app domain
  // The client-side code will handle auth check and forward to correct userId
  if (pathname === '/dashboard/') {
    return NextResponse.redirect(
      new URL('/auth/login', 'https://app.clawops.studio'),
      307
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/dashboard/'],
}
