import { NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dyzkfmdjusdyjmytgeah.supabase.co'
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const APP_URL = 'https://app.clawops.studio'
const CLIENT_ID = '537927390913-jlnn289abd2kant0eg3kvu30677usfh7.apps.googleusercontent.com'

// PKCE helpers
function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function generateRandomString(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return base64urlEncode(array.buffer as ArrayBuffer)
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64urlEncode(digest as ArrayBuffer)
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      `${APP_URL}/auth/login?error=${encodeURIComponent(error)}`
    )
  }

  // Generate PKCE + state
  const state = generateRandomString(32)
  const codeVerifier = generateRandomString(64)
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // Build Supabase OAuth URL
  const oauthUrl = new URL(`${SUPABASE_URL}/auth/v1/authorize`)
  oauthUrl.searchParams.set('provider', 'google')
  oauthUrl.searchParams.set('client_id', CLIENT_ID)
  oauthUrl.searchParams.set('redirect_to', `${APP_URL}/api/auth/callback`)
  oauthUrl.searchParams.set('response_type', 'code')
  oauthUrl.searchParams.set('code_challenge', codeChallenge)
  oauthUrl.searchParams.set('code_challenge_method', 'S256')
  oauthUrl.searchParams.set('state', state)

  // Redirect to Supabase
  const response = NextResponse.redirect(oauthUrl.toString())

  // Store verifier + state in HttpOnly cookies (not accessible to JS)
  response.cookies.set('pkce_verifier', codeVerifier, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 300, // 5 minutes
  })
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 300,
  })

  return response
}
