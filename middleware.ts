import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function middleware(request: NextRequest) {
  // If Supabase is not configured, skip auth entirely
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          supabaseResponse = NextResponse.next({ request })
          supabaseResponse.cookies.set({ name, value: '', ...options })
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()
    const { pathname } = request.nextUrl

    if (pathname.startsWith('/dashboard')) {
      if (!user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('next', pathname)
        return NextResponse.redirect(url)
      }
    }

    if (user && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
      const next = request.nextUrl.searchParams.get('next') || '/dashboard'
      const url = request.nextUrl.clone()
      url.pathname = next
      url.searchParams.delete('next')
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  } catch {
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
