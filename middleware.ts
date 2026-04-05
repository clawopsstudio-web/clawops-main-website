// ============================================================================
// ClawOps Studio — Auth Middleware
// Phase 1 MVP
// ============================================================================
// NOTE: This is a stub. Full implementation requires real Supabase auth
// integration with real JWT secret. For Phase 1, auth state is managed
// client-side via Zustand (see lib/store.ts).
//
// In Phase 2, replace with actual Supabase middleware:
//   import { createServerClient } from '@supabase/ssr'
//   import { type NextRequest, NextResponse } from 'next/server'
//
// Protected routes pattern:
//   /dashboard/* → requires auth session
//   /onboarding → requires auth but no existing session
//   /login, /signup → redirect if already authenticated
// ============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/settings'];

// Routes only for unauthenticated users
const AUTH_ROUTES = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // NOTE: Real implementation would check for a Supabase auth cookie here.
  // For Phase 1, we rely on client-side auth guard in the dashboard layout.
  // This middleware is a placeholder for the Phase 2 real auth integration.

  // Example pattern for Phase 2:
  // const supabase = createServerClient(...)
  // const { data: { session } } = await supabase.auth.getSession()
  // if (!session && PROTECTED_ROUTES.some(r => pathname.startsWith(r))) {
  //   return NextResponse.redirect(new URL('/login', request.url))
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
