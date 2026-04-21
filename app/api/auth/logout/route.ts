import { NextResponse } from 'next/server'

// Clerk logout is handled client-side via <SignOutButton> or useSignOut hook
// This API route clears any server-side session and redirects
export async function POST() {
  return NextResponse.redirect(new URL('/auth/login', 'https://app.clawops.studio'))
}
