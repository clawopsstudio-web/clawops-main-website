// Middleware is disabled for testing
// import { createServerClient, type CookieOptions } from '@supabase/ssr'
// import { NextResponse, type NextRequest } from 'next/server'

// export async function middleware(request: NextRequest) {
//   return NextResponse.next()
// }

// export const config = {
//   matcher: ['/dashboard/:path*', '/auth/login', '/auth/signup', '/login', '/signup'],
// }

// Disabled - using mock auth for now
export function middleware() {
  return
}

export const config = {
  matcher: [],
}