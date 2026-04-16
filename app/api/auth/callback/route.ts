import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dyzkfmdjusdyjmytgeah.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const state = url.searchParams.get('state')

  if (error) {
    return NextResponse.redirect(new URL('/auth/login?error=' + encodeURIComponent(error), request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login?error=no_code', request.url))
  }

  // Get PKCE verifier from cookie
  const cookieStore = await cookies()
  const verifier = cookieStore.get('pkce_verifier')?.value
  const savedState = cookieStore.get('oauth_state')?.value

  if (!verifier) {
    console.error('No PKCE verifier found in cookies')
    return NextResponse.redirect(new URL('/auth/login?error=no_verifier', request.url))
  }

  // Validate state if present
  if (state && savedState && state !== savedState) {
    console.error('OAuth state mismatch')
    return NextResponse.redirect(new URL('/auth/login?error=state_mismatch', request.url))
  }

  try {
    // Exchange auth code for session tokens using PKCE
    const tokenRes = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=pkce', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ auth_code: code, code_verifier: verifier }),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('Token exchange failed:', errText)
      return NextResponse.redirect(new URL('/auth/login?error=token_failed', request.url))
    }

    const session = await tokenRes.json()
    if (!session.access_token || !session.user) {
      console.error('No session in token response:', JSON.stringify(session).substring(0, 200))
      return NextResponse.redirect(new URL('/auth/login?error=no_session', request.url))
    }

    const userId = session.user.id
    const accessToken = session.access_token
    const refreshToken = session.refresh_token || ''
    const expiresIn = session.expires_in || 3600

    // Clear PKCE cookies
    const clearCookieOpts = { path: '/', sameSite: 'lax' as const, secure: true, domain: '.clawops.studio', maxAge: 0 }

    const redirectUrl = '/dashboard/' + userId
    const response = NextResponse.redirect(new URL(redirectUrl, request.url), 302)

    response.cookies.set('sb-access-token', accessToken, {
      maxAge: expiresIn, path: '/', sameSite: 'lax', secure: true, domain: '.clawops.studio',
    })
    if (refreshToken) {
      response.cookies.set('sb-refresh-token', refreshToken, {
        maxAge: 604800, path: '/', sameSite: 'lax', secure: true, domain: '.clawops.studio',
      })
    }
    response.cookies.set('sb-user-id', userId, {
      maxAge: 604800, path: '/', sameSite: 'lax', secure: true, domain: '.clawops.studio',
    })
    // Clear PKCE cookies
    response.cookies.set('pkce_verifier', '', { ...clearCookieOpts })
    response.cookies.set('oauth_state', '', { ...clearCookieOpts })

    return response
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('Callback error:', msg)
    return NextResponse.redirect(new URL('/auth/login?error=callback_error', request.url))
  }
}
