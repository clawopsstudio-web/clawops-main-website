import { NextRequest, NextResponse } from 'next/server'

// Public marketing-site middleware.
// Supabase auth has been removed from the public funnel so the website can build
// and run without Supabase environment variables.
export function middleware(req: NextRequest) {
  const hostname = req.headers.get('host') ?? ''

  // Keep legacy workspace subdomain support, but do not require Supabase auth.
  // {slug}.app.clawops.studio → /workspace/[slug]
  const subdomainMatch = hostname.match(/^(.+)\.app\.clawops\.studio$/i)
  if (subdomainMatch) {
    const slug = subdomainMatch[1]
    const url = req.nextUrl.clone()
    url.pathname = `/workspace/${slug}`

    const response = NextResponse.rewrite(url)
    response.cookies.set('workspace_slug', slug, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
    })
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
