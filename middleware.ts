import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/pricing',
  '/about',
  '/agents',
  '/contact',
  '/autopilot',
]

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }

  // Protect all other routes
  const { userId } = await auth()
  if (!userId) {
    const signInUrl = new URL('/auth/login', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)'],
}
