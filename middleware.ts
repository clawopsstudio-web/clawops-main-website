import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export default clerkMiddleware(async (auth, req) => {
  const authObj = await auth()
  const userId = authObj.userId
  const pathname = req.nextUrl.pathname

  const isPublic =
    pathname === '/' ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth/') ||
    pathname === '/api/provision' ||
    pathname === '/api/test-contabo' ||
    pathname === '/api/provision-debug' ||
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

  const isService =
    pathname === '/n8n' ||
    pathname === '/chrome' ||
    pathname === '/n8n/' ||
    pathname === '/chrome/'

  if (isService) return NextResponse.next()

  if (!userId && !isPublic) {
    const loginUrl = new URL('/auth/login', req.url)
    return NextResponse.redirect(loginUrl)
  }

  const loginPage = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup")
  if (userId && loginPage) {
    const dashUrl = new URL("/dashboard", req.url)
    return NextResponse.redirect(dashUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)'],
}
