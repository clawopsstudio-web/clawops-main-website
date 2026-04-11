import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const plan = searchParams.get('plan') || 'pro'
  const next = searchParams.get('next') || '/dashboard'

  console.log('[AUTH] Callback - origin:', origin, 'code:', !!code, 'next:', next)

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`)
  }

  // Create HTML redirect page
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="refresh" content="0;url=${next}?plan=${plan}">
  <title>Logging in...</title>
</head>
<body>
  <p>Logging you in...</p>
  <script>setTimeout(() => window.location.href = '${next}?plan=${plan}', 50)</script>
</body>
</html>`

  const response = new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
  })

  // SSR client that applies cookies to our response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          console.log('[AUTH] Setting', cookiesToSet.length, 'cookies')
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, {
              httpOnly: true,
              secure: true,
              sameSite: 'lax',
              path: '/',
              domain: undefined, // Let browser determine domain
              maxAge: options.maxAge,
            })
          })
        },
      },
    }
  )

  // Exchange code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    console.error('[AUTH] Error:', error?.message)
    return NextResponse.redirect(`${origin}/auth/login?error=callback_error`)
  }

  console.log('[AUTH] Success - user:', data.user?.email)

  // Explicitly set access token
  response.cookies.set('sb-access-token', data.session.access_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    domain: undefined,
    maxAge: 60 * 60 * 24 * 7,
  })

  response.cookies.set('sb-user-id', data.user.id, {
    httpOnly: false,
    secure: true,
    sameSite: 'lax',
    path: '/',
    domain: undefined,
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}