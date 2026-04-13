import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Intercept /dashboard (with or without trailing slash) on www/apex
  // Redirect to app.clawops.studio preserving the path
  if (pathname === '/dashboard' || pathname === '/dashboard/') {
    return NextResponse.redirect(
      new URL('/dashboard/', 'https://app.clawops.studio'),
      307
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/dashboard/'],
}
