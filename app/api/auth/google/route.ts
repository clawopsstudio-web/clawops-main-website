import { NextResponse } from 'next/server'

// PKCE OAuth flow: browser -> our server -> Supabase -> Google
// We handle PKCE generation server-side, browser only talks to our domain + Google
// Browser NEVER directly reaches Supabase (only Supabase's OAuth server via Google redirect)

function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  for (let i = 0; i < 32; i++) array[i] = Math.floor(Math.random() * 256)
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function GET() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dyzkfmdjusdyjmytgeah.supabase.co'
  // IMPORTANT: This must match the URL Supabase redirects to AFTER it processes Google's callback
  // We want Supabase to redirect to our /api/auth/callback route
  const REDIRECT_TO = encodeURIComponent('https://app.clawops.studio/api/auth/callback')
  const CODE_VERIFIER = generateCodeVerifier()
  const CODE_CHALLENGE = await generateCodeChallenge(CODE_VERIFIER)
  const STATE = Math.random().toString(36).substring(2) + Date.now().toString(36)

  const authorizeUrl = SUPABASE_URL + '/auth/v1/authorize?' + [
    'provider=google',
    'redirect_to=' + REDIRECT_TO,
    'code_challenge=' + CODE_CHALLENGE,
    'code_challenge_method=S256',
    'state=' + STATE,
  ].join('&')

  console.log('Initiating PKCE OAuth flow')
  console.log('Redirect to:', REDIRECT_TO)

  const response = NextResponse.redirect(authorizeUrl, 302)
  // Store code_verifier in a short-lived cookie (no explicit domain = current host only)
  response.cookies.set('pkce_verifier', CODE_VERIFIER, {
    maxAge: 600,
    path: '/api/auth/callback',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
  })
  response.cookies.set('oauth_state', STATE, {
    maxAge: 600,
    path: '/api/auth/callback',
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
  })
  return response
}
