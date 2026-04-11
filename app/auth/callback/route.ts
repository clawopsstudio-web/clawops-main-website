import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const plan = searchParams.get('plan') || 'pro'

  console.log('[AUTH] Callback received, code:', !!code)

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
  }

  // Build the final redirect URL explicitly to /dashboard
  const redirectUrl = new URL(`${origin}/dashboard`)
  if (plan) redirectUrl.searchParams.set('plan', plan)
  
  // Create response - we'll add cookies to this
  let response = NextResponse.redirect(redirectUrl)

  // Create SSR client with explicit cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Set cookies on both request (for reading) and response (for returning)
          cookiesToSet.forEach(({ name, value, options }) => {
            // Update request cookies
            request.cookies.set(name, value)
            // Set on response with explicit, compatible options
            response.cookies.set(name, value, {
              httpOnly: true,
              secure: true,
              sameSite: 'lax',
              path: '/',
              maxAge: options.maxAge,
            })
          })
        },
      },
    }
  )

  // Wait for the auth state to change (this triggers cookie setting)
  await new Promise<void>((resolve) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      console.log('[AUTH] State change:', event)
      if (event === 'SIGNED_IN') {
        subscription.unsubscribe()
        resolve()
      }
    })
    // Safety timeout
    setTimeout(resolve, 5000)
  })

  // Now do the exchange
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    console.error('[AUTH] Exchange error:', error?.message)
    return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
  }

  console.log('[AUTH] Session created, user:', data.user?.email)

  // Explicitly set the access token as a fallback cookie
  if (data.session.access_token) {
    response.cookies.set('sb-access-token', data.session.access_token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })
  }

  return response
}