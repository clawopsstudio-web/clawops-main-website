/**
 * Custom Google OAuth callback — exchanges code directly with Google,
 * then creates/updates user via Supabase Admin API.
 * Completely bypasses Supabase GoTrue OAuth state management.
 */
import { NextResponse } from 'next/server'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || ''
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dyzkfmdjusdyjmytgeah.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const APP_URL = 'https://app.clawops.studio'
const CALLBACK_URL = 'https://app.clawops.studio/api/auth/google/callback'

// Decode Google ID token payload (base64url JSON)
function decodeJWTPayload(token: string): any {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = payload + '='.repeat((4 - payload.length % 4) % 4)
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  for (const cookie of cookieHeader.split(';')) {
    const [key, ...valParts] = cookie.trim().split('=')
    if (key) cookies[key] = valParts.join('=')
  }
  return cookies
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  if (error) {
    console.error('Google OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      APP_URL + '/auth/login?error=' + encodeURIComponent(error) + '&desc=' + encodeURIComponent(errorDescription || '')
    )
  }

  if (!code) {
    return NextResponse.redirect(APP_URL + '/auth/login?error=no_code')
  }

  // Read cookies
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = parseCookies(cookieHeader)
  const savedState = cookies['google_oauth_state']
  const codeVerifier = cookies['google_code_verifier']

  // Validate state
  if (!state || state !== savedState) {
    console.error('State mismatch:', { got: state, expected: savedState })
    return NextResponse.redirect(APP_URL + '/auth/login?error=state_mismatch')
  }

  if (!codeVerifier) {
    return NextResponse.redirect(APP_URL + '/auth/login?error=no_verifier')
  }

  // Exchange auth code for tokens with Google
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: CALLBACK_URL,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier,
      }),
    })

    const tokenData: any = await tokenRes.json()

    if (!tokenRes.ok) {
      console.error('Google token exchange failed:', tokenData)
      return NextResponse.redirect(APP_URL + '/auth/login?error=token_exchange_failed')
    }

    // Decode ID token to get user info
    const payload = decodeJWTPayload(tokenData.id_token)
    if (!payload) {
      return NextResponse.redirect(APP_URL + '/auth/login?error=invalid_id_token')
    }

    const email = payload.email
    const name = payload.name || email.split('@')[0]
    const googleUid = payload.sub

    if (!email) {
      return NextResponse.redirect(APP_URL + '/auth/login?error=no_email')
    }

    // Create or find user in Supabase via Admin API
    let userId: string | undefined = undefined
    let safeUserId: string = ''

    try {
      // Try to get user by email first - list all users and search
      const listRes = await fetch(
        SUPABASE_URL + '/auth/v1/admin/users?page=1&per_page=50',
        {
          headers: {
            'apikey': SERVICE_KEY,
            'Authorization': 'Bearer ' + SERVICE_KEY,
          },
        }
      )

      if (listRes.ok) {
        const listData: any = await listRes.json()
        console.error('User list status: ok, total users:', listData.users?.length)
        const existingUser = listData.users?.find((u: any) => u.email === email)
        if (existingUser) {
          userId = existingUser.id
          console.error('Found existing user:', userId)
        } else {
          console.error('User not found in list, will create new. Looking for:', email)
        }
      } else {
        const errText = await listRes.text()
        console.error('User list failed:', listRes.status, errText)
      }
    } catch (e) {
      console.error('Error finding user:', e)
    }

    // If user doesn't exist, create them
    if (!userId) {
      try {
        const createRes = await fetch(SUPABASE_URL + '/auth/v1/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SERVICE_KEY,
            'Authorization': 'Bearer ' + SERVICE_KEY,
          },
          body: JSON.stringify({
            email,
            email_confirm: true,
            user_metadata: {
              name,
              google_uid: googleUid,
              avatar_url: payload.picture || null,
              provider: 'google',
            },
          }),
        })

        if (createRes.ok) {
          const newUser: any = await createRes.json()
          userId = newUser.id
        } else {
          const errText = await createRes.text()
          console.error('User creation failed:', errText)
          // User might already exist via another flow — try to find by google_uid
          const tryAgain = await fetch(
            SUPABASE_URL + '/auth/v1/admin/users?page=1&per_page=10',
            {
              headers: {
                'apikey': SERVICE_KEY,
                'Authorization': 'Bearer ' + SERVICE_KEY,
              },
            }
          )
          if (tryAgain.ok) {
            const allUsers: any = await tryAgain.json()
            const match = allUsers.users?.find(
              (u: any) => u.user_metadata?.google_uid === googleUid
            )
            if (match) userId = match.id
          }
        }
      } catch (e) {
        console.error('Create user exception:', e)
      }
    }

    if (!userId) {
      return NextResponse.redirect(APP_URL + '/auth/login?error=user_creation_failed')
    }

    safeUserId = userId as string

    // Generate a custom JWT for the session (since we bypassed Supabase auth)
    // Create a session using the user's ID
    const sessionRes = await fetch(SUPABASE_URL + '/auth/v1/token?grant_type=id_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': 'Bearer ' + SERVICE_KEY,
      },
      body: JSON.stringify({
        id_token: tokenData.id_token,
        nonce: Math.random().toString(36),
      }),
    })

    let accessToken = tokenData.access_token
    let refreshToken = tokenData.refresh_token
    let expiresIn = tokenData.expires_in || 3600

    if (sessionRes.ok) {
      const sessionData: any = await sessionRes.json()
      accessToken = sessionData.access_token || accessToken
      refreshToken = sessionData.refresh_token || refreshToken
      expiresIn = sessionData.expires_in || expiresIn
      if (sessionData.user?.id) safeUserId = sessionData.user.id
    }

    // Set session cookies and redirect to dashboard
    const response = NextResponse.redirect(APP_URL + '/dashboard')

    response.cookies.set('sb-access-token', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn,
    })
    response.cookies.set('sb-refresh-token', refreshToken || 'google_refresh', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
    response.cookies.set('sb-user-id', safeUserId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: expiresIn,
    })

    // Clear OAuth cookies
    response.cookies.delete('google_code_verifier')
    response.cookies.delete('google_oauth_state')

    return response
  } catch (e: any) {
    console.error('Callback exception:', e)
    return NextResponse.redirect(APP_URL + '/auth/login?error=callback_exception')
  }
}
