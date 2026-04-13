import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = url.searchParams.get('next') || '/dashboard'

  if (!code) {
    // No code — check existing session
    const cookieStore = await import('next/headers').then(m => m.cookies())
    const supabase = await createClient(cookieStore)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return NextResponse.redirect(new URL(next, request.url))
  }

  // Exchange code for session — sets httpOnly cookies via @supabase/ssr
  const cookieStore = await import('next/headers').then(m => m.cookies())
  const supabase = await createClient(cookieStore)
  const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !session) {
    console.error('[AUTH CALLBACK] Error:', error?.message)
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Redirect to user-scoped dashboard
  const destination = `https://app.clawops.studio/${session.user.id}/dashboard/`
  return NextResponse.redirect(new URL(destination))
}
