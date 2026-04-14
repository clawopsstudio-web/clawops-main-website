import { NextRequest, NextResponse } from 'next/server'

const APP_URL = 'https://app.clawops.studio'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const next = searchParams.get('next')

  // PKCE flow: code comes in query string — exchange server-side
  if (code) {
    // Dynamically import to keep this route lightweight
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    if (authError || !data.session) {
      return NextResponse.redirect(new URL('/auth/login?error=session_error', APP_URL))
    }
    const dest = next || `/${data.session.user.id}/dashboard`
    const response = NextResponse.redirect(new URL(dest, APP_URL), 302)
    setCookies(response, data.session.access_token, data.session.refresh_token, data.session.user.id)
    return response
  }

  // Implicit flow (token in URL fragment): return HTML with inline JS.
  // The fragment is only visible to client-side JS — server never sees it.
  // The JS: reads token from hash, sets cookies + localStorage, redirects to dashboard.
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Signing in...</title>
</head>
<body style="font-family:system-ui,sans-serif;background:#04040c;color:white;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
  <div style="text-align:center">
    <div style="width:40px;height:40px;border:3px solid rgba(0,212,255,0.3);border-top-color:#00D4FF;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px"></div>
    <p style="color:rgba(255,255,255,0.6)">Completing sign-in...</p>
  </div>
  <style>@keyframes spin{to{transform:rotate(360deg)}}</style>
  <script type="module">
    import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
    
    const hash = window.location.hash
    const hashParams = new URLSearchParams(hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const queryError = new URLSearchParams(window.location.search).get('error')

    if (!accessToken) {
      // No token in fragment — redirect to login with error
      window.location.href = '/auth/login' + (queryError ? '?error=' + queryError : '?error=no_code')
      throw new Error('no_token')
    }

    // Decode JWT to get userId (sub claim)
    let userId = null
    try {
      const parts = accessToken.split('.')
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
      userId = payload.sub
    } catch (e) {}

    if (!userId) {
      window.location.href = '/auth/login?error=token_parse_error'
      throw new Error('bad_token')
    }

    // Set cookies (for Next.js middleware)
    // No Domain= attribute = current origin only. No leading dot needed.
    const cookie = (name, val, maxAge) =>
      document.cookie = name + '=' + val + '; Path=/; Max-Age=' + maxAge + '; SameSite=Lax; Secure'
    cookie('sb-access-token', accessToken, 3600)
    cookie('sb-refresh-token', refreshToken || accessToken, 604800)
    cookie('sb-user-id', userId, 604800)

    // Tell Supabase SDK about the session so it persists to localStorage
    try {
      const supabase = createClient(
        '${process.env.NEXT_PUBLIC_SUPABASE_URL}',
        '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}',
        { auth: { persistSession: true, autoRefreshToken: true } }
      )
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || accessToken
      })
    } catch (e) {
      console.error('Supabase setSession failed:', e)
    }

    // Navigate to dashboard (all cookies already set synchronously)
    window.location.href = '/' + userId + '/dashboard'
  <\/script>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
    },
  })
}

function setCookies(
  response: NextResponse,
  access_token: string,
  refresh_token: string,
  userId: string
) {
  const opts = {
    path: '/',
    sameSite: 'lax' as const,
    secure: true,
    httpOnly: false,
  }
  response.cookies.set('sb-access-token', access_token, { ...opts, maxAge: 3600 })
  response.cookies.set('sb-refresh-token', refresh_token, { ...opts, maxAge: 604800 })
  response.cookies.set('sb-user-id', userId, { ...opts, maxAge: 604800 })
}
