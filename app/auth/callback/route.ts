import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const plan = searchParams.get('plan') || 'pro'
  const next = searchParams.get('next') || '/dashboard'

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url))
  }

  // Get the real origin — handle Vercel's proxy URL (Bug #3 fix)
  // Use x-forwarded-host header if present, otherwise fall back to the request origin
  const forwardedHost = request.headers.get('x-forwarded-host')
  const host = request.headers.get('host')
  const origin = forwardedHost ? `https://${forwardedHost}` : `https://${host}`

  // Async cookies from next/headers (Bug #2 fix — must be awaited in Next.js 15+)
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Write cookies through @supabase/ssr to the next/headers cookie store
          // This ensures proper cookie names (sb-{project-ref}-auth-token) and propagation
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, {
              httpOnly: options.httpOnly ?? true,
              secure: options.secure ?? true,
              sameSite: options.sameSite === 'none' ? 'none' : 'lax',
              path: options.path ?? '/',
              maxAge: options.maxAge,
              domain: options.domain,
            })
          })
        },
      },
    }
  )

  // Exchange OAuth code for session — @supabase/ssr will set the correct cookies via setAll
  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !session) {
    console.error('[AUTH] Callback error:', error?.message)
    return NextResponse.redirect(new URL('/auth/login?error=callback_error', request.url))
  }

  // Build redirect URL with correct origin
  const redirectUrl = new URL(next, origin)
  if (plan) redirectUrl.searchParams.set('plan', plan)

  console.log('[AUTH] Callback success for:', session.user?.email, '→', redirectUrl.toString())

  // Redirect to dashboard — cookies are already set in the cookie store by @supabase/ssr
  return NextResponse.redirect(redirectUrl)
}
