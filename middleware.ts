import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname

  // Public routes — accessible without auth
  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') || // API routes handle their own auth
    pathname.startsWith('/legal/') ||
    pathname === '/pricing' ||
    pathname === '/about' ||
    pathname === '/contact' ||
    pathname === '/agents' ||
    pathname === '/autopilot' ||
    pathname === '/how-it-works' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/roles' ||
    pathname.startsWith('/roles/') ||
    pathname === '/use-cases' ||
    pathname === '/integrations' ||
    pathname === '/company' ||
    pathname === '/quick-start' ||
    pathname.includes('.')

  if (isPublic) return NextResponse.next()

  // Service routes — no auth needed
  const isService = pathname === '/n8n' || pathname === '/chrome'
  if (isService) return NextResponse.next()

  // Use Clerk's native protect() — redirects to signInUrl if not authenticated
  // This is the correct Clerk v6 pattern instead of manual userId checks
  const { userId, redirectToSignIn } = await auth()
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: `${req.url}` })
  }

  // Logged in but on login/signup page → go to dashboard
  const loginPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/signup')
  if (loginPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)'],
}
