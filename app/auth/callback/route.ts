import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const APP_URL = 'https://app.clawops.studio'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const next = searchParams.get('next')

  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?error=${encodeURIComponent(error)}`, APP_URL))
  }

  if (!code) {
    // No code — check if there's a token in the fragment (handled client-side)
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Signing in...</title></head>
<body style="font-family:system-ui,sans-serif;background:#04040c;color:white;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
<div style="text-align:center"><div style="width:40px;height:40px;border:3px solid rgba(0,212,255,0.3);border-top-color:#00D4FF;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px"></div><p style="color:rgba(255,255,255,0.6)">Completing sign-in...</p></div>
<style>@keyframes spin{to{transform:rotate(360deg)}}</style>
<script type="module">
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
const hash = window.location.hash, params = new URLSearchParams(hash.substring(1))
const token = params.get('access_token'), refresh = params.get('refresh_token')
if (!token) { window.location.href='/auth/login?error=no_token'; throw new Error('no_token') }
let userId = null
try { const p = JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))); userId = p.sub } catch(e) {}
if (!userId) { window.location.href='/auth/login?error=bad_token'; throw new Error('bad_token') }
const ck = (n,v,a) => document.cookie = n+'='+v+'; Path=/; Max-Age='+a+'; SameSite=Lax; Secure'
ck('sb-access-token', token, 3600)
ck('sb-refresh-token', refresh||token, 604800)
ck('sb-user-id', userId, 604800)
const supabase = createClient('${process.env.NEXT_PUBLIC_SUPABASE_URL}','${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}',{auth:{persistSession:true}})
await supabase.auth.setSession({access_token:token, refresh_token:refresh||token})
window.location.href='/dashboard/'+userId
<\/script></body></html>`
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-store',
      },
    })
  }

  // PKCE: exchange code for session using @supabase/ssr pattern
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
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, {
                path: '/',
                maxAge: name === 'sb-access-token' ? 3600 : 604800,
                sameSite: 'lax',
                secure: true,
                httpOnly: false,
                ...options,
              })
            })
          } catch {
            // Ignore errors from multiple set attempts
          }
        },
      },
    }
  )

  const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)

  if (authError || !data.session) {
    console.error('[auth/callback] PKCE exchange error:', authError?.message || 'no session')
    return NextResponse.redirect(new URL('/auth/login?error=session_error', APP_URL))
  }

  const userId = data.session.user.id
  const dest = next || `/dashboard/${userId}`

  // @supabase/ssr has set the session cookies via our adapter.
  // Create the redirect response — Next.js will include the Set-Cookie headers
  // from our cookieStore in the response.
  const response = NextResponse.redirect(new URL(dest, APP_URL), 302)

  console.log('[auth/callback] PKCE success →', dest)
  return response
}
